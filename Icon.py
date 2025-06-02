import webbrowser

# Open in Chrome; fallback to default browser if Chrome not found
try:
    webbrowser.get('chrome').open('http://localhost:3000')
except:
    webbrowser.open('http://localhost:3000')