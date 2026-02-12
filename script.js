// ================= TRADUCCIONES (i18n) =================
const TRANSLATIONS = {
    es: {
        settings: "Configuración",
        menu_main: "PRINCIPAL",
        dashboard: "Dashboard",
        notebook: "Notebook (Admin)",
        menu_classes: "MIS CLASES",
        new_class: "Nueva Clase",
        dash_desc: "Resumen general y Alertas",
        weekly_schedule: "Horario Semanal",
        edit_schedule: "Editar Horario",
        top_students: "🏆 Top Estudiantes",
        upcoming_events: "📌 Eventos Próximos",
        global_notebook: "Notebook Global",
        tab_students: "Estudiantes",
        tab_shop: "🎁 Catálogo",
        tab_history: "📜 Historial",
        tab_grades: "Notas",
        tab_planning: "Planning",
        tab_logs: "Bitácora",
        btn_add_student: "+ Alumno",
        btn_add_reward: "+ Recompensa",
        shop_desc: "Aquí defines los items que los alumnos pueden 'comprar'.",
        col_date: "Fecha",
        col_student: "Alumno",
        col_reason: "Razón",
        col_change: "Cambio",
        btn_add_col: "+ Columna",
        btn_add_event: "+ Evento",
        btn_add_log: "+ Nueva Entrada",
        class_mgmt: "Gestión de Aula",
        del_class: "Eliminar Clase",
        rewards_xp: "⭐ Recompensas (XP)",
        grades_quick: "📊 Calificaciones",
        logbook: "📖 Bitácora",
        add: "Agregar",
        lbl_teacher_name: "Nombre del Docente:",
        lbl_language: "Idioma / Language:",
        btn_restore: "📥 Restaurar",
        btn_backup: "📤 Guardar Nube",
        btn_save: "Guardar",
        btn_cancel: "Cancelar",
        btn_create: "Crear",
        new_student: "Nuevo Alumno",
        new_assignment: "Actividad",
        lbl_assign_class: "Asignar a Clase:",
        event_planning: "Evento / Planning",
        create_grade: "Crear nota",
        log_entry: "Entrada Bitácora",
        lbl_student: "Alumno:",
        lbl_importance: "Importancia:",
        add_schedule: "Agregar al Horario",
        lbl_day: "Día:",
        lbl_class: "Clase:",
        lbl_start: "Inicio",
        lbl_end: "Fin",
        btn_add: "Agregar",
        btn_give_take: "Dar / Quitar",
        btn_redeem: "Canjear",
        lbl_amount: "Cantidad:",
        lbl_reason: "Motivo:",
        btn_apply: "Aplicar",
        btn_close: "Cerrar",
        confirm_del: "¿Estás seguro?",
        alert_no_class: "Primero crea una clase.",
        val_invalid: "Dato inválido"
    },
    en: {
        settings: "Settings",
        menu_main: "MAIN",
        dashboard: "Dashboard",
        notebook: "Notebook (Admin)",
        menu_classes: "MY CLASSES",
        new_class: "New Class",
        dash_desc: "Overview & Alerts",
        weekly_schedule: "Weekly Schedule",
        edit_schedule: "Edit Schedule",
        top_students: "🏆 Top Students",
        upcoming_events: "📌 Upcoming Events",
        global_notebook: "Global Notebook",
        tab_students: "Students",
        tab_shop: "🎁 Shop (Catalog)",
        tab_history: "📜 History",
        tab_grades: "Grades",
        tab_planning: "Planning",
        tab_logs: "Logs",
        btn_add_student: "+ Student",
        btn_add_reward: "+ Reward",
        shop_desc: "Define items students can 'buy' with points here.",
        col_date: "Date",
        col_student: "Student",
        col_reason: "Reason",
        col_change: "Change",
        btn_add_col: "+ Column",
        btn_add_event: "+ Event",
        btn_add_log: "+ New Entry",
        class_mgmt: "Classroom Mgmt",
        del_class: "Delete Class",
        rewards_xp: "⭐ Rewards (XP)",
        grades_quick: "📊 Grades (Quick View)",
        logbook: "📖 Logbook",
        add: "Add",
        lbl_teacher_name: "Teacher Name:",
        lbl_language: "Language:",
        btn_restore: "📥 Restore Cloud",
        btn_backup: "📤 Save to Cloud",
        btn_save: "Save",
        btn_cancel: "Cancel",
        btn_create: "Create",
        new_student: "New Student",
        new_assignment: "Assignment",
        lbl_assign_class: "Assign to Class:",
        event_planning: "Planning Event",
        create_grade: "Create Grade Col",
        log_entry: "Log Entry",
        lbl_student: "Student:",
        lbl_importance: "Importance:",
        add_schedule: "Add to Schedule",
        lbl_day: "Day:",
        lbl_class: "Class:",
        lbl_start: "Start",
        lbl_end: "End",
        btn_add: "Add",
        btn_give_take: "Give / Remove",
        btn_redeem: "Redeem",
        lbl_amount: "Amount:",
        lbl_reason: "Reason:",
        btn_apply: "Apply",
        btn_close: "Close",
        confirm_del: "Are you sure?",
        alert_no_class: "Please create a class first.",
        val_invalid: "Invalid value"
    }
};

