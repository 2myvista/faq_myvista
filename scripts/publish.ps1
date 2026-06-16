$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

$distDir = Join-Path $projectRoot "dist"
$assetsDir = Join-Path $distDir "assets"
$bucket = "s3://notes-viewer-prod"

Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
	Write-Host "Build failed" -ForegroundColor Red
	exit 1
}

Write-Host "Cleaning old files..." -ForegroundColor Yellow

yc storage s3 rm "$bucket/index.html" 2>$null
yc storage s3 rm "$bucket/favicon.ico" 2>$null
yc storage s3 rm "$bucket/assets" --recursive 2>$null

Write-Host "Uploading frontend..." -ForegroundColor Yellow

yc storage s3 cp "$distDir/index.html" "$bucket/index.html" --content-type text/html

if (Test-Path "$distDir/favicon.ico") {
	yc storage s3 cp "$distDir/favicon.ico" "$bucket/favicon.ico" --content-type image/x-icon
}

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
		Write-Host "Upload failed: $($file.Name)" -ForegroundColor Red
		exit 1
	}
}

Write-Host "Publish OK" -ForegroundColor Green