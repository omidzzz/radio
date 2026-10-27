# Replace original images with optimized versions
$optimizedDir = Join-Path (Split-Path $PSScriptRoot -Parent) "public/images-optimized"
$targetDir  = Join-Path (Split-Path $PSScriptRoot -Parent) "public/images"

Get-ChildItem -LiteralPath $optimizedDir |
ForEach-Object {
    $dest = Join-Path $targetDir $_.Name
    Move-Item -LiteralPath $_.FullName -Destination $dest -Force
    Write-Host "Replaced: $($_.Name)"
}

# Remove the original hero backup
Remove-Item -Force (Join-Path $targetDir "_test_backup.webp") -ErrorAction SilentlyContinue
Write-Host "Done. Original images replaced with optimized versions."
