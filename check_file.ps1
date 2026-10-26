$fullPath = "c:\Users\ghada\Desktop\Projects\radiotherapist-website\app\forum"
$file = "$fullPath\[id]\page.tsx"
Write-Host "Checking: $file"
Get-Content -LiteralPath $file | Select-Object -First 10
