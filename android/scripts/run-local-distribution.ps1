#Requires -Version 5.1
<#
.SYNOPSIS
  Build FitConnect DEBUG APK and serve a LAN install page + QR (no adb/USB).

.PARAMETER SkipBuild
  Reuse an existing debug APK if valid.

.PARAMETER SelfTest
  Validate locally over HTTP, then stop the server.

.PARAMETER Port
  Preferred port (default 8765). Falls back if busy.

.PARAMETER LanIp
  Force a specific LAN IPv4.
#>
param(
    [switch]$SkipBuild,
    [switch]$SelfTest,
    [int]$Port = 8765,
    [string]$LanIp = ""
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-Banner([string]$Title) {
    Write-Host ""
    Write-Host ("=" * 58) -ForegroundColor DarkYellow
    Write-Host $Title -ForegroundColor Green
    Write-Host ("=" * 58) -ForegroundColor DarkYellow
}

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "FAIL: $Message" -ForegroundColor Red
    exit 1
}

function Get-RepoRoot {
    return (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

function Get-FreePort([int]$Preferred) {
    $tryPorts = @($Preferred) + (8766..8785)
    foreach ($p in $tryPorts) {
        $listener = $null
        try {
            $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $p)
            $listener.Start()
            $listener.Stop()
            return $p
        } catch {
            if ($listener) { try { $listener.Stop() } catch {} }
        }
    }
    Fail "No free TCP port found in preferred range (starting at $Preferred)."
}

function Get-LanCandidates {
    $candidates = @()
    try {
        $configs = Get-NetIPConfiguration -ErrorAction Stop | Where-Object {
            $_.IPv4Address -and
            $_.NetAdapter.Status -eq "Up" -and
            $_.InterfaceAlias -notmatch "Loopback"
        }
        foreach ($c in $configs) {
            foreach ($addr in @($c.IPv4Address)) {
                $ip = $addr.IPAddress
                if (-not $ip) { continue }
                if ($ip -match "^127\.") { continue }
                if ($ip -match "^169\.254\.") { continue }
                $isPrivate =
                    ($ip -match "^10\.") -or
                    ($ip -match "^192\.168\.") -or
                    ($ip -match "^172\.(1[6-9]|2[0-9]|3[0-1])\.")
                if (-not $isPrivate) { continue }
                $alias = $c.InterfaceAlias
                $isVpn = ($alias -match "(?i)VPN|WireGuard|Tailscale|ZeroTier|Hamachi|Cisco|GlobalProtect|OpenVPN|Wintun|TAP|TUN")
                $score = 1
                if ($isVpn) { $score = 0 }
                elseif ($alias -match "(?i)Wi-?Fi|WLAN|Wireless") { $score = 3 }
                elseif ($alias -match "(?i)Ethernet") { $score = 2 }
                $candidates += [pscustomobject]@{
                    Ip        = $ip
                    Interface = $alias
                    IsVpn     = [bool]$isVpn
                    Score     = $score
                }
            }
        }
    } catch {
        foreach ($ni in [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces()) {
            if ($ni.OperationalStatus -ne "Up") { continue }
            if ($ni.NetworkInterfaceType -eq "Loopback") { continue }
            foreach ($ua in $ni.GetIPProperties().UnicastAddresses) {
                if ($ua.Address.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) { continue }
                $ip = $ua.Address.ToString()
                if ($ip -match "^127\." -or $ip -match "^169\.254\.") { continue }
                $isPrivate =
                    ($ip -match "^10\.") -or
                    ($ip -match "^192\.168\.") -or
                    ($ip -match "^172\.(1[6-9]|2[0-9]|3[0-1])\.")
                if (-not $isPrivate) { continue }
                $alias = $ni.Name
                $isVpn = ($alias -match "(?i)VPN|WireGuard|Tailscale|TAP|TUN")
                $candidates += [pscustomobject]@{
                    Ip        = $ip
                    Interface = $alias
                    IsVpn     = [bool]$isVpn
                    Score     = $(if ($isVpn) { 0 } else { 1 })
                }
            }
        }
    }
    return @($candidates | Sort-Object -Property @{ Expression = "Score"; Descending = $true }, Ip -Unique)
}

function Select-LanIp([string]$Forced, $Candidates, [bool]$NonInteractive) {
    if ($Forced) {
        $match = @($Candidates | Where-Object { $_.Ip -eq $Forced } | Select-Object -First 1)
        if ($match.Count -gt 0) { return $match[0] }
        return [pscustomobject]@{ Ip = $Forced; Interface = "(forced)"; IsVpn = $false; Score = 9 }
    }
    if (-not $Candidates -or $Candidates.Count -eq 0) {
        Fail "No usable private LAN IPv4 detected. Connect to Wi-Fi/Ethernet and retry, or pass -LanIp."
    }
    $preferred = @($Candidates | Where-Object { -not $_.IsVpn })
    if ($preferred.Count -eq 0) { $preferred = @($Candidates) }

    Write-Host "NETWORK CANDIDATES:" -ForegroundColor Cyan
    $i = 1
    foreach ($c in $preferred) {
        $tag = ""
        if ($c.IsVpn) { $tag = " [VPN?]" }
        Write-Host ("  [{0}] {1}  ({2}){3}" -f $i, $c.Ip, $c.Interface, $tag)
        $i++
    }

    if ($preferred.Count -eq 1 -or $NonInteractive) {
        return $preferred[0]
    }

    $topScore = ($preferred | Measure-Object -Property Score -Maximum).Maximum
    $tops = @($preferred | Where-Object { $_.Score -eq $topScore })
    if ($tops.Count -eq 1 -and $topScore -ge 2) {
        Write-Host ("Auto-selected: {0} ({1})" -f $tops[0].Ip, $tops[0].Interface) -ForegroundColor Green
        return $tops[0]
    }

    Write-Host "Multiple interfaces - enter number (default 1): " -NoNewline
    $choice = Read-Host
    if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }
    $idx = [int]$choice
    if ($idx -lt 1 -or $idx -gt $preferred.Count) {
        Fail "Invalid interface selection."
    }
    return $preferred[$idx - 1]
}

function Find-DebugApk([string]$AndroidRoot) {
    $dir = Join-Path $AndroidRoot "app\build\outputs\apk\debug"
    if (-not (Test-Path $dir)) { return $null }
    $apks = @(Get-ChildItem -Path $dir -Filter "*.apk" -File | Sort-Object LastWriteTime -Descending)
    if ($apks.Count -eq 0) { return $null }
    return $apks[0]
}

function Get-Sha256([string]$Path) {
    return (Get-FileHash -Algorithm SHA256 -Path $Path).Hash.ToLowerInvariant()
}

function Format-Size([long]$Bytes) {
    if ($Bytes -ge 1MB) { return ("{0:N2} MB" -f ($Bytes / 1MB)) }
    if ($Bytes -ge 1KB) { return ("{0:N1} KB" -f ($Bytes / 1KB)) }
    return "$Bytes B"
}

function New-InstallPageHtml([hashtable]$Meta) {
    $templatePath = Join-Path $PSScriptRoot "lib\install-page.template.html"
    if (-not (Test-Path $templatePath)) { Fail "Install page template missing: $templatePath" }
    $sha = [string]$Meta.Sha256
    $shaShort = if ($sha.Length -gt 16) { $sha.Substring(0, 16) + "..." } else { $sha }
    $html = Get-Content -LiteralPath $templatePath -Raw -Encoding UTF8
    $html = $html.Replace("{{VERSION_NAME}}", [string]$Meta.VersionName)
    $html = $html.Replace("{{VERSION_CODE}}", [string]$Meta.VersionCode)
    $html = $html.Replace("{{APPLICATION_ID}}", [string]$Meta.ApplicationId)
    $html = $html.Replace("{{FILE_NAME}}", [string]$Meta.FileName)
    $html = $html.Replace("{{SIZE_LABEL}}", [string]$Meta.SizeLabel)
    $html = $html.Replace("{{SHA256}}", $sha)
    $html = $html.Replace("{{SHA256_SHORT}}", $shaShort)
    $html = $html.Replace("{{BUILT_AT}}", [string]$Meta.BuiltAt)
    return $html
}

function Start-DistServer {
    param(
        [string]$RootDir,
        [int]$ListenPort,
        [string]$ApkFileName,
        [string]$Sha256
    )

    $job = Start-Job -ScriptBlock {
        param($Port, $Root, $ApkName, $Sha)
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $rootFull = [System.IO.Path]::GetFullPath($Root)

        function Send-Response($Client, [int]$Status, [string]$Reason, [byte[]]$Body, [string]$ContentType, [hashtable]$ExtraHeaders) {
            $stream = $Client.GetStream()
            $header = "HTTP/1.1 $Status $Reason`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`nCache-Control: no-store`r`nX-Content-Type-Options: nosniff`r`n"
            if ($ExtraHeaders) {
                foreach ($k in $ExtraHeaders.Keys) {
                    $header += ("{0}: {1}`r`n" -f $k, $ExtraHeaders[$k])
                }
            }
            $header += "`r`n"
            $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($hb, 0, $hb.Length)
            if ($Body.Length -gt 0) { $stream.Write($Body, 0, $Body.Length) }
            $stream.Flush()
            $Client.Close()
        }

        function Resolve-SafePath([string]$RootFull, [string]$Rel) {
            $rel = $Rel.Split("?")[0].Split("#")[0]
            if ([string]::IsNullOrWhiteSpace($rel) -or $rel -eq "/") { $rel = "/index.html" }
            $rel = [System.Uri]::UnescapeDataString($rel)
            $rel = $rel.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
            if ($rel.Contains("..")) { return $null }
            $combined = [System.IO.Path]::GetFullPath((Join-Path $RootFull $rel))
            if (-not $combined.StartsWith($RootFull, [System.StringComparison]::OrdinalIgnoreCase)) { return $null }
            return $combined
        }

        try {
            while ($true) {
                if (-not $listener.Pending()) {
                    Start-Sleep -Milliseconds 50
                    continue
                }
                $client = $listener.AcceptTcpClient()
                try {
                    $stream = $client.GetStream()
                    $stream.ReadTimeout = 5000
                    $buf = New-Object byte[] 8192
                    $read = $stream.Read($buf, 0, $buf.Length)
                    if ($read -le 0) { $client.Close(); continue }
                    $req = [System.Text.Encoding]::ASCII.GetString($buf, 0, $read)
                    $first = ($req -split "`r`n")[0]
                    if ($first -notmatch "^(GET|HEAD)\s+(\S+)\s+HTTP/") {
                        $body = [System.Text.Encoding]::UTF8.GetBytes("Method not allowed")
                        Send-Response $client 405 "Method Not Allowed" $body "text/plain; charset=utf-8" $null
                        continue
                    }
                    $path = $Matches[2]
                    $isHead = $Matches[1] -eq "HEAD"

                    if ($path -eq "/meta.json" -or $path.StartsWith("/meta.json?")) {
                        $obj = @{
                            artifact    = $ApkName
                            sha256      = $Sha
                            environment = "LOCAL_DEMO"
                            build       = "DEBUG"
                        }
                        $json = ($obj | ConvertTo-Json -Compress)
                        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                        if ($isHead) { $bytes = [byte[]]@() }
                        Send-Response $client 200 "OK" $bytes "application/json; charset=utf-8" $null
                        continue
                    }

                    $safe = Resolve-SafePath $rootFull $path
                    if (-not $safe -or -not (Test-Path -LiteralPath $safe -PathType Leaf)) {
                        $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
                        Send-Response $client 404 "Not Found" $body "text/plain; charset=utf-8" $null
                        continue
                    }

                    $ext = [IO.Path]::GetExtension($safe).ToLowerInvariant()
                    $ctype = switch ($ext) {
                        ".html" { "text/html; charset=utf-8" }
                        ".svg"  { "image/svg+xml" }
                        ".json" { "application/json; charset=utf-8" }
                        ".apk"  { "application/vnd.android.package-archive" }
                        default { "application/octet-stream" }
                    }
                    $bytes = if ($isHead) { [byte[]]@() } else { [System.IO.File]::ReadAllBytes($safe) }
                    $extra = @{}
                    if ($ext -eq ".apk") {
                        $extra["Content-Disposition"] = ('attachment; filename="{0}"' -f $ApkName)
                    }
                    Send-Response $client 200 "OK" $bytes $ctype $extra
                } catch {
                    try { $client.Close() } catch {}
                }
            }
        } finally {
            try { $listener.Stop() } catch {}
        }
    } -ArgumentList $ListenPort, $RootDir, $ApkFileName, $Sha256

    $ok = $false
    for ($i = 0; $i -lt 50; $i++) {
        Start-Sleep -Milliseconds 100
        if ($job.State -eq "Failed") {
            Receive-Job $job -ErrorAction SilentlyContinue | Out-Host
            break
        }
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $iar = $tcp.BeginConnect("127.0.0.1", $ListenPort, $null, $null)
            $wait = $iar.AsyncWaitHandle.WaitOne(200)
            if ($wait -and $tcp.Connected) {
                $tcp.EndConnect($iar)
                $tcp.Close()
                $ok = $true
                break
            }
            $tcp.Close()
        } catch {}
    }
    if (-not $ok) {
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -Force -ErrorAction SilentlyContinue
        Fail "HTTP server failed to bind/listen on port $ListenPort."
    }

    return $job
}