// ================= CONFIGURACIÓN =================
const PANTRY_ID = "TU_ID_DE_PANTRY_AQUI"; 
const BASKET_NAME = "teacherTitaniumV18";
const API_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BASKET_NAME}`;

// ================= ESTADO INICIAL =================
let app = {
    settings: { name: "Docente", lang: "es" }, // Ahora incluye lang
    classes: [], 
    students: [], 
    assignments: [], 
    grades: {}, 
    planning: [], 
    logs: [], 
    schedule: [],
    rewardsCatalog: [], 
    pointHistory: []
};
let currentClassId = null;
let currentStudentForPoints = null;

// Helper de traducción
function t(key) {
    const lang = app.settings.lang || 'es';
    return TRANSLATIONS[lang][key] || key;
}

// ================= INICIO =================
document.addEventListener('DOMContentLoaded', () => {
    loadLocal(); 
    initCustomizers(); 
    updateUI(); 
    nav('dashboard');
});

// ================= NAVEGACIÓN Y UTILIDADES =================
function nav(view) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    document.querySelectorAll('.menu button, .class-btn').forEach(b => b.classList.remove('active'));
    
    if(view==='dashboard') { 
        document.getElementById('nav-dashboard').classList.add('active'); 
        renderDashboard(); 
    }
    if(view==='notebook') { 
        document.getElementById('nav-notebook').classList.add('active'); 
        renderStudents(); 
    }
}

function switchNbTab(id) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if(id==='tab-nb-students') renderStudents();
    if(id==='tab-nb-gradebook') renderGradebook();
    if(id==='tab-nb-planning') renderPlanning();
    if(id==='tab-nb-logs') renderLogs();
    if(id==='tab-nb-rewards') renderRewardsCatalog();
    if(id==='tab-nb-history') renderGlobalHistory();
}

function openModal(id) { 
    // Si abrimos config, precargamos datos
    if(id === 'modalConfig') {
        document.getElementById('cfgName').value = app.settings.name;
        document.getElementById('cfgLang').value = app.settings.lang || 'es';
    }
    document.getElementById(id).style.display = 'flex'; 
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function saveData() { localStorage.setItem('TeacherTitaniumV18', JSON.stringify(app)); updateUI(); }
function loadLocal() { 
    const d = localStorage.getItem('TeacherTitaniumV18'); 
    if(d) {
        app = JSON.parse(d);
        if(!app.rewardsCatalog) app.rewardsCatalog = [];
        if(!app.pointHistory) app.pointHistory = [];
        if(!app.settings.lang) app.settings.lang = 'es';
    }
}

// ================= ACTUALIZACIÓN UI (TRADUCCIÓN) =================
function updateUI() {
    // 1. Perfil
    document.getElementById('lblProfileName').innerText = app.settings.name;
    
    // 2. Traducción de textos estáticos
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerText = t(el.getAttribute('data-i18n'));
    });

    // 3. Lista lateral de clases
    const l = document.getElementById('sidebarClassList'); l.innerHTML='';
    app.classes.forEach(c => {
        const b = document.createElement('button'); b.className = 'class-btn'; b.style.borderLeftColor = c.color;
        b.innerHTML = `<i class="fas ${c.icon}" style="color:${c.color}"></i> ${c.name}`;
        b.onclick = () => openClassView(c.id); l.appendChild(b);
    });

    // 4. Actualizar Selectores Generales
    ['newStudClass','newAssClass','filterStudentClass','filterGradebookClass'].forEach(id => {
        const s = document.getElementById(id); 
        if(s){ 
            s.innerHTML=`<option value="">-- ${t('lbl_class')} --</option>`; 
            app.classes.forEach(c=>s.innerHTML+=`<option value="${c.id}">${c.name}</option>`); 
        }
    });
}

// ================= DASHBOARD =================
function renderDashboard() {
    const alertBox = document.getElementById('dashAlerts');
    alertBox.innerHTML = '';
    const highLogs = app.logs.filter(l => l.importance === 'high');
    if(highLogs.length > 0) {
        highLogs.forEach(l => {
            const s = app.students.find(x => x.id == l.studentId);
            const c = app.classes.find(x => x.id == l.classId);
            alertBox.innerHTML += `
            <div class="alert-banner">
                <div><i class="fas fa-exclamation-triangle"></i> <strong>${s?s.name:'Student'}</strong> (${c?c.name:''}) - ${l.text}</div>
                <button onclick="deleteLog('${l.id}')" style="background:none;border:none;color:#7f1d1d;cursor:pointer">OK</button>
            </div>`;
        });
    }

    const scheduleGrid = document.getElementById('dashSchedule');
    scheduleGrid.innerHTML = '';
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    days.forEach(day => {
        const dayItems = app.schedule.filter(s => s.day === day).sort((a,b) => a.start.localeCompare(b.start));
        let html = `<div class="day-col"><h4>${day.substring(0,3)}</h4>`;
        dayItems.forEach(item => {
            const cls = app.classes.find(c => c.id == item.classId);
            html += `
            <div class="sch-item" style="border-left-color: ${cls?cls.color:'#ccc'}">
                <div style="font-weight:bold; color:${cls?cls.color:'#ccc'}">${cls?cls.name:'?'}</div>
                <small>${item.start} - ${item.end}</small>
                <button onclick="deleteScheduleItem('${item.id}')" style="float:right;border:none;background:none;color:red;cursor:pointer;">×</button>
            </div>`;
        });
        html += `</div>`;
        scheduleGrid.innerHTML += html;
    });

    const topList = document.getElementById('dashTopStudents');
    topList.innerHTML = '';
    [...app.students].sort((a,b) => (b.points || 0) - (a.points || 0)).slice(0, 5).forEach((s, i) => {
        const cls = app.classes.find(c => c.id == s.classId);
        topList.innerHTML += `
        <div class="top-student-row">
            <div><span class="medal">${["🥇","🥈","🥉"][i]||"🏅"}</span> <b>${s.name}</b> <small>(${cls?cls.name:''})</small></div>
            <span class="xp-badge">${s.points || 0} XP</span>
        </div>`;
    });

    const planList = document.getElementById('dashPlannerList');
    planList.innerHTML = '';
    app.planning.sort((a,b) => new Date(a.date) - new Date(b.date))
       .filter(p => new Date(p.date) >= new Date().setHours(0,0,0,0)).slice(0,5)
       .forEach(p => {
           planList.innerHTML += `<div style="padding:10px; border-bottom:1px solid #eee">📌 <b>${p.title}</b> <small>(${p.date})</small></div>`;
       });
}

// ================= PLANNING (CORREGIDO) =================
function openPlanningModal(editId=null) {
    openModal('modalPlanning');
    
    // FIX: Llenar el dropdown SIEMPRE al abrir
    const sel = document.getElementById('planClass'); 
    sel.innerHTML = `<option value="">-- ${t('lbl_class')} --</option>`;
    if(app.classes.length === 0) {
        alert(t('alert_no_class'));
        closeModal('modalPlanning');
        return;
    }
    app.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    
    if(editId) {
        const p = app.planning.find(x => x.id === editId);
        document.getElementById('planEditId').value = p.id;
        document.getElementById('planTitle').value = p.title;
        document.getElementById('planDate').value = p.date;
        document.getElementById('planTag').value = p.tag;
        document.getElementById('planClass').value = p.classId;
        document.getElementById('planDesc').value = p.desc;
        document.querySelector('.smart-link-box').style.display = 'none';
    } else {
        document.getElementById('planEditId').value = ""; 
        document.getElementById('planTitle').value = "";
        document.querySelector('.smart-link-box').style.display = 'block';
    }
}

function checkSmartKeywords() {
    const val = document.getElementById('planTitle').value.toLowerCase();
    if(["examen","prueba","test","quiz","exam"].some(k=>val.includes(k))) document.getElementById('planLinkToGradebook').checked = true;
}

function savePlanning() {
    const id = document.getElementById('planEditId').value;
    const title = document.getElementById('planTitle').value;
    const date = document.getElementById('planDate').value;
    const cid = document.getElementById('planClass').value;
    const desc = document.getElementById('planDesc').value;
    
    if(title && cid) {
        if(id) {
            const idx = app.planning.findIndex(p => p.id === id);
            if(idx > -1) app.planning[idx] = { ...app.planning[idx], title, date, classId: cid, desc };
        } else {
            app.planning.push({ id: Date.now().toString(), title, date, tag: document.getElementById('planTag').value, classId: cid, desc });
            if(document.getElementById('planLinkToGradebook').checked) {
                app.assignments.push({ id: Date.now().toString()+"_lnk", classId: cid, title, tag: "EV" });
            }
        }
        saveData(); renderPlanning(); renderDashboard(); closeModal('modalPlanning');
    } else {
        alert(t('val_invalid'));
    }
}

function renderPlanning() {
    const div = document.getElementById('planningGrid'); div.innerHTML = '';
    app.planning.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(p => {
        const c = app.classes.find(x=>x.id==p.classId);
        div.innerHTML += `<div class="card" style="padding:15px"><h4>${p.title}</h4><small>${p.date} - ${c?c.name:'?'}</small><div style="margin-top:5px"><button class="btn-icon" onclick="openPlanningModal('${p.id}')">✏️</button><button class="btn-icon" style="color:red" onclick="deletePlan('${p.id}')">×</button></div></div>`;
    });
}
function deletePlan(id) { app.planning = app.planning.filter(p=>p.id!==id); saveData(); renderPlanning(); renderDashboard(); }


// ================= POINTS & MANAGER =================
function renderClassStudentGrid() {
    const grid = document.getElementById('classStudentGrid');
    grid.innerHTML = '';
    const studentsInClass = app.students.filter(s => s.classId == currentClassId);

    if(studentsInClass.length === 0) {
        grid.innerHTML = '<p style="color:#888; grid-column:1/-1; text-align:center">Empty / Vacío</p>'; return;
    }

    studentsInClass.forEach(s => {
        grid.innerHTML += `
        <div class="student-card">
            <h4>${s.name}</h4>
            <div style="margin:10px 0;">
                <span class="xp-badge">⭐ ${s.points || 0} XP</span>
            </div>
            <div class="btn-xp-row">
                <button class="btn-xp plus" onclick="quickPoint('${s.id}', 1)" title="+1 XP">+</button>
                <button class="btn-xp" style="background:#eff6ff; color:#2563eb" onclick="openPointsManager('${s.id}')" title="Options">⚡</button>
                <button class="btn-xp minus" onclick="quickPoint('${s.id}', -1)" title="-1 XP">-</button>
            </div>
        </div>`;
    });
}

function openPointsManager(studentId) {
    currentStudentForPoints = studentId;
    const s = app.students.find(x => x.id == studentId);
    if(!s) return;

    document.getElementById('pmTitle').innerText = s.name;
    document.getElementById('pmCurrentPoints').innerText = `${s.points || 0} XP`;
    document.getElementById('customPoints').value = "";
    document.getElementById('pointsReason').value = "";
    
    const redeemGrid = document.getElementById('pmRedeemGrid');
    redeemGrid.innerHTML = '';
    if(app.rewardsCatalog.length === 0) {
        redeemGrid.innerHTML = '<p style="text-align:center;color:#888;grid-column:1/-1">No items.</p>';
    } else {
        app.rewardsCatalog.forEach(r => {
            const canAfford = (s.points || 0) >= r.cost;
            redeemGrid.innerHTML += `
            <div class="reward-item ${canAfford?'':'disabled'}" onclick="${canAfford ? `redeemReward('${r.id}')` : ''}" style="opacity:${canAfford?1:0.5}">
                <div style="font-size:1.5rem">${r.icon}</div>
                <div>${r.title}</div>
                <div class="reward-cost">${r.cost} XP</div>
            </div>`;
        });
    }
    switchPointMode('give'); 
    openModal('modalPointsManager');
}

function switchPointMode(mode) {
    document.querySelectorAll('.points-mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-mode-${mode}`).classList.add('active');
    document.getElementById('panel-give').style.display = mode === 'give' ? 'block' : 'none';
    document.getElementById('panel-redeem').style.display = mode === 'redeem' ? 'block' : 'none';
}

