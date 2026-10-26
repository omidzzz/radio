$path = "C:\Users\ghada\Desktop\Projects\radiotherapist-website\app\globals.css"
$lines = Get-Content $path
foreach ($l in $lines) {
    if ($l -like "*lightbg-clip*") {
        Write-Host "Found: $l"
    }
}