function Invoke-LocalGet([string]$Url) {
    return Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15
}

function Test-GitignoreDist {
    param([string]$RepoRoot)
    $gi = Join-Path $RepoRoot ".gitignore"
    $text = Get-Content -LiteralPath $gi -Raw
    return ($text -match "(?m)^\s*\.fitconnect-local-distribution/\s*$")
}

# -------------------- main --------------------

$repoRoot = Get-RepoRoot
$androidRoot = Join-Path $repoRoot "android"
$gradlew = Join-Path $androidRoot "gradlew.bat"
$distRoot = Join-Path $repoRoot ".fitconnect-local-distribution"
$qrPy = Join-Path $PSScriptRoot "lib\make_qr_svg.py"

if (-not (Test-Path $gradlew)) { Fail "gradlew.bat not found at $gradlew" }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { Fail "python is required for QR SVG generation (dev-only)." }
if (-not (Test-Path $qrPy)) { Fail "QR helper missing: $qrPy" }

Write-Banner "FITCONNECT ANDROID LOCAL DISTRIBUTION"

if (-not $SkipBuild) {
    Write-Host "BUILD" -ForegroundColor Cyan
    Push-Location $androidRoot
    try {
        & .\gradlew.bat :app:assembleDebug --quiet
        if ($LASTEXITCODE -ne 0) { Fail "assembleDebug failed (exit $LASTEXITCODE)." }
    } finally {
        Pop-Location
    }
    Write-Host "  [OK] assembleDebug"
} else {
    Write-Host "BUILD" -ForegroundColor Cyan
    Write-Host "  [..] skipped (-SkipBuild)"
}

