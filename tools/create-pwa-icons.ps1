$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$icoPath = Join-Path $root "favicon.ico"
$iconsDir = Join-Path $root "icons"

if (!(Test-Path $icoPath)) {
  throw "favicon.ico not found at $icoPath"
}

New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null

$icon = New-Object System.Drawing.Icon($icoPath)
$srcBitmap = $icon.ToBitmap()

function Save-ResizedPng([System.Drawing.Bitmap]$bmp, [int]$size, [string]$outPath) {
  $newBmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($newBmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage($bmp, 0, 0, $size, $size)
  $g.Dispose()
  $newBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $newBmp.Dispose()
}

# PWA/Android recommended sizes
Save-ResizedPng $srcBitmap 192 (Join-Path $iconsDir "icon-192.png")
Save-ResizedPng $srcBitmap 512 (Join-Path $iconsDir "icon-512.png")

# iOS home screen icon (recommended 180x180)
Save-ResizedPng $srcBitmap 180 (Join-Path $iconsDir "apple-touch-icon.png")

# Keep the 256 you were already referencing (useful fallback)
Save-ResizedPng $srcBitmap 256 (Join-Path $iconsDir "icon-256.png")

$srcBitmap.Dispose()
$icon.Dispose()

Write-Host "Generated PWA icons in $iconsDir"


