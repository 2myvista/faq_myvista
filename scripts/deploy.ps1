$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$envFile = Join-Path $projectRoot ".env"
$cloudDir = Join-Path $projectRoot "cloud"

if (!(Test-Path $envFile)) {
  Write-Error ".env not found: $envFile"
  exit 1
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match "=") {
    $name, $value = $_ -split '=', 2
    Set-Item -Path "env:$name" -Value $value
  }
}

yc serverless function version create `
  --function-name notes-viewer `
  --runtime nodejs22 `
  --entrypoint index.handler `
  --memory 128m `
  --execution-timeout 3s `
  --source-path $cloudDir `
  --environment GITHUB_TOKEN=$env:GITHUB_TOKEN `
  1> $null

  Write-Host "Deploy done !!"