function applyCustomPoints() {
    const amount = parseInt(document.getElementById('customPoints').value);
    const reason = document.getElementById('pointsReason').value || "Manual";
    if(isNaN(amount) || amount === 0) return alert(t('val_invalid'));
    executePointTransaction(currentStudentForPoints, amount, reason, amount > 0 ? 'give' : 'remove');
    closeModal('modalPointsManager');
}

function redeemReward(rewardId) {
    const r = app.rewardsCatalog.find(x => x.id === rewardId);
    if(confirm(`${t('btn_redeem')} ${r.title}?`)) {
        executePointTransaction(currentStudentForPoints, -r.cost, `Shop: ${r.title}`, 'redeem');
        closeModal('modalPointsManager');
    }
}

function quickPoint(sid, amount) {
    executePointTransaction(sid, amount, amount > 0 ? "Bonus" : "Penalty", amount > 0 ? 'give' : 'remove');
}

function executePointTransaction(studentId, amount, reason, type) {
    const s = app.students.find(x => x.id == studentId);
    if(s) {
        if(typeof s.points !== 'number') s.points = 0;
        s.points += amount;
        app.pointHistory.push({
            id: Date.now().toString(),
            studentId, classId: s.classId,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
            amount, reason, type
        });
        saveData();
        if(document.getElementById('view-class').classList.contains('active')) renderClassStudentGrid();
        if(document.getElementById('view-notebook').classList.contains('active')) renderGlobalHistory();
    }
}

