$path = "C:\Users\ghada\Desktop\Projects\radiotherapist-website\app\globals.css"
$lines = Get-Content $path
$result = @()
$skip = 0
for($i=0; $i -lt $lines.Length; $i++) {
    if($i -eq 2749 -and $lines[$i] -eq "  }" -and $i+1 -lt $lines.Length -and $lines[$i+1] -eq "  }") {
        $skip = 2
    }
    if($skip -gt 0) { $skip--; continue }
    $result += $lines[$i]
}
$result | Set-Content $path
