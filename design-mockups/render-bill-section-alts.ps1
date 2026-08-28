Add-Type -AssemblyName System.Drawing

$OutDir = Join-Path $PSScriptRoot "jpg"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function New-RoundRectPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function Fill-Round($g, $brush, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  if ($r -le 0) {
    $g.FillRectangle($brush, $x, $y, $w, $h)
    return
  }
  $p = New-RoundRectPath $x $y $w $h $r
  $g.FillPath($brush, $p)
  $p.Dispose()
}

function Stroke-Round($g, $pen, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  if ($r -le 0) {
    $g.DrawRectangle($pen, $x, $y, $w, $h)
    return
  }
  $p = New-RoundRectPath $x $y $w $h $r
  $g.DrawPath($pen, $p)
  $p.Dispose()
}

function C($hex) {
  $hex = $hex.TrimStart("#")
  return [System.Drawing.Color]::FromArgb(
    [Convert]::ToInt32($hex.Substring(0, 2), 16),
    [Convert]::ToInt32($hex.Substring(2, 2), 16),
    [Convert]::ToInt32($hex.Substring(4, 2), 16)
  )
}

function B($hex) { return New-Object System.Drawing.SolidBrush (C $hex) }
function P($hex, $width = 1) { return New-Object System.Drawing.Pen (C $hex), $width }

