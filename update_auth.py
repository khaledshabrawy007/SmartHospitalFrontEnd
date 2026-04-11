import os

target_dir = r"C:\Users\pc\.gemini\antigravity\scratch\smart-hospital-ui"
files = [f for f in os.listdir(target_dir) if f.endswith('.html') and f not in ('settings.html')]

count = 0
for file_name in files:
    path = os.path.join(target_dir, file_name)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<script src="auth-session.js"></script>' not in content:
            content = content.replace('</body>', '  <script src="auth-session.js"></script>\n</body>')
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file_name}")
            count += 1
    except Exception as e:
        print(f"Error processing {file_name}: {e}")

print(f"Total updated: {count}")