function renderRewardsCatalog() {
    const grid = document.getElementById('rewardsList');
    grid.innerHTML = '';
    app.rewardsCatalog.forEach(r => {
        grid.innerHTML += `
        <div class="reward-item">
            <div style="font-size:2rem">${r.icon}</div>
            <strong>${r.title}</strong>
            <div class="reward-cost">${r.cost} XP</div>
            <button onclick="deleteReward('${r.id}')" style="margin-top:5px;color:red;background:none;border:none;cursor:pointer">x</button>
        </div>`;
    });
}
function addReward() {
    const title = prompt("Name/Item:");
    if(!title) return;
    const cost = parseInt(prompt("Cost (XP):", "10"));
    const icon = prompt("Emoji:", "🎁");
    app.rewardsCatalog.push({ id: Date.now().toString(), title, cost, icon });
    saveData(); renderRewardsCatalog();
}
function deleteReward(id) { if(confirm(t('confirm_del'))){ app.rewardsCatalog = app.rewardsCatalog.filter(r=>r.id!==id); saveData(); renderRewardsCatalog(); } }

function renderGlobalHistory() {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';
    const hist = [...app.pointHistory].reverse().slice(0, 100);
    hist.forEach(h => {
        const s = app.students.find(x => x.id == h.studentId);
        tbody.innerHTML += `<tr><td>${h.date}</td><td>${s?s.name:'?'}</td><td>${h.reason}</td><td class="${h.amount>0?'hist-plus':'hist-minus'}">${h.amount>0?'+':''}${h.amount}</td></tr>`;
    });
}

