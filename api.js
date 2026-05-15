/**
 * SmartHospital API Client
 * Single source of truth for all backend communication.
 * Include this before any page-specific script.
 */

const API_BASE = 'https://localhost:7152';
const SESSION_KEY = 'session';

// ── Session helpers ────────────────────────────────────────────────────────────

function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
}

function saveSession(data) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    // Legacy key kept for backward compat during migration
    localStorage.removeItem('currentUser');
}

function requireAuth(allowedTypes = null) {
    const s = getSession();
    if (!s || !s.token) { window.location.href = 'index.html'; return null; }
    if (allowedTypes && !allowedTypes.includes(s.userType)) {
        window.location.href = 'index.html'; return null;
    }
    return s;
}

function redirectByRole(userType) {
    const routes = {
        Patient:   'dashboard.html',
        Doctor:    'doctor-appointments.html',
        HRManager: 'hr-dashboard.html'
    };
    window.location.href = routes[userType] || 'index.html';
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
    const s = getSession();
    const headers = {
        'Content-Type': 'application/json',
        ...(s?.token ? { Authorization: `Bearer ${s.token}` } : {}),
        ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 204) return null; // No Content

    let body;
    try { body = await res.json(); } catch { body = null; }

    if (!res.ok) {
        const msg = body?.error || body?.title || `HTTP ${res.status}`;
        throw new ApiError(msg, res.status, body);
    }
    return body;
}

class ApiError extends Error {
    constructor(message, status, body) {
        super(message);
        this.status = status;
        this.body = body;
    }
}

// ── Auth API ───────────────────────────────────────────────────────────────────

const AuthAPI = {
    login: (email, password) =>
        apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    registerPatient: (dto) =>
        apiFetch('/api/auth/register/patient', { method: 'POST', body: JSON.stringify(dto) }),

    registerDoctor: (dto) =>
        apiFetch('/api/auth/register/doctor', { method: 'POST', body: JSON.stringify(dto) }),

    changePassword: (dto) =>
        apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify(dto) })
};

// ── Appointments API ───────────────────────────────────────────────────────────

