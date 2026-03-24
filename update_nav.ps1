$directory = "c:\Users\hanee\OneDrive\Desktop\NH1Moto-20260311T081035Z-3-001\NH1Moto"
$files = Get-ChildItem -Path $directory -Filter *.html
$pattern = '([ \t]*)<a href="fleet\.html" class="nav-link( active)?">Fleet</a>'

foreach ($file in $files) {
    if ($file.Name -eq "about.html") { continue }
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    if ([regex]::IsMatch($content, $pattern)) {
        # Replace matches with: indent + new link + newline + original match
        $newContent = [regex]::Replace($content, $pattern, "`${1}<a href=`"about.html`" class=`"nav-link`">About Us</a>`r`n`$&")
        
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
        Write-Output "Updated $($file.Name)"
    } else {
        Write-Output "No match in $($file.Name)"
    }
}
