document.addEventListener("DOMContentLoaded", () => {
    const publicPages = ['index.html', 'register.html', 'doctor-register.html', ''];
    const currentPage = window.location.pathname.split("/").pop();

    const currentUserData = localStorage.getItem("currentUser");
    
    // Auth Check: Redirect to login if unauthenticated on a private page
    if (!currentUserData && !publicPages.includes(currentPage)) {
        window.location.href = "index.html";
        return;
    }

    if (currentUserData) {
        try {
            const user = JSON.parse(currentUserData);
            const fullName = user.fullName || user.name || "Patient";
            let initials = "";
            const parts = fullName.split(' ').filter(n => n.length > 0);
            if (parts.length > 0) {
                initials += parts[0][0];
                if (parts.length > 1) {
                    initials += parts[parts.length - 1][0];
                }
            } else {
                initials = "U";
            }

            // Update names globally across the UI sidebar
            const names = document.querySelectorAll(".user-profile-sm .name, .sidebar-bottom .name");
            names.forEach(n => {
                n.textContent = fullName;
            });
            
            // Update roles if provided
            if (user.role) {
                const roles = document.querySelectorAll(".user-profile-sm .role, .sidebar-bottom .role");
                roles.forEach(r => {
                    r.textContent = user.role;
                });
            }

            // Update avatars (using initials)
            const avatars = document.querySelectorAll(".user-profile-sm img, .sidebar-bottom img, .profile-photo img");
            avatars.forEach(img => {
                img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials.toUpperCase())}&background=0f172a&color=fff`;
            });

        } catch (e) {
            console.error("Error parsing currentUser", e);
        }
    }

    // Logo navigation is handled via native <a> href links on each page's .logo element
});
