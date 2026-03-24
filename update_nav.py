import os
import re

directory = r"c:\Users\hanee\OneDrive\Desktop\NH1Moto-20260311T081035Z-3-001\NH1Moto"

pattern = re.compile(r'([ \t]*)<a href="fleet\.html" class="nav-link( active)?">Fleet</a>')

def replacer(match):
    indent = match.group(1)
    active_class = match.group(2) or ""
    return f'{indent}<a href="about.html" class="nav-link">About Us</a>\n{indent}<a href="fleet.html" class="nav-link{active_class}">Fleet</a>'

for filename in os.listdir(directory):
    if filename.endswith(".html") and filename != "about.html":
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = pattern.sub(replacer, content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
        else:
            print(f"No match in {filename}")