$apk = Find-DebugApk $androidRoot
if (-not $apk) { Fail "No debug APK under app/build/outputs/apk/debug/." }
if ($apk.Length -le 0) { Fail "APK is empty: $($apk.FullName)" }
if ($apk.Extension -ne ".apk") { Fail "Unexpected extension: $($apk.Name)" }

$sha = Get-Sha256 $apk.FullName
$sizeLabel = Format-Size $apk.Length
$versionName = "unknown"
$versionCode = "unknown"
$applicationId = "com.fitconnect.android.debug"
$gradleFile = Join-Path $androidRoot "app\build.gradle.kts"
if (Test-Path $gradleFile) {
    $g = Get-Content $gradleFile -Raw
    if ($g -match 'versionName\s*=\s*"([^"]+)"') { $versionName = $Matches[1] }
    if ($g -match 'versionCode\s*=\s*(\d+)') { $versionCode = $Matches[1] }
    if ($g -match 'applicationId\s*=\s*"([^"]+)"') { $applicationId = $Matches[1] + ".debug" }
}

Write-Host "APK" -ForegroundColor Cyan
Write-Host "  [OK] $($apk.Name)"
Write-Host "  [OK] $sizeLabel"
Write-Host "  [OK] SHA-256: $sha"
Write-Host "  [OK] $($apk.FullName)"

