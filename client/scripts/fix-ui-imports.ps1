$ErrorActionPreference = 'Stop'

# Map of lowercase path segment to PascalCase filename
$map = @{ 
  'button'='Button'; 'card'='Card'; 'badge'='Badge'; 'input'='Input'; 'textarea'='Textarea';
  'progress'='Progress'; 'table'='Table'; 'select'='Select'; 'avatar'='Avatar'; 'skeleton'='Skeleton';
  'tooltip'='Tooltip'; 'tabs'='Tabs' 
}

$root = Join-Path $PSScriptRoot '..'
$files = Get-ChildItem -Path $root -Recurse -Include *.ts,*.tsx | Where-Object { $_.FullName -notmatch "node_modules" }
foreach ($file in $files) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  $updated = $content
  foreach ($key in $map.Keys) {
    $val = $map[$key]
    # Replace double-quoted imports
    $updated = $updated -replace ("@/components/ui/$key`""), ("@/components/ui/$val`"")
    # Replace single-quoted imports
    $updated = $updated -replace ("@/components/ui/$key'"), ("@/components/ui/$val'")
  }
  if ($updated -ne $content) {
    [IO.File]::WriteAllText($file.FullName, $updated)
    Write-Host "Updated:" $file.FullName
  }
}

Write-Host "Done normalizing UI imports."


