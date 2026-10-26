$path = "C:\Users\ghada\Desktop\Projects\radiotherapist-website\app\globals.css"
$content = Get-Content $path -Raw

$old = "@media (prefers-reduced-motion: reduce) {
  .morphing-blob,
  .morphing-blob-medium,
  .morphing-blob-fast {
    animation: none !important;
    border-radius: 50% !important;
  }
}

/* Shared curved edge treatment for every hero slide and theme. */
.lightbg-clip {
  clip-path: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0 0H16C9 20 7 80 16 100H0Z' fill='%230e3a2d'/%3E%3Cpath d='M16 0C9 20 7 80 16 100' fill='none' stroke='%23f8f5ee' stroke-width='.8'/%3E%3Cpath d='M17 0C10 20 8 80 17 100' fill='none' stroke='%23c9a24b' stroke-width='.35'/%3E%3C/svg%3E");
  background-position: left;
  background-repeat: no-repeat;
  background-size: 15% 100%;
  background-color: #fff;
}
"

$new = "@media (prefers-reduced-motion: reduce) {
  .morphing-blob,
  .morphing-blob-medium,
  .morphing-blob-fast {
    animation: none !important;
    border-radius: 50% !important;
  }
}

/* Shared curved edge treatment for every hero slide and theme. */
.lightbg-clip {
  clip-path: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%' stop-color='%2310b981'/%3E%3Cstop offset='100%' stop-color='%230b7a5d'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M0 0H18C9 22 7 80 16 100H0Z' fill='url(%23g1)'/%3E%3Cpath d='M0 0H18C9 22 7 80 16 100H0Z' fill='none' stroke='%2315f09b' stroke-width='2' opacity='0.6' stroke-linecap='round'/%3E%3Cpath d='M18 0C10 24 8 82 16 100' fill='none' stroke='%2315f09b' stroke-width='1' opacity='0.3' stroke-linecap='round'/%3E%3C/svg%3E");
  background-position: left;
  background-repeat: no-repeat;
  background-size: 15% 100%;
  background-color: transparent;
}
"

if ($content -like "*lightbg-clip*") {
    $content = $content.Replace($old, $new)
    $content | Set-Content $path
    Write-Host "CSS updated successfully"
} else {
    Write-Host "Pattern not found"
}