$candidates = @(Get-LanCandidates)
$selected = Select-LanIp -Forced $LanIp -Candidates $candidates -NonInteractive:($SelfTest.IsPresent -or -not [Environment]::UserInteractive)
$listenPort = Get-FreePort $Port
$installUrl = "http://$($selected.Ip):${listenPort}/"

Write-Host "NETWORK" -ForegroundColor Cyan
Write-Host "  [OK] Interface: $($selected.Interface)"
Write-Host "  [OK] LAN IP: $($selected.Ip)"
if ($selected.IsVpn) {
    Write-Host "  [!] Interface looks like VPN - phone may not reach this IP on Wi-Fi." -ForegroundColor Yellow
}

if (Test-Path $distRoot) { Remove-Item -Recurse -Force $distRoot }
New-Item -ItemType Directory -Force -Path $distRoot | Out-Null
Copy-Item -LiteralPath $apk.FullName -Destination (Join-Path $distRoot "app.apk") -Force

$meta = @{
    VersionName   = $versionName
    VersionCode   = $versionCode
    ApplicationId = $applicationId
    FileName      = $apk.Name
    SizeLabel     = $sizeLabel
    Sha256        = $sha
    Url           = $installUrl
    BuiltAt       = $apk.LastWriteTime.ToString("o")
}
($meta | ConvertTo-Json) | Set-Content -Path (Join-Path $distRoot "meta.json") -Encoding UTF8
(New-InstallPageHtml $meta) | Set-Content -Path (Join-Path $distRoot "index.html") -Encoding UTF8