// ================= HORARIO =================
function addScheduleItem() {
    const day = document.getElementById('schDay').value;
    const cid = document.getElementById('schClass').value;
    const start = document.getElementById('schStart').value;
    const end = document.getElementById('schEnd').value;
    if(cid && start && end) {
        app.schedule.push({ id: Date.now().toString(), day, classId: cid, start, end });
        saveData(); renderDashboard(); closeModal('modalSchedule');
    }
}
function deleteScheduleItem(id) {
    if(confirm(t('confirm_del'))) { app.schedule = app.schedule.filter(s => s.id !== id); saveData(); renderDashboard(); }
}

// ================= GRADEBOOK & LOGS =================
function openAssignmentModal(editId=null) {
    openModal('modalAssignment');
    const sel = document.getElementById('newAssClass'); sel.innerHTML = `<option value="">-- ${t('lbl_class')} --</option>`;
    app.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    if(editId) {
        const t = app.assignments.find(a=>a.id===editId);
        document.getElementById('assEditId').value=t.id; document.getElementById('newAssTitle').value=t.title; document.getElementById('newAssTag').value=t.tag; document.getElementById('newAssClass').value=t.classId;
    } else {
        document.getElementById('assEditId').value=""; document.getElementById('newAssTitle').value="";
    }
}
function saveAssignment() {
    const id = document.getElementById('assEditId').value;
    const title = document.getElementById('newAssTitle').value;
    const cid = document.getElementById('newAssClass').value;
    if(title && cid) {
        if(id) {
            const idx = app.assignments.findIndex(a=>a.id===id);
            if(idx>-1) { app.assignments[idx].title=title; app.assignments[idx].tag=document.getElementById('newAssTag').value; app.assignments[idx].classId=cid; }
        } else {
            app.assignments.push({ id: Date.now().toString(), classId: cid, title, tag: document.getElementById('newAssTag').value });
        }
        saveData(); renderGradebook(); closeModal('modalAssignment');
    }
}
function renderGradebook() {
    const cid = document.getElementById('filterGradebookClass').value;
    const div = document.getElementById('gradebookContainer');
    if(!cid) { div.innerHTML='<p style="padding:20px;color:#888">Select Class / Seleccione Clase</p>'; return; }
    const assigns = app.assignments.filter(a => a.classId == cid);
    const studs = app.students.filter(s => s.classId == cid);
    let html = `<table><thead><tr><th>${t('col_student')}</th>`;
    assigns.forEach(a => html += `<th>${a.title} <button class="btn-icon" onclick="openAssignmentModal('${a.id}')">✏️</button></th>`);
    html += `</tr></thead><tbody>`;
    studs.forEach(s => {
        html += `<tr><td><b>${s.name}</b></td>`;
        assigns.forEach(a => {
            const k = `${s.id}_${a.id}`;
            html += `<td><input type="number" class="gb-input" value="${app.grades[k]||""}" onchange="app.grades['${k}']=this.value;saveData()"></td>`;
        });
        html += `</tr>`;
    });
    div.innerHTML = html + `</tbody></table>`;
}

