$path = "c:\Users\hanee\OneDrive\Desktop\NH1Moto-20260311T081035Z-3-001\NH1Moto"
$port = 8080
$listener = New-Object Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving at http://localhost:$port/"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        $file = $req.Url.LocalPath
        if ($file -eq "/") { $file = "/index.html" }
        $reqPath = Join-Path $path $file
        
        if (Test-Path $reqPath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($reqPath)
            $res.ContentLength64 = $content.Length
            
            $ext = [System.IO.Path]::GetExtension($reqPath).ToLower()
            $mime = switch ($ext) {
                ".html" {"text/html"}
                ".css"  {"text/css"}
                ".js"   {"application/javascript"}
                ".png"  {"image/png"}
                ".jpg"  {"image/jpeg"}
                ".pdf"  {"application/pdf"}
                default {"application/octet-stream"}
            }
            $res.ContentType = $mime
            
            try {
                $res.OutputStream.Write($content, 0, $content.Length)
            } catch {}
        } else {
            $res.StatusCode = 404
        }
        $res.Close()
    } catch {
        Write-Host "Error serving request"
    }
}
