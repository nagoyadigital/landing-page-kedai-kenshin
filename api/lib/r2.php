<?php
/**
 * api/lib/r2.php
 * Cloudflare R2 client minimal (S3-compatible) tanpa dependency.
 * Hanya memakai extensi PHP bawaan: curl + openssl (AWS SigV4).
 *
 * Desain:
 *   - Satu Interface perilaku: kenshin_r2_upload($bytes, $key, $contentType)
 *                              kenshin_r2_delete($key)
 *                              kenshin_r2_public_url($key)
 *   - Semua nilai rahasia dibaca dari environment/.env (lihat config.php).
 *   - Jika kredensial belum diisi, modul ini menolak dengan pesan jelas
 *     (caller tetap jalan dengan adapter local).
 */

require_once __DIR__ . '/config.php';

function kenshin_r2_enabled() {
    if (kenshin_storage_driver() !== 'r2') return false;
    return kenshin_env('R2_ACCOUNT_ID') !== ''
        && kenshin_env('R2_ACCESS_KEY_ID') !== ''
        && kenshin_env('R2_SECRET_ACCESS_KEY') !== ''
        && kenshin_env('R2_BUCKET') !== '';
}

function kenshin_r2_public_base() {
    $custom = rtrim(kenshin_env('R2_PUBLIC_BASE_URL', ''), '/');
    if ($custom !== '') return $custom;

    // Fallback: endpoint publik bawaan R2 (perlu diaktifkan di dashboard)
    $account = kenshin_env('R2_ACCOUNT_ID');
    $bucket  = kenshin_env('R2_BUCKET');
    if ($account !== '' && $bucket !== '') {
        return 'https://' . $bucket . '.' . $account . '.r2.dev';
    }
    return '';
}

function kenshin_r2_public_url($key) {
    $base = kenshin_r2_public_base();
    if ($base === '') return '';
    return $base . '/' . ltrim($key, '/');
}

function kenshin_r2_host() {
    $endpoint = rtrim(kenshin_env('R2_ENDPOINT', ''), '/');
    if ($endpoint === '') {
        $endpoint = 'https://' . kenshin_env('R2_ACCOUNT_ID') . '.r2.cloudflarestorage.com';
    }
    $parts = parse_url($endpoint);
    return $parts['host'] ?? '';
}

function kenshin_r2_sign($method, $key, $payloadHash, $contentType, $amzDate, $dateStamp) {
    $region  = kenshin_env('R2_REGION', 'auto');
    $service = 's3';
    $secret  = kenshin_env('R2_SECRET_ACCESS_KEY');
    $access  = kenshin_env('R2_ACCESS_KEY_ID');
    $host    = kenshin_r2_host();
    $bucket  = kenshin_env('R2_BUCKET');
    $uri     = '/' . $bucket . '/' . ltrim($key, '/');

    // Canonical request standar AWS SigV4 (S3):
    //   <METHOD>\n<URI>\n<query>\n<canonical-headers>\n<signed-headers>\n<payload-hash>
    // Content-Type TIDAK di-sign (tidak dikirim sebagai x-amz-*, jadi tidak
    // boleh masuk canonical headers — kalau masuk, signature pasti mismatch).
    $signed = 'host;x-amz-content-sha256;x-amz-date';
    $canonical = $method . "\n"
        . $uri . "\n"
        . "\n"
        . "host:" . $host . "\n"
        . "x-amz-content-sha256:" . $payloadHash . "\n"
        . "x-amz-date:" . $amzDate . "\n"
        . "\n"
        . $signed . "\n"
        . $payloadHash;

    $scope = "$dateStamp/$region/$service/aws4_request";
    $toSign = "AWS4-HMAC-SHA256\n$amzDate\n$scope\n" . hash('sha256', $canonical);

    $kDate = hash_hmac('sha256', $dateStamp, 'AWS4' . $secret, true);
    $kReg  = hash_hmac('sha256', $region, $kDate, true);
    $kSvc  = hash_hmac('sha256', $service, $kReg, true);
    $kSign = hash_hmac('sha256', 'aws4_request', $kSvc, true);
    $sig   = hash_hmac('sha256', $toSign, $kSign);

    return "AWS4-HMAC-SHA256 Credential=$access/$scope, SignedHeaders=$signed, Signature=$sig";
}

function kenshin_r2_request($method, $key, $body = null, $contentType = '') {
    if (!kenshin_r2_enabled()) {
        return [0, 'R2 belum dikonfigurasi (cek .env: R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY/R2_BUCKET)'];
    }
    if (!function_exists('curl_init')) {
        return [0, 'Ekstensi PHP curl belum aktif'];
    }

    $endpoint = rtrim(kenshin_env('R2_ENDPOINT', ''), '/');
    if ($endpoint === '') {
        $endpoint = 'https://' . kenshin_env('R2_ACCOUNT_ID') . '.r2.cloudflarestorage.com';
    }
    $url = $endpoint . '/' . kenshin_env('R2_BUCKET') . '/' . ltrim($key, '/');

    $payloadHash = hash('sha256', $body === null ? '' : $body);
    $amzDate  = gmdate('Ymd\THis\Z');
    $dateStamp = gmdate('Ymd');
    $auth = kenshin_r2_sign($method, $key, $payloadHash, $contentType, $amzDate, $dateStamp);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    $headers = [
        "Authorization: $auth",
        'x-amz-content-sha256: ' . $payloadHash,
        'x-amz-date: ' . $amzDate,
    ];
    if ($contentType !== '') $headers[] = 'Content-Type: ' . $contentType;
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        $headers[] = 'Content-Length: ' . strlen($body);
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $resp = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($resp === false) return [0, 'cURL error: ' . $err];
    if ($code < 200 || $code >= 300) {
        return [$code, 'R2 HTTP ' . $code . ': ' . substr((string)$resp, 0, 300)];
    }
    return [$code, ''];
}

function kenshin_r2_upload($bytes, $key, $contentType) {
    [$code, $err] = kenshin_r2_request('PUT', $key, $bytes, $contentType);
    if ($err !== '') return [false, "Upload ke R2 gagal ($err)"];
    $url = kenshin_r2_public_url($key);
    if ($url === '') return [false, 'R2_PUBLIC_BASE_URL belum diisi'];
    return [true, $url];
}

function kenshin_r2_delete($key) {
    [$code, $err] = kenshin_r2_request('DELETE', $key);
    if ($err !== '' && $code !== 404) return [false, "Hapus di R2 gagal ($err)"];
    return [true, ''];
}