function openLogModal(editId=null) {
    openModal('modalLog');
    const sel = document.getElementById('logStudent'); sel.innerHTML = '';
    app.classes.forEach(c => {
        const g = document.createElement('optgroup'); g.label = c.name;
        app.students.filter(s=>s.classId==c.id).forEach(s=>{ const o=document.createElement('option'); o.value=s.id; o.innerText=s.name; g.appendChild(o); });
        sel.appendChild(g);
    });
    if(editId) {
        const l = app.logs.find(x=>x.id===editId);
        document.getElementById('logEditId').value=l.id; document.getElementById('logStudent').value=l.studentId; document.getElementById('logImp').value=l.importance; document.getElementById('logText').value=l.text;
    } else { document.getElementById('logEditId').value=""; document.getElementById('logText').value=""; }
}
function saveLog() {
    const id = document.getElementById('logEditId').value;
    const sid = document.getElementById('logStudent').value;
    const txt = document.getElementById('logText').value;
    if(sid && txt) {
        if(id) {
            const idx = app.logs.findIndex(l=>l.id===id);
            if(idx>-1) { app.logs[idx].studentId=sid; app.logs[idx].importance=document.getElementById('logImp').value; app.logs[idx].text=txt; }
        } else {
            const s = app.students.find(x=>x.id==sid);
            app.logs.push({ id: Date.now().toString(), studentId: sid, classId: s.classId, date: new Date().toLocaleDateString(), text: txt, importance: document.getElementById('logImp').value });
        }
        saveData(); renderLogs(); renderDashboard(); closeModal('modalLog');
    }
}
function renderLogs() {
    const div = document.getElementById('globalLogsList'); div.innerHTML = '';
    [...app.logs].reverse().forEach(l => {
        const s = app.students.find(x=>x.id==l.studentId);
        div.innerHTML += `<div class="log-card ${l.importance}"><div style="display:flex;justify-content:space-between"><span>${l.date} - <b>${s?s.name:''}</b></span><div class="action-icons"><button class="btn-icon" onclick="openLogModal('${l.id}')">✏️</button><button class="btn-icon" style="color:red" onclick="deleteLog('${l.id}')">×</button></div></div><p>${l.text}</p></div>`;
    });
}
function deleteLog(id) { app.logs=app.logs.filter(l=>l.id!==id); saveData(); renderLogs(); renderDashboard(); }

