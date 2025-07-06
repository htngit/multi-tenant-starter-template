# PowerShell script to fix missing .js extensions in Stack Auth packages

# Define the base path for node_modules
$basePath = "$PWD\node_modules\@stackframe"

# Get all .js files in @stackframe packages
$jsFiles = Get-ChildItem -Path $basePath -Recurse -Filter "*.js" | Where-Object { $_.FullName -like "*\dist\*" }

Write-Host "Found $($jsFiles.Count) JavaScript files to process..."

foreach ($file in $jsFiles) {
    Write-Host "Processing: $($file.FullName)"
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Fix directory imports (from ".." to "../index.js")
    $content = $content -replace 'from "\.\."', 'from "../index.js"'
    $content = $content -replace "from '\.\.'"  , "from '../index.js'"
    
    # Fix import/export statements with relative paths (double quotes)
    $content = $content -replace 'from "(\./[^"]*?)"', 'from "$1.js"'
    $content = $content -replace 'from "(\.\./[^"]*?)"', 'from "$1.js"'
    
    # Fix import/export statements with relative paths (single quotes)
    $content = $content -replace "from '(\./[^']*?)'", "from '`$1.js'"
    $content = $content -replace "from '(\.\./[^']*?)'", "from '`$1.js'"
    
    # Remove double .js extensions if they were added incorrectly
    $content = $content -replace '\.js\.js', '.js'
    $content = $content -replace 'index\.js\.js', 'index.js'
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Fixed imports in $($file.Name)"
    } else {
        Write-Host "  No changes needed for $($file.Name)"
    }
}

Write-Host "Import fixing completed!"