const AppointmentsAPI = {
    getAll: ()                  => apiFetch('/api/appointments'),
    getById: (id)               => apiFetch(`/api/appointments/${id}`),
    getByPatient: (patientId)   => apiFetch(`/api/appointments/patient/${patientId}`),
    getByDoctor: (doctorId)     => apiFetch(`/api/appointments/doctor/${doctorId}`),
    create: (dto)               => apiFetch('/api/appointments', { method: 'POST', body: JSON.stringify(dto) }),
    updateStatus: (id, status)  => apiFetch(`/api/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    cancel: (id)                => apiFetch(`/api/appointments/${id}`, { method: 'DELETE' })
};

// ── Doctors API ────────────────────────────────────────────────────────────────

const DoctorsAPI = {
    getAll: ()                   => apiFetch('/api/doctors'),
    getById: (id)                => apiFetch(`/api/doctors/${id}`),
    getBySpecialization: (spec)  => apiFetch(`/api/doctors/specialization/${encodeURIComponent(spec)}`),
    updateProfile: (id, dto)     => apiFetch(`/api/doctors/${id}/profile`, { method: 'PUT', body: JSON.stringify(dto) })
};

// ── Staff API ──────────────────────────────────────────────────────────────────

const StaffAPI = {
    getAll: ()                    => apiFetch('/api/staff'),
    getById: (id)                 => apiFetch(`/api/staff/${id}`),
    getPending: ()                => apiFetch('/api/staff/pending'),
    approve: (id)                 => apiFetch(`/api/staff/${id}/approve`, { method: 'PATCH' }),
    reject: (id, dto)             => apiFetch(`/api/staff/${id}/reject`, { method: 'PATCH', body: JSON.stringify(dto) }),
    updateKpis: (id, dto)         => apiFetch(`/api/staff/${id}/kpis`, { method: 'PUT', body: JSON.stringify(dto) })
};

// ── Patients API ───────────────────────────────────────────────────────────────

const PatientsAPI = {
    getAll: ()        => apiFetch('/api/patients'),
    getById: (id)     => apiFetch(`/api/patients/${id}`),
    update: (id, dto) => apiFetch(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(dto) })
};

// ── Admissions API ─────────────────────────────────────────────────────────────

const AdmissionsAPI = {
    getAll: ()                    => apiFetch('/api/admissions'),
    getById: (id)                 => apiFetch(`/api/admissions/${id}`),
    getByPatient: (patientId)     => apiFetch(`/api/admissions/patient/${patientId}`),
    getByStatus: (status)         => apiFetch(`/api/admissions/status/${status}`),
    create: (dto)                 => apiFetch('/api/admissions', { method: 'POST', body: JSON.stringify(dto) }),
    updateVitals: (id, dto)       => apiFetch(`/api/admissions/${id}/vitals`, { method: 'PUT', body: JSON.stringify(dto) }),
    executeDischrage: (id)        => apiFetch(`/api/admissions/${id}/execute-discharge`, { method: 'POST' }),
    saveReport: (id, dto)         => apiFetch(`/api/admissions/${id}/report`, { method: 'PUT', body: JSON.stringify(dto) }),
    runRiskAssessment: (id, dto)  => apiFetch(`/api/admissions/${id}/ai/risk-assessment`, { method: 'POST', body: JSON.stringify(dto) }),
    runChronicTreatment: (id, dto)=> apiFetch(`/api/admissions/${id}/ai/chronic-treatment`, { method: 'POST', body: JSON.stringify(dto) })
};

// ── Medical History API ────────────────────────────────────────────────────────

const MedicalHistoryAPI = {
    getMy: ()                   => apiFetch('/api/medical-history/my'),
    getByPatient: (patientId)   => apiFetch(`/api/medical-history/patient/${patientId}`),
    getById: (id)               => apiFetch(`/api/medical-history/${id}`),
    create: (dto)               => apiFetch('/api/medical-history', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id, dto)           => apiFetch(`/api/medical-history/${id}`, { method: 'PUT', body: JSON.stringify(dto) })
};

// ── Wards API ──────────────────────────────────────────────────────────────────

const WardsAPI = {
    getAll: ()                           => apiFetch('/api/wards'),
    getById: (id)                        => apiFetch(`/api/wards/${id}`),
    create: (dto)                        => apiFetch('/api/wards', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id, dto)                    => apiFetch(`/api/wards/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    getBeds: (id, status = null)         => apiFetch(`/api/wards/${id}/beds${status ? `?status=${status}` : ''}`),
    addBed: (wardId)                     => apiFetch(`/api/wards/${wardId}/beds`, { method: 'POST' }),
    updateBedStatus: (bedId, status)     => apiFetch(`/api/wards/beds/${bedId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
};

// ── Nurses API ─────────────────────────────────────────────────────────────────

const NursesAPI = {
    getAll: ()                               => apiFetch('/api/nurses'),
    getById: (id)                            => apiFetch(`/api/nurses/${id}`),
    getByWard: (wardId)                      => apiFetch(`/api/nurses/ward/${wardId}`),
    create: (dto)                            => apiFetch('/api/nurses', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id, dto)                        => apiFetch(`/api/nurses/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    deactivate: (id)                         => apiFetch(`/api/nurses/${id}/deactivate`, { method: 'PATCH' }),
    getByShift: (shiftId)                    => apiFetch(`/api/nurses/shifts/${shiftId}`),
    assignToShift: (shiftId, nurseId)        => apiFetch(`/api/nurses/shifts/${shiftId}/assign/${nurseId}`, { method: 'POST' }),
    removeFromShift: (shiftId, nurseId)      => apiFetch(`/api/nurses/shifts/${shiftId}/assign/${nurseId}`, { method: 'DELETE' })
};

// ── Shifts API ─────────────────────────────────────────────────────────────────

const ShiftsAPI = {
    getAll: ()                           => apiFetch('/api/shifts'),
    getById: (id)                        => apiFetch(`/api/shifts/${id}`),
    getByDate: (dateStr)                 => apiFetch(`/api/shifts/date?date=${dateStr}`),
    create: (dto)                        => apiFetch('/api/shifts', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id, dto)                    => apiFetch(`/api/shifts/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    delete: (id)                         => apiFetch(`/api/shifts/${id}`, { method: 'DELETE' }),
    assignDoctor: (shiftId, doctorId)    => apiFetch(`/api/shifts/${shiftId}/assign/${doctorId}`, { method: 'POST' }),
    removeDoctor: (shiftId, doctorId)    => apiFetch(`/api/shifts/${shiftId}/assign/${doctorId}`, { method: 'DELETE' })
};

// ── Ratings API ────────────────────────────────────────────────────────────────

const RatingsAPI = {
    create: (dto)               => apiFetch('/api/ratings', { method: 'POST', body: JSON.stringify(dto) }),
    getByPatient: (patientId)   => apiFetch(`/api/ratings/patient/${patientId}`),
    getByDoctor: (doctorId)     => apiFetch(`/api/ratings/doctor/${doctorId}`),
    getByAppointment: (apptId)  => apiFetch(`/api/ratings/appointment/${apptId}`),
};

// ── HR AI API ──────────────────────────────────────────────────────────────────

const HrAIAPI = {
    predictStaff: (dto)           => apiFetch('/api/hr/ai/staff/predict', { method: 'POST', body: JSON.stringify(dto) }),
    bedOccupancyForecast: (dto)   => apiFetch('/api/hr/ai/bed-occupancy/forecast', { method: 'POST', body: JSON.stringify(dto) })
};



// ── Toast notification helper ──────────────────────────────────────────────────

function showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.api-toast').forEach(t => t.remove());

    const colors = {
        success: '#10b981',
        error:   '#ef4444',
        info:    '#3b82f6',
        warning: '#f59e0b'
    };
    const icons = {
        success: 'ph-check-circle',
        error:   'ph-x-circle',
        info:    'ph-info',
        warning: 'ph-warning'
    };

    const toast = document.createElement('div');
    toast.className = 'api-toast';
    toast.innerHTML = `<i class="ph ${icons[type]}"></i> ${message}`;
    toast.style.cssText = `
        position:fixed; top:24px; right:24px; z-index:99999;
        background:${colors[type]}; color:#fff;
        padding:14px 20px; border-radius:10px;
        display:flex; align-items:center; gap:10px;
        font-size:14px; font-weight:500;
        box-shadow:0 4px 20px rgba(0,0,0,0.2);
        animation:slideInRight .3s ease;
        max-width:360px; line-height:1.4;
    `;

    // Add keyframe animation once
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInRight{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
            @keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(120%);opacity:0}}
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOutRight .3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ── Utility: format date ───────────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}