// ================= CRUD CLASES & ESTUDIANTES =================
function addClass() {
    const name = document.getElementById('newClassName').value;
    if(name) { app.classes.push({ id: Date.now().toString(), name, icon: document.getElementById('selectedIcon').value, color: document.getElementById('selectedColor').value }); saveData(); closeModal('modalClass'); }
}
function openClassView(id) {
    currentClassId = id; const c = app.classes.find(x => x.id == id);
    document.getElementById('viewClassTitle').innerText = c.name; document.getElementById('viewClassTitle').style.color = c.color;
    renderClassStudentGrid(); renderClassGradebookView(); renderClassLogbookView(); nav('class');
}
function renderClassGradebookView() {
    const d = document.getElementById('classGradebookView');
    const as = app.assignments.filter(a=>a.classId==currentClassId);
    const st = app.students.filter(s=>s.classId==currentClassId);
    let h = `<table><thead><tr><th>Student</th>`; as.forEach(a=>h+=`<th>${a.tag}</th>`); h+=`<th>Avg</th></tr></thead><tbody>`;
    st.forEach(s => {
        let sum=0, c=0; h+=`<tr><td>${s.name}</td>`;
        as.forEach(a => { const v = parseFloat(app.grades[`${s.id}_${a.id}`]); if(!isNaN(v)){sum+=v;c++;} h+=`<td>${v||'-'}</td>`; });
        h+=`<td><b>${c?(sum/c).toFixed(1):'-'}</b></td></tr>`;
    });
    d.innerHTML = h+`</tbody></table>`;
}
function renderClassLogbookView() {
    const d = document.getElementById('classLogbookView'); d.innerHTML='';
    app.logs.filter(l=>l.classId==currentClassId).reverse().forEach(l => {
        const s = app.students.find(x=>x.id==l.studentId);
        d.innerHTML += `<div class="log-card ${l.importance}"><small>${l.date} - ${s?s.name:''}</small><p>${l.text}</p></div>`;
    });
}
function deleteCurrentClass() { if(confirm(t('confirm_del'))) { app.classes=app.classes.filter(c=>c.id!==currentClassId); nav('dashboard'); saveData(); } }