function Font($size, $style = "Regular") {
  $fs = [System.Enum]::Parse([System.Drawing.FontStyle], $style)
  return [System.Drawing.Font]::new("Segoe UI", [single]$size, $fs, [System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-Text($g, $text, $font, $brush, [float]$x, [float]$y, [float]$w, [float]$h, $align = "Near") {
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Enum]::Parse([System.Drawing.StringAlignment], $align)
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Near
  $sf.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $rect = New-Object System.Drawing.RectangleF $x, $y, $w, $h
  $g.DrawString($text, $font, $brush, $rect, $sf)
  $sf.Dispose()
}

function Draw-IconCircle($g, [float]$x, [float]$y, $label, $bg, $fg) {
  Fill-Round $g (B $bg) $x $y 66 66 18
  Draw-Text $g $label (Font 26 "Bold") (B $fg) ($x + 10) ($y + 15) 46 36 "Center"
}

function Draw-Chip($g, [float]$x, [float]$y, [float]$w, $title, $sub, $accent) {
  Fill-Round $g (B "ffffff") $x $y $w 74 14
  Stroke-Round $g (P "e6edf6") $x $y $w 74 14
  Fill-Round $g (B $accent) ($x + 18) ($y + 22) 30 30 9
  Draw-Text $g $title (Font 18 "Bold") (B "111827") ($x + 62) ($y + 15) ($w - 84) 24
  Draw-Text $g $sub (Font 15) (B "5b687c") ($x + 62) ($y + 42) ($w - 84) 22
}

function Draw-DiscomButton($g, [float]$x, [float]$y, [float]$w, $label) {
  Fill-Round $g (B "ffffff") $x $y $w 62 12
  Stroke-Round $g (P "e3e8ef") $x $y $w 62 12
  Draw-Text $g $label (Font 17 "Bold") (B "141b2d") ($x + 18) ($y + 19) ($w - 54) 24
  Draw-Text $g ">" (Font 22 "Bold") (B "66758a") ($x + $w - 42) ($y + 17) 20 26 "Center"
}

function Draw-Checklist($g, [float]$x, [float]$y, [float]$w, [string[]]$items) {
  Fill-Round $g (B "ffffff") $x $y $w 246 18
  Stroke-Round $g (P "e6edf6") $x $y $w 246 18
  Draw-Text $g "Every charge on your bill, modelled" (Font 22 "Bold") (B "111827") ($x + 34) ($y + 30) ($w - 68) 30 "Center"
  $yy = $y + 82
  foreach ($item in $items) {
    Draw-Text $g "✓" (Font 25 "Bold") (B "16a34a") ($x + 34) $yy 30 28
    Draw-Text $g $item (Font 18) (B "526075") ($x + 72) ($yy + 2) ($w - 104) 26
    $yy += 37
  }
}

function Base-Canvas($name) {
  $bmp = New-Object System.Drawing.Bitmap 1600, 820
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $g.Clear((C "f6f8fb"))
  Draw-Text $g $name (Font 19 "Bold") (B "64748b") 112 34 500 30
  Fill-Round $g (B "eef3fb") 0 0 1600 20 0
  return @{ Bmp = $bmp; G = $g }
}

function Save-Jpg($canvas, $file) {
  $path = Join-Path $OutDir $file
  $canvas.G.Dispose()
  $canvas.Bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $canvas.Bmp.Dispose()
  return $path
}

$items = @("Slab-wise energy charges", "Fixed charges and FPPA", "Solar net metering", "Arrears and late fee")
$discoms = @("UPPCL", "BESCOM", "MSEDCL", "TANGEDCO", "PSPCL", "TSSPDCL", "APSPDCL", "BSES Rajdhani")

$c = Base-Canvas "Option A - Trust ribbon with clean shortcuts"
$g = $c.G
Fill-Round $g (B "eaf2ff") 112 104 1376 184 20
Stroke-Round $g (P "bcd6ff") 112 104 1376 184 20
Draw-IconCircle $g 144 136 "S" "2f65ea" "ffffff"
Draw-Text $g "Your trusted electricity bill calculator" (Font 26 "Bold") (B "1d4ac4") 232 132 620 38
Draw-Text $g "Public orders, privacy-first calculation, and clear source links in one place." (Font 18) (B "516174") 232 171 780 28
Draw-Chip $g 230 214 330 "Official sources" "SERC orders linked" "dbeafe"
Draw-Chip $g 590 214 330 "No account needed" "All core tools are free" "dcfce7"
Draw-Chip $g 950 214 390 "Private by default" "Runs in your browser" "fef3c7"
Draw-Checklist $g 112 334 480 $items
Draw-Text $g "Popular DISCOMs" (Font 24 "Bold") (B "111827") 636 342 300 34
Draw-Text $g "Jump straight to a tariff page or compare your provider." (Font 17) (B "64748b") 636 377 570 26
for ($i = 0; $i -lt $discoms.Count; $i++) {
  $col = $i % 4
  $row = [Math]::Floor($i / 4)
  Draw-DiscomButton $g (636 + $col * 210) (426 + $row * 80) 186 $discoms[$i]
}
$a = Save-Jpg $c "bill-section-option-a-trust-ribbon.jpg"

$c = Base-Canvas "Option B - Compact proof board"
$g = $c.G
Draw-Text $g "What happens after you calculate" (Font 30 "Bold") (B "111827") 112 100 520 46
Draw-Text $g "A quieter section that proves coverage, then offers the next best actions." (Font 19) (B "5f6c80") 112 145 700 30
$proof = @(
  @("324", "tariff records", "from public orders", "dbeafe"),
  @("66", "DISCOMs", "all India coverage", "dcfce7"),
  @("55", "public alerts", "tariff and FPPA changes", "fee2e2"),
  @("0", "sign-ups", "needed for calculator", "fef3c7")
)
for ($i = 0; $i -lt $proof.Count; $i++) {
  $x = 112 + $i * 344
  Fill-Round $g (B "ffffff") $x 206 314 150 18
  Stroke-Round $g (P "e3e8ef") $x 206 314 150 18
  Fill-Round $g (B $proof[$i][3]) ($x + 24) 230 50 50 14
  Draw-Text $g $proof[$i][0] (Font 36 "Bold") (B "1d4ed8") ($x + 94) 225 90 46
  Draw-Text $g $proof[$i][1] (Font 20 "Bold") (B "111827") ($x + 94) 272 180 28
  Draw-Text $g $proof[$i][2] (Font 16) (B "64748b") ($x + 24) 314 250 24
}
Fill-Round $g (B "ffffff") 112 398 628 244 18
Stroke-Round $g (P "e3e8ef") 112 398 628 244 18
Draw-Text $g "Bill breakdown includes" (Font 23 "Bold") (B "111827") 144 430 340 30
$yy = 486
foreach ($item in $items) {
  Draw-Text $g "✓" (Font 24 "Bold") (B "16a34a") 144 $yy 26 28
  Draw-Text $g $item (Font 18) (B "4b5870") 182 ($yy + 2) 380 25
  $yy += 38
}
Fill-Round $g (B "111827") 772 398 716 244 18
Draw-Text $g "Next, explore your provider" (Font 24 "Bold") (B "ffffff") 810 430 420 32
Draw-Text $g "Use the same verified data in tariffs, alerts, and guides." (Font 17) (B "cbd5e1") 810 465 500 26
for ($i = 0; $i -lt 6; $i++) {
  $col = $i % 3
  $row = [Math]::Floor($i / 3)
  Fill-Round $g (B "1f2937") (810 + $col * 210) (520 + $row * 68) 184 50 12
  Stroke-Round $g (P "334155") (810 + $col * 210) (520 + $row * 68) 184 50 12
  Draw-Text $g $discoms[$i] (Font 17 "Bold") (B "ffffff") (830 + $col * 210) (535 + $row * 68) 120 24
  Draw-Text $g ">" (Font 20 "Bold") (B "93c5fd") (956 + $col * 210) (533 + $row * 68) 20 24
}
$b = Save-Jpg $c "bill-section-option-b-proof-board.jpg"

$c = Base-Canvas "Option C - Action-led source panel"
$g = $c.G
Fill-Round $g (B "ffffff") 112 96 1376 520 22
Stroke-Round $g (P "e2e8f0") 112 96 1376 520 22
Fill-Round $g (B "f1f7ff") 144 132 482 430 18
Draw-Text $g "Checked against public electricity data" (Font 29 "Bold") (B "123c7c") 184 170 360 90
Draw-Text $g "Rates, fixed charges, fuel surcharge, duties, and subsidies are modelled from the same public tariff library used across the site." (Font 18) (B "506078") 184 270 360 92
Draw-Chip $g 184 392 360 "Source-first" "Every tariff page lists orders" "dbeafe"
Draw-Chip $g 184 478 360 "Browser calculation" "Private until you upload" "dcfce7"
Draw-Text $g "Popular DISCOM shortcuts" (Font 25 "Bold") (B "111827") 684 142 420 34
Draw-Text $g "Fast routes for the providers visitors search most." (Font 17) (B "64748b") 684 177 520 26
for ($i = 0; $i -lt $discoms.Count; $i++) {
  $col = $i % 2
  $row = [Math]::Floor($i / 2)
  Draw-DiscomButton $g (684 + $col * 330) (230 + $row * 76) 294 $discoms[$i]
}
Fill-Round $g (B "fff7ed") 684 548 624 52 12
Draw-Text $g "View all 66 DISCOMs ->" (Font 18 "Bold") (B "b45309") 708 563 260 24
Draw-Text $g "Tariff directory, alerts, and source docs" (Font 16) (B "7c2d12") 930 565 350 22
$cpath = Save-Jpg $c "bill-section-option-c-action-panel.jpg"

Write-Output $a
Write-Output $b
Write-Output $cpath
