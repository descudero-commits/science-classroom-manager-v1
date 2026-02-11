// ==========================================
// 1. CONFIGURACIÓN & TRADUCCIONES
// ==========================================
const PANTRY_ID = "9df76c09-c878-45e6-9df9-7b02d9cd00ef"; 
const BUCKET_NAME = "ScienceTeacherV12";
const CLOUD_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BUCKET_NAME}`;

const translations = {
    es: {
        sidebar_config: "⚙️ Configuración",
        nav_dash: "Dashboard",
        nav_classes: "Mis Clases",
        nav_notebook: "Notebook & Admin",
        dash_title: "Panel de Control",
        dash_alerts: "Alertas",
        dash_weekly: "Agenda Semanal",
        dash_schedule: "Horario Semanal",
        day_mon: "Lunes", day_tue: "Martes", day_wed: "Miércoles", day_thu: "Jueves", day_fri: "Viernes",
        classes_title: "Laboratorio de Clases",
        btn_new_class: "+ Nueva Clase",
        drag_hint: "💡 Arrastra las tarjetas para reordenarlas",
        tab_points: "🎮 Puntos", tab_planning: "📅 Planificación", tab_grades: "📊 Notas", tab_history: "📜 Historial",
        lbl_all: "Todos",
        reason_part: "Participación", reason_hw: "Tarea Completa", reason_beh: "Conducta", reason_lab: "Buen Laboratorio", reason_mat: "Material",
        btn_redeem: "🎁 Canjear",
        plan_week_title: "Plan para esta Semana",
        grades_hint: "✏️ Para editar notas, ve al <b>Notebook > Gradebook</b>.",
        nb_title: "Notebook del Docente",
        nb_tab_planner: "📅 Planner", nb_tab_hist: "📜 Historial Global", nb_tab_grade: "📝 Gradebook", nb_tab_admin: "👥 Admin Alumnos", nb_tab_shop: "🛍️ Tienda", nb_tab_log: "📖 Bitácora",
        planner_new: "Nueva Actividad / Lección",
        ph_task_title: "Título (ej. Reacción Redox)",
        tag_lesson: "📖 Lección", tag_test: "📝 Test", tag_hw: "🏠 Tarea", tag_proj: "🧪 Proyecto", tag_quiz: "⚡ Quiz",
        ph_period: "Periodo (ej. Trim 1)",
        ph_desc: "Descripción (ej. Pág 45-50...)",
        btn_save_plan: "Guardar Plan", btn_cancel: "Cancelar",
        ph_search_stu: "Buscar alumno...",
        lbl_sel_class: "Selecciona Clase:",
        ph_stu_name: "Nombre Alumno", btn_add: "Añadir",
        ph_reward: "Premio", btn_create: "Crear",
        imp_low: "🟢 Baja (Info)", imp_med: "🟠 Media (Aviso)", imp_high: "🔴 Alta (Crítico)",
        ph_incident: "Detalle del incidente...", btn_register: "Registrar",
        modal_config_title: "Configuración Global",
        sec_profile: "👤 Mi Perfil", ph_your_name: "Tu Nombre", btn_update_prof: "Actualizar Perfil",
        sec_data: "📂 Datos y Nube",
        btn_excel: "Descargar Excel", btn_upload: "Subir a Nube", btn_download: "Bajar de Nube",
        sec_theme: "🎨 Tema", 
        sec_lang: "🌍 Idioma", // TRADUCCION NUEVA
        btn_close: "Cerrar",
        modal_class_title: "Nueva Clase", ph_class_name: "Nombre (ej. Física 1A)", icon_hint: "Iconos sugeridos: ⚛️ 🧪 🧬 🔭 🔬 🔌 🧲 🪐 🦠",
        lbl_color: "Color:", btn_save: "Guardar",
        modal_sched_title: "Añadir al Horario", lbl_start: "Inicio", lbl_end: "Fin", btn_save_block: "Guardar Bloque",
        modal_redeem_title: "🎁 Canjear Premio",
        // Dynamic JS Strings
        txt_nothing_week: "Nada esta semana.",
        txt_nothing_here: "No hay premios.",
        txt_confirm_del: "¿Borrar?",
        txt_confirm_redeem: "¿Canjear?",
        txt_select_stu: "Selecciona alumnos.",
        txt_saved: "✅ Guardado.",
        txt_error: "❌ Error.",
        txt_students: "Alumnos",
        txt_empty: "Sin datos.",
        txt_class: "Clase...",
        txt_all_class: "📢 TODA LA CLASE",
        txt_student: "Estudiante", txt_date: "Fecha", txt_reason: "Razón", txt_pts: "Pts"
    },
    en: {
        sidebar_config: "⚙️ Settings",
        nav_dash: "Dashboard",
        nav_classes: "My Classes",
        nav_notebook: "Notebook & Admin",
        dash_title: "Dashboard",
        dash_alerts: "Alerts",
        dash_weekly: "Weekly Agenda",
        dash_schedule: "Weekly Schedule",
        day_mon: "Monday", day_tue: "Tuesday", day_wed: "Wednesday", day_thu: "Thursday", day_fri: "Friday",
        classes_title: "Class Lab",
        btn_new_class: "+ New Class",
        drag_hint: "💡 Drag cards to reorder",
        tab_points: "🎮 Points", tab_planning: "📅 Planning", tab_grades: "📊 Grades", tab_history: "📜 History",
        lbl_all: "All",
        reason_part: "Participation", reason_hw: "Homework", reason_beh: "Behavior", reason_lab: "Good Lab", reason_mat: "Material",
        btn_redeem: "🎁 Redeem",
        plan_week_title: "Plan for this Week",
        grades_hint: "✏️ To edit grades, go to <b>Notebook > Gradebook</b>.",
        nb_title: "Teacher Notebook",
        nb_tab_planner: "📅 Planner", nb_tab_hist: "📜 Global History", nb_tab_grade: "📝 Gradebook", nb_tab_admin: "👥 Students Admin", nb_tab_shop: "🛍️ Shop", nb_tab_log: "📖 Logbook",
        planner_new: "New Activity / Lesson",
        ph_task_title: "Title (e.g. Redox Reaction)",
        tag_lesson: "📖 Lesson", tag_test: "📝 Test", tag_hw: "🏠 Homework", tag_proj: "🧪 Project", tag_quiz: "⚡ Quiz",
        ph_period: "Period (e.g. Term 1)",
        ph_desc: "Description (e.g. Pg 45-50...)",
        btn_save_plan: "Save Plan", btn_cancel: "Cancel",
        ph_search_stu: "Search student...",
        lbl_sel_class: "Select Class:",
        ph_stu_name: "Student Name", btn_add: "Add",
        ph_reward: "Reward", btn_create: "Create",
        imp_low: "🟢 Low (Info)", imp_med: "🟠 Medium (Warning)", imp_high: "🔴 High (Critical)",
        ph_incident: "Incident details...", btn_register: "Register",
        modal_config_title: "Global Settings",
        sec_profile: "👤 My Profile", ph_your_name: "Your Name", btn_update_prof: "Update Profile",
        sec_data: "📂 Data & Cloud",
        btn_excel: "Download Excel", btn_upload: "Upload to Cloud", btn_download: "Download from Cloud",
        sec_theme: "🎨 Theme", 
        sec_lang: "🌍 Language", // TRADUCCION NUEVA
        btn_close: "Close",
        modal_class_title: "New Class", ph_class_name: "Name (e.g. Physics 1A)", icon_hint: "Suggested icons: ⚛️ 🧪 🧬 🔭 🔬 🔌 🧲 🪐 🦠",
        lbl_color: "Color:", btn_save: "Save",
        modal_sched_title: "Add to Schedule", lbl_start: "Start", lbl_end: "End", btn_save_block: "Save Block",
        modal_redeem_title: "🎁 Redeem Reward",
        // Dynamic JS Strings
        txt_nothing_week: "Nothing this week.",
        txt_nothing_here: "No rewards here.",
        txt_confirm_del: "Delete?",
        txt_confirm_redeem: "Redeem?",
        txt_select_stu: "Select students first.",
        txt_saved: "✅ Saved.",
        txt_error: "❌ Error.",
        txt_students: "Students",
        txt_empty: "No data.",
        txt_class: "Class...",
        txt_all_class: "📢 WHOLE CLASS",
        txt_student: "Student", txt_date: "Date", txt_reason: "Reason", txt_pts: "Pts"
    }
};

// ==========================================
// 2. ESTADO GLOBAL
// ==========================================
let appData = {
    settings: { 
        themeColor: '#3b82f6',
        teacherName: 'Profesor',
        teacherAvatar: '👨‍🔬',
        language: 'es'
    },
    classes: [],    
    students: [],   
    tasks: [],      
    anecdotes: [],  
    rewards: [],    
    history: [],    
    schedule: { mon:[], tue:[], wed:[], thu:[], fri:[] }
};

let currentClassId = null;
let currentDay = null;

// Helper de traducción
function t(key) {
    const lang = appData.settings.language || 'es';
    return translations[lang][key] || key;
}

document.addEventListener('DOMContentLoaded', () => {
    loadLocal();
    applyTheme(appData.settings.themeColor);
    updateProfileUI();
    updateLanguageUI();
    nav('dashboard');
});

// Idioma
function toggleLanguage() {
    appData.settings.language = appData.settings.language === 'es' ? 'en' : 'es';
    saveLocal();
    updateLanguageUI();
    // Refrescar vistas para aplicar cambios dinámicos
    nav('dashboard'); 
    renderClasses();
    initNotebook();
}

function updateLanguageUI() {
    const lang = appData.settings.language || 'es';
    document.getElementById('currentLangDisplay').innerText = lang === 'es' ? 'Español' : 'English';
    document.documentElement.lang = lang;

    // Traducir elementos estáticos del DOM
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if(translations[lang][key]) {
            if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerHTML = translations[lang][key];
            }
        }
    });
    
    // Actualizar botón del Modal Configuración
    const btnConfig = document.getElementById('btnConfigLang');
    if(btnConfig) {
        btnConfig.innerHTML = lang === 'es' ? "🇺🇸 Switch to English" : "🇪🇸 Cambiar a Español";
    }

    // Actualizar fecha header
    const dateOpts = { weekday: 'long', day: 'numeric', month: 'long' };
    const locale = lang === 'es' ? 'es-ES' : 'en-US';
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString(locale, dateOpts);
}

// Tema
function applyTheme(color) {
    document.documentElement.style.setProperty('--primary', color);
    appData.settings.themeColor = color;
}
function setTheme(color) { applyTheme(color); }

// Persistencia
function saveLocal() { localStorage.setItem('ScienceV12', JSON.stringify(appData)); }
function loadLocal() {
    const s = localStorage.getItem('ScienceV12');
    if(s) {
        const parsed = JSON.parse(s);
        appData = { ...appData, ...parsed, settings: { ...appData.settings, ...parsed.settings } };
    }
}

// Perfil
function openProfileModal() {
    document.getElementById('profName').value = appData.settings.teacherName;
    document.getElementById('profAvatar').value = appData.settings.teacherAvatar;
    document.getElementById('modalProfile').style.display = 'flex';
}
function saveProfileSettings() {
    const name = document.getElementById('profName').value;
    const avatar = document.getElementById('profAvatar').value;
    if(name) appData.settings.teacherName = name;
    if(avatar) appData.settings.teacherAvatar = avatar;
    updateProfileUI(); saveLocal(); closeModal('modalProfile');
}
function updateProfileUI() {
    document.getElementById('sidebarName').innerText = appData.settings.teacherName;
    document.getElementById('sidebarAvatar').innerText = appData.settings.teacherAvatar;
}

// Excel
function exportToExcel() {
    const data = [];
    appData.students.forEach(s => {
        const cls = appData.classes.find(c => c.id == s.classId);
        const row = { "Clase": cls ? cls.name : 'Sin Clase', "Nombre": s.name, "Puntos": s.points };
        appData.tasks.filter(t => t.classId == s.classId).forEach(t => {
            row[`Nota: ${t.title}`] = (s.grades && s.grades[t.id]) ? s.grades[t.id] : '-';
        });
        data.push(row);
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estudiantes");
    XLSX.writeFile(wb, "Science_Notes_Export.xlsx");
}

// Nav
function isDateInCurrentWeek(dateStr) {
    if(!dateStr) return false;
    const target = new Date(dateStr);
    const today = new Date();
    const day = today.getDay(); 
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(today.setDate(diff)); monday.setHours(0,0,0,0);
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23,59,59,999);
    return target >= monday && target <= sunday;
}
function nav(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-menu button').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    const btn = document.getElementById(`nav-${viewId}`);
    if(btn) btn.classList.add('active');
    if(viewId === 'classes') renderClasses();
    if(viewId === 'notebook') initNotebook();
    if(viewId === 'dashboard') updateDashboard();
}

// Dashboard
function updateDashboard() {
    const alerts = appData.anecdotes.filter(a => a.importance === 'high');
    const alertContainer = document.getElementById('dash-alerts');
    alertContainer.innerHTML = alerts.length ? '' : `<small style="color:#aaa">${t('txt_empty')}</small>`;
    alerts.forEach(a => {
        const s = appData.students.find(stu => stu.id == a.studentId);
        alertContainer.innerHTML += `<div class="alert-item"><b>${s ? s.name : 'General'}</b>: ${a.text}</div>`;
    });

    const planContainer = document.getElementById('dash-weekly-plan');
    const weeklyTasks = appData.tasks.filter(t => isDateInCurrentWeek(t.date)).sort((a,b) => new Date(a.date) - new Date(b.date));
    planContainer.innerHTML = weeklyTasks.length ? '' : `<small style="color:#aaa">${t('txt_nothing_week')}</small>`;
    weeklyTasks.forEach(tk => {
        const c = appData.classes.find(cl => cl.id == tk.classId);
        planContainer.innerHTML += `<div class="plan-item" style="border-left-color:${c ? c.color : '#ccc'}"><div><b>${c ? c.name : '?'}</b>: ${tk.title}</div><small>${tk.description || ''}</small></div>`;
    });
    renderScheduleView();
}

// Horario
function renderScheduleView() {
    ['mon','tue','wed','thu','fri'].forEach(d => {
        const div = document.getElementById(`sch-${d}`); 
        div.innerHTML = '';
        if(appData.schedule[d]) {
            appData.schedule[d].sort((a,b) => (a.start||'').localeCompare(b.start||'')).forEach((i, idx) => {
                const cls = appData.classes.find(c => c.id == i.classId);
                if(cls) div.innerHTML += `<div class="sched-item" style="background:${cls.color}"><span class="sched-time">${i.start} - ${i.end}</span><b>${cls.name}</b><span style="position:absolute; top:2px; right:5px; cursor:pointer;" onclick="delSched('${d}', ${idx})">×</span></div>`;
            });
        }
    });
}
function openScheduleModal(day) {
    currentDay = day;
    const sel = document.getElementById('schedClassSelect'); 
    sel.innerHTML = `<option value="">-- ${t('txt_class')} --</option>`;
    appData.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    document.getElementById('modalSchedule').style.display = 'flex';
}
function saveScheduleItem() {
    const cid = document.getElementById('schedClassSelect').value;
    const start = document.getElementById('schedTimeStart').value; const end = document.getElementById('schedTimeEnd').value;
    if(cid && start && end) {
        if(!appData.schedule[currentDay]) appData.schedule[currentDay] = [];
        appData.schedule[currentDay].push({ classId: cid, start, end });
        saveLocal(); renderScheduleView(); closeModal('modalSchedule');
    }
}
function delSched(day, idx) {
    if(confirm(t('txt_confirm_del'))) { appData.schedule[day].splice(idx, 1); saveLocal(); renderScheduleView(); }
}

// ==========================================
// 3. CLASES & DRAG AND DROP
// ==========================================
function renderClasses() {
    const grid = document.getElementById('classesGrid'); 
    grid.innerHTML = '';
    
    appData.classes.forEach((c, index) => {
        const count = appData.students.filter(s => s.classId == c.id).length;
        const icon = c.icon || '⚛️';
        
        const card = document.createElement('div');
        card.className = 'class-card';
        card.style.borderTop = `5px solid ${c.color}`;
        card.draggable = true;
        card.dataset.index = index;
        card.innerHTML = `
            <div style="font-size:2.5rem; margin-bottom:10px;">${icon}</div>
            <h3>${c.name}</h3>
            <small>${count} ${t('txt_students')}</small>
        `;
        
        card.onclick = (e) => { if(!card.classList.contains('dragging')) openClassDetail(c.id); };
        
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragover', dragOver);
        card.addEventListener('drop', dragDrop);
        card.addEventListener('dragenter', dragEnter);
        card.addEventListener('dragleave', dragLeave);
        card.addEventListener('dragend', dragEnd);

        grid.appendChild(card);
    });
}

// Funciones Drag & Drop
let dragSrcEl = null;

function dragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}
function dragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}
function dragEnter(e) { this.classList.add('over'); }
function dragLeave(e) { this.classList.remove('over'); }
function dragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.class-card').forEach(item => item.classList.remove('over'));
}
function dragDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (dragSrcEl !== this) {
        const srcIdx = parseInt(dragSrcEl.dataset.index);
        const targetIdx = parseInt(this.dataset.index);
        
        const temp = appData.classes[srcIdx];
        appData.classes[srcIdx] = appData.classes[targetIdx];
        appData.classes[targetIdx] = temp;
        
        saveLocal();
        renderClasses();
    }
    return false;
}

function openClassDetail(id) {
    currentClassId = id;
    const cls = appData.classes.find(c => c.id == id);
    if(!cls) return nav('classes');
    document.getElementById('detailTitle').innerText = `${cls.icon||'⚛️'} ${cls.name}`;
    document.getElementById('detailTitle').style.color = cls.color;
    nav('class-detail');
    renderStudents(); renderGradesViewOnly(); renderClassHistory(); renderClassPlanning();
}

// Estudiantes & Puntos
function renderStudents() {
    const list = document.getElementById('studentsList'); list.innerHTML = '';
    const classStudents = appData.students.filter(s => s.classId == currentClassId);
    if(classStudents.length === 0) { list.innerHTML = `<p style="grid-column:1/-1; text-align:center;">${t('txt_empty')}</p>`; return; }
    classStudents.forEach(s => {
        list.innerHTML += `<div class="student-card" id="card-${s.id}" onclick="toggleSelect(${s.id})"><input type="checkbox" class="stu-check" value="${s.id}"><b>${s.name}</b><span class="points-badge">${s.points} pts</span></div>`;
    });
}
function toggleSelect(id) {
    const card = document.getElementById(`card-${id}`);
    const check = card.querySelector('.stu-check');
    check.checked = !check.checked;
    check.checked ? card.classList.add('selected') : card.classList.remove('selected');
}
function toggleSelectAll() {
    const all = document.getElementById('selectAll').checked;
    document.querySelectorAll('.stu-check').forEach(c => {
        c.checked = all;
        const card = document.getElementById(`card-${c.value}`);
        all ? card.classList.add('selected') : card.classList.remove('selected');
    });
}
function applyPoints(amount) {
    const checks = document.querySelectorAll('.stu-check:checked');
    if(!checks.length) return alert(t('txt_select_stu'));
    const reason = document.getElementById('pointReason').value;
    checks.forEach(c => {
        const s = appData.students.find(stu => stu.id == c.value);
        if(s) { s.points += amount; addToHistory(s.id, s.classId, amount > 0 ? 'EARN' : 'PENALTY', amount, reason); }
    });
    saveLocal(); renderStudents(); renderClassHistory();
    document.getElementById('selectAll').checked = false; toggleSelectAll();
}
function applyCustomPoints() {
    const val = parseInt(document.getElementById('customPointsInput').value);
    if(!isNaN(val) && val !== 0) applyPoints(val);
}
function addToHistory(studentId, classId, type, amount, reason) {
    appData.history.push({ id: Date.now()+Math.random(), date: new Date().toLocaleString(), studentId, classId, type, amount, reason });
}
function renderClassHistory() {
    const container = document.getElementById('classHistoryList');
    const logs = appData.history.filter(h => h.classId == currentClassId).sort((a,b) => b.id - a.id).slice(0, 50);
    let html = `<div class="hist-row header"><div>${t('txt_student')}</div><div>${t('txt_date')}</div><div>${t('txt_reason')}</div><div>${t('txt_pts')}</div></div>`;
    logs.forEach(log => {
        const s = appData.students.find(stu => stu.id == log.studentId);
        if(s) html += `<div class="hist-row"><strong>${s.name}</strong><span style="font-size:0.8rem;color:#666">${log.date}</span><span>${log.reason}</span><span class="hist-badge ${log.amount > 0 ? 'h-earn' : 'h-spend'}">${log.amount>0?'+':''}${log.amount}</span></div>`;
    });
    container.innerHTML = html;
}
function renderClassPlanning() {
    const list = document.getElementById('classWeeklyPlanList');
    const tasks = appData.tasks.filter(tk => tk.classId == currentClassId && isDateInCurrentWeek(tk.date)).sort((a,b) => new Date(a.date) - new Date(b.date));
    list.innerHTML = tasks.length ? '' : `<p style="text-align:center;">${t('txt_nothing_week')}</p>`;
    tasks.forEach(tk => {
        list.innerHTML += `<div class="task-item"><div><b>${tk.title}</b> <span class="tag-badge tag-${tk.tag}">${tk.tag}</span><br><small>${tk.description || ''}</small></div><div>${new Date(tk.date).toLocaleDateString()}</div></div>`;
    });
}
function renderGradesViewOnly() {
    const table = document.getElementById('gradesTableView');
    const tasks = appData.tasks.filter(tk => tk.classId == currentClassId).sort((a,b)=>new Date(a.date)-new Date(b.date));
    const studs = appData.students.filter(s => s.classId == currentClassId);
    let html = `<thead><tr><th>${t('txt_student')}</th>${tasks.map(tk=>`<th>${tk.title}</th>`).join('')}</tr></thead><tbody>`;
    studs.forEach(s => {
        html += `<tr><td>${s.name}</td>${tasks.map(tk => `<td>${(s.grades && s.grades[tk.id]) ? s.grades[tk.id] : '-'}</td>`).join('')}</tr>`;
    });
    table.innerHTML = html + '</tbody>';
}
function openRedeemModal() {
    if(!document.querySelectorAll('.stu-check:checked').length) return alert(t('txt_select_stu'));
    const grid = document.getElementById('redeemGrid'); 
    grid.innerHTML = appData.rewards.length ? '' : `<p>${t('txt_nothing_here')}</p>`;
    appData.rewards.forEach(r => {
        grid.innerHTML += `<div class="redeem-item" onclick="processRedeem(${r.cost}, '${r.name}')"><b>${r.name}</b><br>${r.cost} pts</div>`;
    });
    document.getElementById('modalRedeem').style.display = 'flex';
}
function processRedeem(cost, name) {
    if(confirm(`${t('txt_confirm_redeem')} "${name}"?`)) {
        document.querySelectorAll('.stu-check:checked').forEach(c => {
            const s = appData.students.find(stu => stu.id == c.value);
            if(s) { s.points -= cost; addToHistory(s.id, s.classId, 'REDEEM', -cost, `Canje: ${name}`); }
        });
        saveLocal(); renderStudents(); renderClassHistory(); closeModal('modalRedeem');
    }
}

// ==========================================
// 4. NOTEBOOK & ADMIN
// ==========================================
function initNotebook() {
    const selects = ['taskClass', 'anecClass', 'gradebookClassSelect', 'adminStudentClass'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if(el) { el.innerHTML = `<option value="">${t('txt_class')}</option>`; appData.classes.forEach(c => el.innerHTML += `<option value="${c.id}">${c.name}</option>`); }
    });
    renderTasks(); renderStudentAdminList(); renderRewards(); renderAnecdotesNotebook(); renderGlobalHistory();
}
function openNbTab(id) {
    document.querySelectorAll('.nb-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nb-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
}

// Historial Global
function renderGlobalHistory() {
    const container = document.getElementById('globalHistoryContainer');
    const search = document.getElementById('globalHistSearch').value.toLowerCase();
    
    const logs = appData.history.sort((a,b) => b.id - a.id).filter(log => {
        const s = appData.students.find(stu => stu.id == log.studentId);
        return !search || (s && s.name.toLowerCase().includes(search));
    }).slice(0, 100);

    let html = `<table class="data-table"><thead><tr><th>${t('txt_date')}</th><th>${t('txt_class')}</th><th>${t('txt_student')}</th><th>${t('txt_reason')}</th><th>${t('txt_pts')}</th></tr></thead><tbody>`;
    logs.forEach(log => {
        const s = appData.students.find(stu => stu.id == log.studentId);
        const c = appData.classes.find(cl => cl.id == log.classId);
        if(s) {
            html += `<tr>
                <td>${log.date.split(',')[0]}</td>
                <td><small>${c ? c.name : '-'}</small></td>
                <td><b>${s.name}</b></td>
                <td>${log.reason}</td>
                <td><span class="hist-badge ${log.amount > 0 ? 'h-earn' : 'h-spend'}">${log.amount>0?'+':''}${log.amount}</span></td>
            </tr>`;
        }
    });
    container.innerHTML = html + '</tbody></table>';
}

// Planner
function addTask() {
    const id = document.getElementById('editTaskId').value; 
    const title = document.getElementById('taskTitle').value;
    const cid = document.getElementById('taskClass').value; 
    const date = document.getElementById('taskDate').value;
    const tag = document.getElementById('taskTag').value; 
    const period = document.getElementById('taskPeriod').value;
    const desc = document.getElementById('taskDesc').value;

    if(title && cid && date) {
        if(id) { 
            const tk = appData.tasks.find(x => x.id == id); 
            if(tk) { tk.title = title; tk.classId = cid; tk.date = date; tk.tag = tag; tk.period = period; tk.description = desc; } 
            cancelTaskEdit(); 
        } else { 
            appData.tasks.push({ id: Date.now(), title, classId: cid, date, tag, period, description: desc }); 
            document.getElementById('taskTitle').value = ''; 
            document.getElementById('taskDesc').value = '';
        }
        saveLocal(); renderTasks();
    }
}
function renderTasks() {
    const list = document.getElementById('tasksList'); list.innerHTML = '';
    appData.tasks.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(tk => {
        list.innerHTML += `
        <div class="task-item">
            <div>
                <b>${tk.title}</b> <span class="tag-badge tag-${tk.tag}">${tk.tag}</span>
                <br><small style="color:#666">${tk.description || ''}</small>
                <br><small>${tk.date}</small>
            </div>
            <button class="btn-act del" onclick="delTask(${tk.id})">🗑️</button>
        </div>`;
    });
}
function cancelTaskEdit() { 
    document.getElementById('taskTitle').value = ''; 
    document.getElementById('taskDesc').value = '';
    document.getElementById('editTaskId').value = ''; 
    document.getElementById('btnCancelTask').style.display = 'none'; 
}
function delTask(id) { if(confirm(t('txt_confirm_del'))) { appData.tasks = appData.tasks.filter(tk => tk.id !== id); saveLocal(); renderTasks(); } }

// Admin Alumnos & Notas
function renderCentralGradebook() {
    const cid = document.getElementById('gradebookClassSelect').value;
    const container = document.getElementById('centralGradebookContainer');
    if(!cid) return container.innerHTML = '';
    const tasks = appData.tasks.filter(tk => tk.classId == cid).sort((a,b)=>new Date(a.date)-new Date(b.date));
    const studs = appData.students.filter(s => s.classId == cid);
    let html = `<table class="data-table"><thead><tr><th>${t('txt_student')}</th>${tasks.map(tk=>`<th>${tk.title}</th>`).join('')}</tr></thead><tbody>`;
    studs.forEach(s => {
        html += `<tr><td><b>${s.name}</b></td>${tasks.map(tk => `<td><input type="number" value="${(s.grades && s.grades[tk.id]) ? s.grades[tk.id] : ''}" onchange="saveGrade(${s.id}, ${tk.id}, this.value)"></td>`).join('')}</tr>`;
    });
    container.innerHTML = html + `</tbody></table>`;
}
function saveGrade(sid, tid, val) { const s = appData.students.find(stu => stu.id == sid); if(s) { if(!s.grades) s.grades = {}; s.grades[tid] = val; saveLocal(); } }
function saveStudentAdmin() {
    const cid = document.getElementById('adminStudentClass').value; const name = document.getElementById('adminStudentName').value;
    if(!cid || !name) return;
    appData.students.push({ id: Date.now(), name, classId: cid, points: 0, grades: {} }); 
    document.getElementById('adminStudentName').value = '';
    saveLocal(); renderStudentAdminList();
}
function renderStudentAdminList() {
    const container = document.getElementById('adminStudentsList'); container.innerHTML = '';
    appData.classes.forEach(c => {
        const studs = appData.students.filter(s => s.classId == c.id);
        if(studs.length) { container.innerHTML += `<h4>${c.name}</h4>`; studs.forEach(s => container.innerHTML += `<div class="admin-student-item">${s.name} <button class="btn-act del" onclick="delStudent(${s.id})">🗑️</button></div>`); }
    });
}
function delStudent(id) { if(confirm(t('txt_confirm_del'))) { appData.students = appData.students.filter(s => s.id !== id); saveLocal(); renderStudentAdminList(); } }

// Bitácora y Premios
function saveAnecdote() {
    const cid = document.getElementById('anecClass').value; const sid = document.getElementById('anecStudent').value;
    const imp = document.getElementById('anecImportance').value; const txt = document.getElementById('anecText').value;
    if(cid && sid && txt) {
        appData.anecdotes.push({ id: Date.now(), classId: cid, studentId: sid, importance: imp, text: txt, date: new Date().toLocaleDateString() }); 
        document.getElementById('anecText').value = '';
        saveLocal(); renderAnecdotesNotebook();
    }
}
function renderAnecdotesNotebook() {
    const list = document.getElementById('notebookAnecdotesList'); list.innerHTML = '';
    appData.anecdotes.slice().reverse().forEach(a => {
        const sName = a.studentId === 'ALL' ? t('txt_all_class') : (appData.students.find(s=>s.id==a.studentId)?.name || '?');
        list.innerHTML += `<div class="anecdote-item ${a.importance}"><div style="flex:1;"><strong>${sName}</strong>: ${a.text}</div><button class="btn-act del" onclick="delAnec(${a.id})">🗑️</button></div>`;
    });
}
function delAnec(id) { if(confirm(t('txt_confirm_del'))) { appData.anecdotes = appData.anecdotes.filter(a => a.id !== id); saveLocal(); renderAnecdotesNotebook(); } }
function updateAnecStudents() {
    const cid = document.getElementById('anecClass').value;
    const sel = document.getElementById('anecStudent'); 
    sel.innerHTML = `<option value="">${t('txt_student')}</option>`; sel.disabled = !cid;
    if(cid) { sel.innerHTML += `<option value="ALL">${t('txt_all_class')}</option>`; appData.students.filter(s => s.classId == cid).forEach(s => sel.innerHTML += `<option value="${s.id}">${s.name}</option>`); }
}
function saveReward() {
    const name = document.getElementById('rewardName').value; const cost = document.getElementById('rewardCost').value;
    if(name && cost) { appData.rewards.push({ id: Date.now(), name, cost }); document.getElementById('rewardName').value = ''; saveLocal(); renderRewards(); }
}
function renderRewards() {
    const list = document.getElementById('rewardsConfigList'); list.innerHTML = '';
    appData.rewards.forEach(r => { list.innerHTML += `<div style="border:1px solid #ddd; padding:5px;">${r.name} (${r.cost})</div>`; });
}

// Gestión Clases
function saveClass() {
    const name = document.getElementById('modalClassName').value; 
    const color = document.getElementById('selectedColor').value; 
    const icon = document.getElementById('modalClassIcon').value || '⚛️';
    const editId = document.getElementById('editClassId').value;
    if(name) {
        if(editId) { 
            const cls = appData.classes.find(c => c.id == editId); 
            if(cls) { cls.name = name; cls.color = color; cls.icon = icon; } 
        }
        else { appData.classes.push({ id: Date.now(), name, color, icon }); }
        saveLocal(); renderClasses(); closeModal('modalClass');
    }
}
function editCurrentClass() { 
    const cls = appData.classes.find(c => c.id == currentClassId); 
    if(cls) { 
        document.getElementById('modalClassName').value = cls.name; 
        document.getElementById('modalClassIcon').value = cls.icon || '⚛️';
        document.getElementById('selectedColor').value = cls.color; 
        document.getElementById('editClassId').value = cls.id; 
        document.getElementById('modalClass').style.display = 'flex'; 
    } 
}
function deleteCurrentClass() { if(confirm(t('txt_confirm_del'))) { appData.classes = appData.classes.filter(c => c.id != currentClassId); saveLocal(); nav('classes'); } }
function pickColor(c) { document.getElementById('selectedColor').value = c; }
function openClassModal() { 
    document.getElementById('modalClassName').value = ""; 
    document.getElementById('modalClassIcon').value = ""; 
    document.getElementById('editClassId').value = ""; 
    document.getElementById('modalClass').style.display = 'flex'; 
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function openClassTab(id) { document.querySelectorAll('.class-tab-content').forEach(c => c.classList.remove('active')); document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); document.getElementById(id).classList.add('active'); event.target.classList.add('active'); }
function cancelStudentEdit() { document.getElementById('adminStudentName').value = ''; document.getElementById('btnCancelStudent').style.display = 'none'; }
function cancelRewardEdit() { document.getElementById('rewardName').value = ''; document.getElementById('btnCancelReward').style.display = 'none'; }
function cancelAnecEdit() { document.getElementById('anecText').value = ''; document.getElementById('btnCancelAnec').style.display = "none"; }

// Cloud
async function saveToCloud() {
    const btn = document.querySelector('.btn-cloud-save'); btn.innerText = '⏳';
    try { await fetch(CLOUD_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appData) }); alert(t('txt_saved')); } 
    catch(e) { alert(t('txt_error')); } btn.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> ${t('btn_upload')}`;
}
async function loadFromCloud() {
    if(!confirm("Overwrite local data?")) return;
    const btn = document.querySelector('.btn-cloud-load'); btn.innerText = '⏳';
    try { const res = await fetch(CLOUD_URL + '?t=' + Date.now()); const json = await res.json(); appData = json[BUCKET_NAME] || json; saveLocal(); location.reload(); } 
    catch(e) { alert(t('txt_error')); } btn.innerHTML = `<i class="fas fa-cloud-download-alt"></i> ${t('btn_download')}`;
}