function addStudent() { const name = document.getElementById('newStudName').value; const cid = document.getElementById('newStudClass').value; if(name && cid) { app.students.push({ id: Date.now().toString(), name, classId: cid, points: 0 }); saveData(); renderStudents(); closeModal('modalStudent'); } }
function renderStudents() {
    const cid = document.getElementById('filterStudentClass').value;
    const t = document.getElementById('studentsTable');
    let d = app.students; if(cid) d = d.filter(s => s.classId == cid);
    let h = `<table><thead><tr><th>Name</th><th>XP</th><th>X</th></tr></thead><tbody>`;
    d.forEach(s => h += `<tr><td>${s.name}</td><td>⭐ ${s.points||0}</td><td><button onclick="deleteStud('${s.id}')" style="color:red;border:none;background:none">×</button></td></tr>`);
    t.innerHTML = h + `</tbody></table>`;
}
function deleteStud(id) { if(confirm(t('confirm_del'))) { app.students = app.students.filter(s => s.id !== id); saveData(); renderStudents(); } }

// ================= SISTEMA =================
function initCustomizers() {
    const iCont=document.getElementById('iconSelector'), cCont=document.getElementById('colorSelector');
    if(iCont.innerHTML==='') {
        ['fa-book','fa-flask','fa-music','fa-calculator'].forEach(i=>iCont.innerHTML+=`<div class="sel-opt" onclick="document.getElementById('selectedIcon').value='${i}';this.parentNode.querySelectorAll('.sel-opt').forEach(x=>x.classList.remove('selected'));this.classList.add('selected')"><i class="fas ${i}"></i></div>`);
        ['#2563eb','#dc2626','#16a34a','#d97706'].forEach(c=>cCont.innerHTML+=`<div class="sel-color" style="background:${c}" onclick="document.getElementById('selectedColor').value='${c}';this.parentNode.querySelectorAll('.sel-color').forEach(x=>x.classList.remove('selected'));this.classList.add('selected')"></div>`);
    }
    // Llenar selectores al click
    ['schClass'].forEach(id => {
        const s = document.getElementById(id);
        s.addEventListener('click', () => { s.innerHTML=''; app.classes.forEach(c=>s.innerHTML+=`<option value="${c.id}">${c.name}</option>`); });
    });
}

function saveConfig() { 
    app.settings.name = document.getElementById('cfgName').value; 
    app.settings.lang = document.getElementById('cfgLang').value; // Guardar idioma
    saveData(); 
    closeModal('modalConfig'); 
}

async function cloudSync(act) {
    if(!PANTRY_ID.includes("-")) return alert("Configura PANTRY_ID");
    document.getElementById('cloudStatus').innerText = "⏳ Syncing...";
    try {
        if(act==='push') await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(app)});
        else { const r=await fetch(API_URL); app=await r.json(); saveData(); location.reload(); }
        alert("OK"); document.getElementById('cloudStatus').innerText = "☁️ Synced";
    } catch(e) { alert("Error"); document.getElementById('cloudStatus').innerText = "⚠️ Error"; }
}