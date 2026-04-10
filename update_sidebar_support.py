import os
import glob

# HTML chunks
SEARCH_SIDEBAR = '''        <a href="#" class="bottom-nav-item">
          <i class="ph ph-headphones"></i> Support
        </a>
        <a href="index.html" class="bottom-nav-item">
          <i class="ph ph-sign-out"></i> Sign Out
        </a>'''

REPLACE_SIDEBAR = '''        <a href="#" class="bottom-nav-item" onclick="document.getElementById('globalSupportModal').style.display='flex'">
          <i class="ph ph-headphones"></i> Support
        </a>
        <a href="index.html" class="bottom-nav-item" style="color: #dc2626;">
          <i class="ph ph-sign-out"></i> Sign Out
        </a>'''

MODAL_HTML = '''  <!-- Global Support Modal -->
  <div class="modal-overlay" id="globalSupportModal" style="display: none; justify-content: center; align-items: center; z-index: 9999;">
    <div class="modal-container" style="max-width: 400px; text-align: center;">
      <button class="modal-close" onclick="document.getElementById('globalSupportModal').style.display='none'"><i class="ph ph-x"></i></button>
      <div class="modal-header">
        <i class="ph-fill ph-lifebuoy" style="font-size: 3rem; color: var(--color-primary); margin-bottom: 16px; display: inline-block;"></i>
        <h2>Support Center</h2>
        <p>We're here to help! Reach out to us 24/7.</p>
      </div>
      <div style="background:var(--color-bg-light); padding:20px; border-radius:8px; font-size:0.95rem; margin-bottom:24px; color:var(--color-text-dark); line-height:1.6; text-align: left;">
        <strong>Email:</strong> <a href="mailto:support@smarthospital.com" style="color: var(--color-primary); text-decoration: none;">support@smarthospital.com</a><br>
        <strong>Phone:</strong> +1 (800) 555-0199<br>
        <strong>Live Chat:</strong> Currently Offline
      </div>
      <div class="modal-actions" style="justify-content: center;">
        <button class="btn btn-primary" onclick="document.getElementById('globalSupportModal').style.display='none'">Close</button>
      </div>
    </div>
  </div>
</body>'''

files = glob.glob('*.html')
count = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    modified = False
    
    if SEARCH_SIDEBAR in content:
        content = content.replace(SEARCH_SIDEBAR, REPLACE_SIDEBAR)
        modified = True
        
    if modified and "id=\"globalSupportModal\"" not in content and "</body>" in content:
        content = content.replace("</body>", MODAL_HTML)
        
    if modified:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        count += 1
        print(f"Updated {f}")

print(f"Successfully processed {count} files.")
