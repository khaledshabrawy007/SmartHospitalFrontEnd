document.addEventListener("DOMContentLoaded", () => {
    const publicPages = ['index.html', 'register.html', 'doctor-register.html', 'home.html', ''];
    const currentPage = window.location.pathname.split("/").pop();

    // Try new session key first, fall back to legacy
    let user = null;
    const raw = localStorage.getItem("session") || localStorage.getItem("currentUser");
    try { if (raw) user = JSON.parse(raw); } catch {}

    // Auth Check: Redirect to login if unauthenticated on a private page
    if (!user && !publicPages.includes(currentPage)) {
        window.location.href = "index.html";
        return;
    }

    if (user) {
        const fullName = user.fullName || user.name || "User";
        let initials = "";
        const parts = fullName.split(' ').filter(n => n.length > 0);
        if (parts.length > 0) {
            initials += parts[0][0];
            if (parts.length > 1) initials += parts[parts.length - 1][0];
        } else { initials = "U"; }

        // Update names globally across the UI sidebar
        document.querySelectorAll(".user-profile-sm .name, .sidebar-bottom .name").forEach(n => {
            n.textContent = fullName;
        });

        // Update role display
        const roleLabel = user.userType === 'HRManager' ? 'HR Manager'
                        : user.userType === 'Doctor'    ? 'Attending Physician'
                        : 'Patient';
        document.querySelectorAll(".user-profile-sm .role, .sidebar-bottom .role").forEach(r => {
            r.textContent = user.role || roleLabel;
        });

        // Update avatars (using initials)
        document.querySelectorAll(".user-profile-sm img, .sidebar-bottom img, .profile-photo img").forEach(img => {
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials.toUpperCase())}&background=0f172a&color=fff`;
        });
    }

    // Logout buttons
    document.querySelectorAll('[data-action="logout"], .logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof clearSession === 'function') clearSession();
            else { localStorage.removeItem('session'); localStorage.removeItem('currentUser'); }
            window.location.href = 'index.html';
        });
    });
});
