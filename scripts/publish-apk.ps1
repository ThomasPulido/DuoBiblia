param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectUrl,

    [Parameter(Mandatory = $true)]
    [string]$ApkPath,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+\.\d+\.\d+$')]
    [string]$Version,

    [ValidatePattern('^\d+\.\d+\.\d+$')]
    [string]$MinimumVersion = $Version
)

$ErrorActionPreference = 'Stop'
$serviceKey = $env:SUPABASE_SERVICE_ROLE_KEY
if (-not $serviceKey) {
    throw 'Configura SUPABASE_SERVICE_ROLE_KEY en una variable de entorno antes de publicar.'
}

$resolvedApk = (Resolve-Path -LiteralPath $ApkPath).Path
if ([IO.Path]::GetExtension($resolvedApk) -ne '.apk') {
    throw 'El archivo de publicación debe terminar en .apk.'
}

$baseUrl = $ProjectUrl.TrimEnd('/')
$objectName = "DuoBiblia-$Version.apk"
$uploadUrl = "$baseUrl/storage/v1/object/releases/$objectName"
$headers = @{
    Authorization = "Bearer $serviceKey"
    apikey = $serviceKey
    'x-upsert' = 'true'
}

$apkBytes = [IO.File]::ReadAllBytes($resolvedApk)
Invoke-RestMethod -Method Post -Uri $uploadUrl -Headers $headers -ContentType 'application/vnd.android.package-archive' -Body $apkBytes | Out-Null

$publicUrl = "$baseUrl/storage/v1/object/public/releases/$objectName"
$manifestBody = @{
    latest_version = $Version
    minimum_version = $MinimumVersion
    store_url = $publicUrl
    title = @{ es = 'Actualización necesaria'; en = 'Update required' }
    message = @{
        es = 'Descarga e instala la versión más reciente de DuoBiblia para continuar.'
        en = 'Download and install the latest DuoBiblia version to continue.'
    }
    updated_at = (Get-Date).ToUniversalTime().ToString('o')
} | ConvertTo-Json -Depth 5

$restHeaders = @{
    Authorization = "Bearer $serviceKey"
    apikey = $serviceKey
    Prefer = 'return=representation'
}
$manifestUrl = "$baseUrl/rest/v1/app_versions?platform=eq.android"
$result = Invoke-RestMethod -Method Patch -Uri $manifestUrl -Headers $restHeaders -ContentType 'application/json' -Body $manifestBody

Write-Host "APK publicado: $publicUrl"
Write-Host "Versión mínima obligatoria: $MinimumVersion"
$result

