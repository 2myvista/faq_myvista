$ErrorActionPreference = "Stop"

$ErrorActionPreference = "Continue"

[Environment]::SetEnvironmentVariable(
	"YC_CLI_INITIALIZATION_SILENCE",
	"true",
	"Process"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

$envFile = Join-Path $projectRoot ".env"

$notesViewerDir = Join-Path $projectRoot "cloud\notes-viewer"
$basicAuthDir = Join-Path $projectRoot "cloud\notes-basic-auth"
$gatewaySpec = Join-Path $projectRoot "cloud\notes-gateway\openapi.yaml"

$distDir = Join-Path $projectRoot "dist"
$assetsDir = Join-Path $distDir "assets"

$bucketName = "notes-viewer-prod"
$bucket = "s3://$bucketName"

$notesViewerFunctionId = "d4edimpv64rdl91o5pd3"
$basicAuthFunctionId = "d4e6cps3d64chp2hergv"

function Load-Env {
	param([string]$Path)

	if (!(Test-Path $Path)) {
		Write-Host ".env not found: $Path" -ForegroundColor Red
		exit 1
	}

	Get-Content $Path | ForEach-Object {
		$line = $_.Trim()

		if (!$line -or $line.StartsWith("#")) {
			return
		}

		if ($line -match "=") {
			$name, $value = $line -split "=", 2
			Set-Item -Path "env:$name" -Value $value
		}
	}
}

function Confirm-MocksDeployment {
	$useMocks = [Environment]::GetEnvironmentVariable("VITE_USE_MOCKS")

	if (![string]::IsNullOrWhiteSpace($useMocks) -and $useMocks.Trim().ToLower() -eq "true") {
		Write-Host ""
		Write-Host "WARNING: VITE_USE_MOCKS=true" -ForegroundColor Yellow
		Write-Host "Production build will use mock data." -ForegroundColor Yellow

		$answer = (Read-Host "Continue deploy with VITE_USE_MOCKS=true? (Y/N)").Trim().ToLower()

		if ($answer -ne "y") {
			Write-Host "Deploy cancelled." -ForegroundColor Red
			exit 1
		}
	}
}

function Require-Env {
	param([string]$Name)

	$value = [Environment]::GetEnvironmentVariable($Name)

	if ([string]::IsNullOrWhiteSpace($value)) {
		Write-Host "Missing required env variable: $Name" -ForegroundColor Red
		exit 1
	}
}

function Run-Step {
	param(
		[string]$Title,
		[scriptblock]$Command
	)

	Write-Host ""
	Write-Host $Title -ForegroundColor Yellow

	& $Command

	if ($LASTEXITCODE -ne 0) {
		Write-Host "$Title failed" -ForegroundColor Red
		exit 1
	}

	Write-Host "$Title OK" -ForegroundColor Green
}

function Remove-S3 {
	param(
		[string]$Path,
		[switch]$Recursive
	)

	if ($Recursive) {
		yc storage s3 rm $Path --recursive 1>$null 2>$null
	}
 else {
		yc storage s3 rm $Path 1>$null 2>$null
	}
}

Load-Env $envFile

Confirm-MocksDeployment

Require-Env "GITHUB_TOKEN"
Require-Env "BASIC_USER"
Require-Env "BASIC_PASSWORD"

Run-Step "Deploy notes-viewer function" {
	yc serverless function version create `
		--function-id $notesViewerFunctionId `
		--runtime nodejs22 `
		--entrypoint index.handler `
		--memory 128m `
		--execution-timeout 15s `
		--source-path $notesViewerDir `
		--environment "GITHUB_TOKEN=$env:GITHUB_TOKEN" `
		1> $null
}

Run-Step "Deploy notes-basic-auth function" {
	yc serverless function version create `
		--function-id $basicAuthFunctionId `
		--runtime nodejs22 `
		--entrypoint index.handler `
		--memory 128m `
		--execution-timeout 3s `
		--source-path $basicAuthDir `
		--environment "BASIC_USER=$env:BASIC_USER,BASIC_PASSWORD=$env:BASIC_PASSWORD" `
		1> $null
}

Run-Step "Update API Gateway" {
	yc serverless api-gateway update `
		--name notes-gateway `
		--spec $gatewaySpec `
		1> $null
}

Run-Step "Build frontend" {
	Push-Location $projectRoot
	npm run build
	Pop-Location
}

Run-Step "Clean Object Storage" {
	Remove-S3 "$bucket/index.html"
	Remove-S3 "$bucket/favicon.ico"
	Remove-S3 "$bucket/assets" -Recursive
}

Run-Step "Upload index.html" {
	yc storage s3 cp "$distDir/index.html" "$bucket/index.html" --content-type text/html
}

if (Test-Path "$distDir/favicon.ico") {
	Run-Step "Upload favicon.ico" {
		yc storage s3 cp "$distDir/favicon.ico" "$bucket/favicon.ico" --content-type image/x-icon
	}
}

Run-Step "Upload assets" {
	Get-ChildItem "$assetsDir" -File | ForEach-Object {
		$file = $_
		$target = "$bucket/assets/$($file.Name)"

		switch ($file.Extension.ToLower()) {
			".js" {
				yc storage s3 cp $file.FullName $target --content-type application/javascript
			}
			".css" {
				yc storage s3 cp $file.FullName $target --content-type text/css
			}
			".map" {
				yc storage s3 cp $file.FullName $target --content-type application/json
			}
			".svg" {
				yc storage s3 cp $file.FullName $target --content-type image/svg+xml
			}
			".png" {
				yc storage s3 cp $file.FullName $target --content-type image/png
			}
			".jpg" {
				yc storage s3 cp $file.FullName $target --content-type image/jpeg
			}
			".jpeg" {
				yc storage s3 cp $file.FullName $target --content-type image/jpeg
			}
			".webp" {
				yc storage s3 cp $file.FullName $target --content-type image/webp
			}
			default {
				yc storage s3 cp $file.FullName $target
			}
		}

		if ($LASTEXITCODE -ne 0) {
			throw "Upload failed: $($file.Name)"
		}
	}
}

Write-Host ""
Write-Host "Deploy completed" -ForegroundColor Green