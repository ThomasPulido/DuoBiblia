param(
    [string]$JavaHome = ""
)

$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$signingDirectory = Join-Path $workspace '.signing'
$keystorePath = Join-Path $signingDirectory 'duobiblia-release.jks'
$secretPath = Join-Path $signingDirectory 'keystore-password.dpapi'
$machineSecretPath = Join-Path $signingDirectory 'keystore-password.machine.dpapi'
Add-Type -AssemblyName System.Security

if ((Test-Path -LiteralPath $keystorePath) -or (Test-Path -LiteralPath $secretPath)) {
    if ((Test-Path -LiteralPath $keystorePath) -and (Test-Path -LiteralPath $secretPath)) {
        if (-not (Test-Path -LiteralPath $machineSecretPath)) {
            $existingSecurePassword = ConvertTo-SecureString ([IO.File]::ReadAllText($secretPath))
            $existingCredential = [Management.Automation.PSCredential]::new('duobiblia', $existingSecurePassword)
            $existingPassword = $existingCredential.GetNetworkCredential().Password
            $existingBytes = [Text.Encoding]::UTF8.GetBytes($existingPassword)
            $machineEncrypted = [System.Security.Cryptography.ProtectedData]::Protect($existingBytes, $null, [System.Security.Cryptography.DataProtectionScope]::LocalMachine)
            [IO.File]::WriteAllBytes($machineSecretPath, $machineEncrypted)
            [Array]::Clear($existingBytes, 0, $existingBytes.Length)
            [Array]::Clear($machineEncrypted, 0, $machineEncrypted.Length)
            $existingPassword = $null
        }
        Write-Host 'La clave de firma estable ya existe; no se reemplazó.'
        exit 0
    }
    throw 'La carpeta .signing está incompleta. No se reemplazará una clave existente automáticamente.'
}

if (-not $JavaHome) {
    $jdk = Get-ChildItem -LiteralPath (Join-Path $workspace '.toolchains\jdk21') -Directory | Select-Object -First 1
    if (-not $jdk) { throw 'No se encontró el JDK portátil.' }
    $JavaHome = $jdk.FullName
}

$keytool = Join-Path $JavaHome 'bin\keytool.exe'
if (-not (Test-Path -LiteralPath $keytool)) { throw 'No se encontró keytool.exe.' }

New-Item -ItemType Directory -Force -Path $signingDirectory | Out-Null
$bytes = New-Object byte[] 48
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
$password = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
$encrypted = ConvertTo-SecureString -String $password -AsPlainText -Force | ConvertFrom-SecureString
[IO.File]::WriteAllText($secretPath, $encrypted, [Text.UTF8Encoding]::new($false))
$passwordBytes = [Text.Encoding]::UTF8.GetBytes($password)
$machineEncrypted = [System.Security.Cryptography.ProtectedData]::Protect($passwordBytes, $null, [System.Security.Cryptography.DataProtectionScope]::LocalMachine)
[IO.File]::WriteAllBytes($machineSecretPath, $machineEncrypted)

try {
    & $keytool -genkeypair -v -keystore $keystorePath -storetype PKCS12 -storepass $password -keypass $password -alias duobiblia -keyalg RSA -keysize 4096 -validity 10000 -dname 'CN=DuoBiblia, OU=Mobile, O=DuoBiblia, L=Bogota, ST=Cundinamarca, C=CO'
    if ($LASTEXITCODE -ne 0) { throw "keytool terminó con código $LASTEXITCODE" }
} catch {
    Remove-Item -LiteralPath $keystorePath, $secretPath, $machineSecretPath -Force -ErrorAction SilentlyContinue
    throw
} finally {
    $password = $null
    [Array]::Clear($bytes, 0, $bytes.Length)
    if ($passwordBytes) { [Array]::Clear($passwordBytes, 0, $passwordBytes.Length) }
    if ($machineEncrypted) { [Array]::Clear($machineEncrypted, 0, $machineEncrypted.Length) }
}

Write-Host 'Clave de firma creada. Conserva juntos ambos archivos de .signing para todas las actualizaciones.'
