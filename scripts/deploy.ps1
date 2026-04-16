$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$envFile = Join-Path $projectRoot ".env"
$cloudDir = Join-Path $projectRoot "cloud"

# загрузка env
Get-Content $envFile | ForEach-Object {
	if ($_ -match "=") {
		$name, $value = $_ -split '=', 2
		Set-Item -Path "env:$name" -Value $value
	}
}

Write-Host "Deploying..." -ForegroundColor Yellow

try {
	$result = yc serverless function version create `
		--function-name notes-viewer `
		--runtime nodejs22 `
		--entrypoint index.handler `
		--memory 128m `
		--execution-timeout 3s `
		--source-path $cloudDir `
		--environment GITHUB_TOKEN=$env:GITHUB_TOKEN `
		2>&1

	if ($LASTEXITCODE -eq 0) {
		Write-Host "Deploy OK )) " -ForegroundColor Green
	}
 else {
		Write-Host "Deploy FAILED ((" -ForegroundColor Red
		Write-Host $result
	}

}
catch {
	Write-Host "Deploy ERROR ((" -ForegroundColor Red
	Write-Host $_
}