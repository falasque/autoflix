<?php
// Proxy PHP para buscar XML e resolver CORS
// Arquivo: /www/wwwroot/autoflix.com.br/api/xml-proxy.php

header('Content-Type: application/xml; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Configuração
$XML_URL = 'https://app.revendamais.com.br/application/index.php/apiGeneratorXml/generator/sitedaloja/fcea82d6d33494aa52975011402e563a11466.xml';

// Log da requisição
error_log("[XML-PROXY] Request from: " . $_SERVER['REMOTE_ADDR']);
error_log("[XML-PROXY] URL: " . $XML_URL);

try {
    // Usar cURL para buscar o XML
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $XML_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; AutoflixBot/1.0)');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    
    $xmlContent = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        error_log("[XML-PROXY] cURL Error: " . $error);
        http_response_code(500);
        die("<?xml version='1.0'?><error>cURL Error: " . htmlspecialchars($error) . "</error>");
    }
    
    if ($httpCode !== 200) {
        error_log("[XML-PROXY] HTTP Error: " . $httpCode);
        http_response_code($httpCode);
        die("<?xml version='1.0'?><error>HTTP Error: " . $httpCode . "</error>");
    }
    
    if (empty($xmlContent)) {
        error_log("[XML-PROXY] Empty response");
        http_response_code(500);
        die("<?xml version='1.0'?><error>Empty XML response</error>");
    }
    
    // Verificar se é XML válido
    if (!str_contains($xmlContent, '<?xml') && !str_contains($xmlContent, '<')) {
        error_log("[XML-PROXY] Invalid XML content");
        http_response_code(500);
        die("<?xml version='1.0'?><error>Invalid XML content</error>");
    }
    
    error_log("[XML-PROXY] Success - XML size: " . strlen($xmlContent) . " bytes");
    
    // Retornar o XML
    echo $xmlContent;
    
} catch (Exception $e) {
    error_log("[XML-PROXY] Exception: " . $e->getMessage());
    http_response_code(500);
    echo "<?xml version='1.0'?><error>Exception: " . htmlspecialchars($e->getMessage()) . "</error>";
}
?>