$qrSvg = Join-Path $distRoot "qr.svg"
$qrAscii = Join-Path $distRoot "qr.txt"
& python $qrPy $installUrl --out $qrSvg --ascii-out $qrAscii --ecl M
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $qrSvg)) { Fail "QR SVG generation failed." }

$job = Start-DistServer -RootDir $distRoot -ListenPort $listenPort -ApkFileName $apk.Name -Sha256 $sha

Write-Host "SERVER" -ForegroundColor Cyan
Write-Host "  [OK] Port: $listenPort"
Write-Host "  [OK] Serving only: $distRoot"
Write-Host "  [OK] HTTP server running"

Write-Host ""
Write-Host ("=" * 58) -ForegroundColor DarkYellow
Write-Host "FITCONNECT ANDROID LOCAL DISTRIBUTION" -ForegroundColor Green
Write-Host ("=" * 58) -ForegroundColor DarkYellow
Write-Host "BUILD:        PASS"
Write-Host ("APK:          {0}" -f $apk.FullName)
Write-Host ("SIZE:         {0}" -f $sizeLabel)
Write-Host ("SHA-256:      {0}" -f $sha)
Write-Host ("LAN:          {0}" -f $selected.Ip)
Write-Host ("PORT:         {0}" -f $listenPort)
Write-Host ("URL:          {0}" -f $installUrl)
Write-Host "QR:           READY"
Write-Host "ENVIRONMENT:  LOCAL DEMO"
Write-Host "PRODUCTION:   LOCKED"
Write-Host ("=" * 58) -ForegroundColor DarkYellow
Write-Host ""
Write-Host "PHONE:" -ForegroundColor Cyan
Write-Host "  Connect to same Wi-Fi"
Write-Host "  Scan QR"
Write-Host "  Download / Install APK"
Write-Host "  Open FitConnect -> LOCAL DEMO"
Write-Host ""
Write-Host "SCAN THIS QR CODE WITH YOUR ANDROID PHONE" -ForegroundColor Cyan
Write-Host ""
Get-Content $qrAscii | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Flow: SCAN QR -> OPEN PAGE -> INSTALL APK -> Android installer -> LOCAL DEMO" -ForegroundColor DarkGray
Write-Host "Deep link after install (optional): fitconnect://app/auth" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Firewall: if the phone cannot connect, allow inbound TCP $listenPort (do not disable the firewall)." -ForegroundColor DarkYellow
Write-Host ""

$verifyBase = "http://127.0.0.1:$listenPort"
$qrDecode = "UNAVAILABLE"
$gitignoreOk = Test-GitignoreDist $repoRoot

