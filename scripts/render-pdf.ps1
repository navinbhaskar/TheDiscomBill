# Render PDF pages to PNG using the native Windows.Data.Pdf WinRT API (no external deps).
# Usage: powershell -File render-pdf.ps1 -Pdf "C:\path\file.pdf" -OutDir "C:\tmp" -Prefix "lmv17" -Pages "1,2,3" -Height 2200
param(
  [Parameter(Mandatory=$true)][string]$Pdf,
  [Parameter(Mandatory=$true)][string]$OutDir,
  [Parameter(Mandatory=$true)][string]$Prefix,
  [string]$Pages = "",          # comma list, 1-based; empty = all
  [int]$Height = 2200
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType=WindowsRuntime]
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$null = [Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType=WindowsRuntime]

$wrse = [System.WindowsRuntimeSystemExtensions].GetMethods()

function Await($op, $resultType) {
  $m = $wrse | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
  $task = $m.MakeGenericMethod($resultType).Invoke($null, @($op))
  $task.Wait(-1) | Out-Null
  $task.Result
}
function AwaitAction($action) {
  $m = $wrse | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' } | Select-Object -First 1
  $task = $m.Invoke($null, @($action))
  $task.Wait(-1) | Out-Null
}

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($Pdf)) ([Windows.Storage.StorageFile])
$doc  = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
Write-Output "PAGECOUNT=$($doc.PageCount)"

if ($Pages -eq "") { $pageNums = 1..([int]$doc.PageCount) }
else { $pageNums = $Pages.Split(',') | ForEach-Object { [int]$_.Trim() } }

foreach ($pn in $pageNums) {
  if ($pn -lt 1 -or $pn -gt $doc.PageCount) { continue }
  $page = $doc.GetPage([uint32]($pn - 1))
  $stream = [Windows.Storage.Streams.InMemoryRandomAccessStream]::new()
  $opts = [Windows.Data.Pdf.PdfPageRenderOptions]::new()
  $opts.DestinationHeight = [uint32]$Height
  AwaitAction ($page.RenderToStreamAsync($stream, $opts))
  $page.Dispose()

  $size = [uint32]$stream.Size
  $reader = [Windows.Storage.Streams.DataReader]::new($stream.GetInputStreamAt(0))
  Await ($reader.LoadAsync($size)) ([uint32]) | Out-Null
  $bytes = New-Object byte[] $size
  $reader.ReadBytes($bytes)
  $reader.Dispose(); $stream.Dispose()

  $out = Join-Path $OutDir ("{0}-p{1}.png" -f $Prefix, $pn)
  [System.IO.File]::WriteAllBytes($out, $bytes)
  Write-Output "WROTE=$out ($size bytes)"
}