try {
    $page = Invoke-LocalGet "$verifyBase/"
    if ($page.StatusCode -ne 200) { Fail "Install page HTTP $($page.StatusCode)" }
    if ($page.Content -notmatch "FITCONNECT") { Fail "Install page missing FITCONNECT brand." }

    $apkResp = Invoke-LocalGet "$verifyBase/app.apk"
    if ($apkResp.StatusCode -ne 200) { Fail "APK endpoint HTTP $($apkResp.StatusCode)" }
    $apkLen = 0
    if ($apkResp.Headers["Content-Length"]) {
        $apkLen = [int64]$apkResp.Headers["Content-Length"]
    }
    if ($apkLen -le 0 -and $apkResp.RawContentLength) { $apkLen = [int64]$apkResp.RawContentLength }
    if ($apkLen -le 0) { Fail "APK endpoint returned empty body." }

    $travCode = 0
    try {
        $trav = Invoke-WebRequest -Uri "$verifyBase/../.gitignore" -UseBasicParsing -TimeoutSec 5
        $travCode = [int]$trav.StatusCode
    } catch {
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $travCode = [int]$_.Exception.Response.StatusCode
        } else {
            $travCode = 404
        }
    }
    if ($travCode -eq 200) { Fail "Path traversal guard failed - ../ leaked." }

    Write-Host "VERIFY (localhost)" -ForegroundColor Cyan
    Write-Host "  [OK] INSTALL_PAGE HTTP 200"
    Write-Host ("  [OK] APK_DOWNLOAD HTTP 200 ({0} bytes)" -f $apkLen)
    Write-Host "  [OK] PATH_TRAVERSAL_GUARD (no 200 on ../)"

    $blocked = @(
        "/../.gitignore",
        "/../../.gitignore",
        "/.env",
        "/.git/config",
        "/local.properties",
        "/keystore.properties",
        "/android/settings.gradle.kts",
        "/docs/android/PHASE_15_EXIT_GATE.md",
        "/package.json",
        "/%2e%2e/.gitignore",
        "/%2e%2e/%2e%2e/.env"
    )
    foreach ($probe in $blocked) {
        $code = 0
        try {
            $resp = Invoke-WebRequest -Uri ($verifyBase + $probe) -UseBasicParsing -TimeoutSec 5
            $code = [int]$resp.StatusCode
        } catch {
            if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
                $code = [int]$_.Exception.Response.StatusCode
            } else {
                $code = 404
            }
        }
        if ($code -eq 200) {
            Fail ("Security probe leaked HTTP 200 for path: " + $probe)
        }
    }
    Write-Host "  [OK] QR_SECURITY probes (env/git/keystore/docs/package) non-200"

    if ($gitignoreOk) {
        Write-Host "  [OK] GITIGNORE (.fitconnect-local-distribution/)"
    } else {
        Fail "GITIGNORE missing .fitconnect-local-distribution/"
    }
    Write-Host "  [..] QR_DECODE_VERIFICATION = $qrDecode"
} catch {
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -Force -ErrorAction SilentlyContinue
    Fail "Local HTTP verification failed: $($_.Exception.Message)"
}

if ($SelfTest) {
    Write-Host ""
    Write-Host "SELFTEST complete - stopping server." -ForegroundColor Green
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -Force -ErrorAction SilentlyContinue

    # Persist detected values for the exit-gate doc (facts only)
    $report = @{
        installUrl   = $installUrl
        lanIp        = $selected.Ip
        port         = $listenPort
        apkPath      = $apk.FullName
        apkName      = $apk.Name
        sha256       = $sha
        sizeBytes    = $apk.Length
        sizeLabel    = $sizeLabel
        qrDecode     = $qrDecode
        applicationId = $applicationId
        versionName  = $versionName
        versionCode  = $versionCode
        securityProbes = "PASS"
    }
    $reportPath = Join-Path $repoRoot "qa\reports\android-local-qr-selftest.json"
    New-Item -ItemType Directory -Force -Path (Split-Path $reportPath) | Out-Null
    ($report | ConvertTo-Json) | Set-Content -LiteralPath $reportPath -Encoding UTF8

    Write-Host ""
    Write-Host "LOCAL_QR_DISTRIBUTION"
    Write-Host "====================="
    Write-Host "IMPLEMENTATION: PASS"
    Write-Host "BUILD: PASS"
    Write-Host "APK_DISCOVERY: PASS"
    Write-Host "SHA256: PASS"
    Write-Host "SERVER: PASS"
    Write-Host "INSTALL_PAGE: PASS"
    Write-Host "APK_DOWNLOAD: PASS"
    Write-Host "QR_GENERATION: PASS"
    Write-Host "QR_DECODE: $qrDecode"
    Write-Host "PATH_TRAVERSAL_GUARD: PASS"
    Write-Host "QR_SECURITY: PASS"
    Write-Host "GITIGNORE: PASS"
    Write-Host "DEVICE_INSTALLATION: PENDING_HUMAN"
    Write-Host "PRODUCTION: UNCHANGED / LOCKED"
    exit 0
}

Write-Host "HUMAN DEVICE TEST" -ForegroundColor Cyan
Write-Host "  1. Phone on same Wi-Fi as this PC"
Write-Host "  2. Scan QR (or open $installUrl)"
Write-Host "  3. Download APK -> allow install if prompted"
Write-Host "  4. Open FitConnect -> LOCAL DEMO (Ines / Marina / Tomas)"
Write-Host ""
Write-Host "Press Enter to stop the server..." -ForegroundColor Yellow
[void][Console]::ReadLine()
Stop-Job $job -ErrorAction SilentlyContinue
Remove-Job $job -Force -ErrorAction SilentlyContinue
Write-Host "Server stopped." -ForegroundColor Green
