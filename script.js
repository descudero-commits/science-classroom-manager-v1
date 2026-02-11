// ================= DATA & INIT =================
let appData = {
    settings: { name: 'Docente', theme: '#3b82f6', pantryId: '', lang: 'es' },
    classes: [], 
    students: [], 
    tasks: [], 
    anecdotes: [], 
    rewards: [],
    schedule: { mon:[], tue:[], wed:[], thu:[], fri:[] },
    history: []
};
let currentClassId = null;

// PANTRY CONFIG
const PANTRY_BASE = "https://getpantry.cloud/apiv1/pantry/";
const BASKET_NAME = "teacherAppV12";

// TRANSLATION DICTIONARY
const translations = {
    es: {
        sidebarConfig: "⚙️ Configuración", navDash: "Dashboard", navClasses: "Mis Clases", navNotebook: "Notebook Global",
        dashTitle: "Panel de Control", dashAlerts: "⚠️ Alertas Críticas", dashAgenda: "📅 Agenda Semanal", dashSchedule: "Horario de Clases",
        mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes",
        btnNewClass: "+ Nueva Clase", btnBack: "Volver",
        tabMgmt: "🎮 Gestión", tabPlan: "📅 Planificación", tabHist: "📜 Historial", tabLog: "📖 Bitácora",
        optPart: "Participación", optHw: "Tarea", optBeh: "Conducta", optMat: "Material", btnRedeem: "🎁 Canjear",
        logNew: "📝 Nueva Entrada / Editar", logHist: "Historial de Clase", btnSave: "Guardar", btnCancel: "Cancelar",
        nbPlanner: "📅 Planner", nbLog: "📖 Bitácora Global", nbShop: "🛍️ Tienda",
        taskNew: "Nueva Tarea", btnAdd: "Añadir", logGlobalTitle: "Registro Global", btnCreate: "Crear",
        lblName: "👤 Tu Nombre", lblLang: "🌍 Idioma / Language", lblTheme: "🎨 Color del Tema", btnReset: "Restaurar",
        cloudHelp: "Pega tu ID para sincronizar.", btnLoadCloud: "Descargar Nube", btnSaveCloud: "Subir a Nube",
        lblReport: "📊 Reportes", btnExcel: "Descargar Excel", btnSaveConfig: "Guardar Configuración", btnClose: "Cerrar",
        schedAdd: "Añadir Bloque",
        alertNoId: "Por favor introduce tu Pantry ID primero.",
        syncSuccess: "¡Sincronización Exitosa!", syncError: "Error de conexión.",
        studentsStr: "Alumnos"
    },
    en: {
        sidebarConfig: "⚙️ Settings", navDash: "Dashboard", navClasses: "My Classes", navNotebook: "Global Notebook",
        dashTitle: "Dashboard", dashAlerts: "⚠️ Critical Alerts", dashAgenda: "📅 Weekly Agenda", dashSchedule: "Class Schedule",
        mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday",
        btnNewClass: "+ New Class", btnBack: "Back",
        tabMgmt: "🎮 Management", tabPlan: "📅 Planning", tabHist: "📜 History", tabLog: "📖 Logbook",
        optPart: "Participation", optHw: "Homework", optBeh: "Behavior", optMat: "Material", btnRedeem: "🎁 Redeem",
        logNew: "📝 New Entry / Edit", logHist: "Class History", btnSave: "Save", btnCancel: "Cancel",
        nbPlanner: "📅 Planner", nbLog: "📖 Global Log", nbShop: "🛍️ Shop",
        taskNew: "New Task", btnAdd: "Add", logGlobalTitle: "Global Record", btnCreate: "Create",
        lblName: "👤 Your Name", lblLang: "🌍 Language", lblTheme: "🎨 Theme Color", btnReset: "Reset",
        cloudHelp: "Paste your ID to sync.", btnLoadCloud: "Download from Cloud", btnSaveCloud: "Save to Cloud",
        lblReport: "📊 Reports", btnExcel: "Download Excel", btnSaveConfig: "Save Settings", btnClose: "Close",
        schedAdd: "Add Block",
        alertNoId: "Please enter your Pantry ID first.",
        syncSuccess: "Sync Successful!", syncError: "Connection Error.",
        studentsStr: "Students"
    }
};

// Helper function to get text
function t(key) { return translations[appData.settings.lang][key] || key; }

document.addEventListener('DOMContentLoaded', () => {
    loadLocal();
    applySettings();
    nav('dashboard');
    if(appData.settings.pantryId) cloudSync('pull', true); // Intentar sync silencioso al inicio
});

// ================= NAVIGATION =================
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

function openClassTab(tabId) {
    document.querySelectorAll('.class-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => { if(b.getAttribute('onclick').includes(tabId)) b.classList.add('active'); });
}

function openNbTab(tabId) {
    document.querySelectorAll('.nb-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nb-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    const btns = document.querySelectorAll('.nb-tab');
    btns.forEach(b => { if(b.getAttribute('onclick').includes(tabId)) b.classList.add('active'); });
}

// ================= DASHBOARD & SCHEDULE =================
function updateDashboard() {
    const adiv = document.getElementById('dash-alerts');
    const alerts = appData.anecdotes.filter(a => a.importance === 'high');
    adiv.innerHTML = alerts.length ? '' : `<small>${appData.settings.lang==='es'?'Sin alertas':'No alerts'}</small>`;
    alerts.forEach(a => {
        const s = appData.students.find(x => x.id == a.studentId);
        adiv.innerHTML += `<div style="padding:5px; border-bottom:1px solid #eee; color:red;">⚠️ <b>${s?s.name:'?'}</b>: ${a.text}</div>`;
    });

    const pdiv = document.getElementById('dash-weekly-plan');
    const tasks = appData.tasks.slice(0, 5); 
    pdiv.innerHTML = tasks.length ? '' : `<small>${appData.settings.lang==='es'?'Sin tareas':'No tasks'}</small>`;
    tasks.forEach(t => {
        const c = appData.classes.find(x => x.id == t.classId);
        pdiv.innerHTML += `<div style="padding:5px; border-bottom:1px solid #eee;">📅 <b>${t.title}</b> (${c?c.name:''})</div>`;
    });

    renderScheduleBoard();
}

function renderScheduleBoard() {
    ['mon','tue','wed','thu','fri'].forEach(day => {
        const div = document.getElementById(`sch-${day}`);
        div.innerHTML = '';
        const items = appData.schedule[day] || [];
        items.sort((a,b) => a.start.localeCompare(b.start));
        items.forEach((item, idx) => {
            const c = appData.classes.find(x => x.id == item.classId);
            div.innerHTML += `
            <div class="sched-item" style="border-color:${c?c.color:appData.settings.theme}">
                <b>${item.start}-${item.end}</b><br>${c?c.name:'?'}
                <span style="position:absolute; top:2px; right:2px; cursor:pointer;" onclick="deleteSchedItem('${day}', ${idx})">×</span>
            </div>`;
        });
    });
}

function openScheduleModal(day) {
    document.getElementById('modalSchedule').style.display = 'flex';
    document.getElementById('modalSchedule').dataset.day = day;
    const sel = document.getElementById('schedClassSelect');
    sel.innerHTML = '';
    appData.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
}

function saveSchedule() {
    const day = document.getElementById('modalSchedule').dataset.day;
    const cid = document.getElementById('schedClassSelect').value;
    const start = document.getElementById('schedStart').value;
    const end = document.getElementById('schedEnd').value;
    if(cid && start && end) {
        if(!appData.schedule[day]) appData.schedule[day] = [];
        appData.schedule[day].push({classId:cid, start, end});
        saveLocal(); updateDashboard(); closeModal('modalSchedule');
    }
}
function deleteSchedItem(day, idx) {
    appData.schedule[day].splice(idx, 1);
    saveLocal(); updateDashboard();
}

// ================= CLASSES =================
function renderClasses() {
    const grid = document.getElementById('classesGrid');
    grid.innerHTML = '';
    appData.classes.forEach(c => {
        const cnt = appData.students.filter(s => s.classId == c.id).length;
        grid.innerHTML += `
        <div class="class-card" onclick="openClassDetail(${c.id})" style="border-top-color:${c.color}">
            <h3>${c.name}</h3>
            <small>${cnt} ${t('studentsStr')}</small>
        </div>`;
    });
}

function saveClass() {
    const name = document.getElementById('modalClassName').value;
    const color = document.getElementById('modalClassColor').value;
    const editId = document.getElementById('modalEditClassId').value;
    
    if(name) {
        if(editId) {
            const c = appData.classes.find(x => x.id == editId);
            c.name = name; c.color = color;
        } else {
            const newId = Date.now();
            appData.classes.push({ id: newId, name, color });
            appData.students.push({ id: Date.now()+1, classId: newId, name: 'Student 1', points: 0 });
        }
        saveLocal(); renderClasses();
        if(currentClassId) openClassDetail(currentClassId);
        closeModal('modalClass');
    }
}

function openClassDetail(cid) {
    currentClassId = cid;
    const c = appData.classes.find(x => x.id == cid);
    document.getElementById('detailTitle').innerText = c.name;
    nav('class-detail');
    
    renderStudents();
    renderClassLogbook();
    renderClassPlanning();
    renderClassHistory();
    
    const sel = document.getElementById('localLogStudent');
    sel.innerHTML = '<option value="">-- --</option>';
    appData.students.filter(s => s.classId == cid).forEach(s => {
        sel.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });

    openClassTab('tab-mgmt');
}

// ================= STUDENTS & POINTS =================
function renderStudents() {
    const div = document.getElementById('studentsList');
    div.innerHTML = '';
    appData.students.filter(s => s.classId == currentClassId).forEach(s => {
        div.innerHTML += `
        <div class="student-card" id="card-${s.id}" onclick="toggleStu(${s.id})">
            <input type="checkbox" class="stu-checkbox" value="${s.id}">
            <b>${s.name}</b><br>
            <span style="color:var(--primary); font-weight:bold">${s.points} pts</span>
        </div>`;
    });
}

function toggleStu(id) {
    const chk = document.querySelector(`#card-${id} .stu-checkbox`);
    chk.checked = !chk.checked;
    document.getElementById(`card-${id}`).classList.toggle('selected', chk.checked);
}
function toggleSelectAll() {
    const all = document.getElementById('selectAll').checked;
    document.querySelectorAll('.stu-checkbox').forEach(c => {
        c.checked = all;
        document.getElementById(`card-${c.value}`).classList.toggle('selected', all);
    });
}

function applyPoints(pts) {
    const reason = document.getElementById('pointReason').value;
    const checked = document.querySelectorAll('.stu-checkbox:checked');
    if(!checked.length) return;

    checked.forEach(c => {
        const s = appData.students.find(x => x.id == c.value);
        s.points += pts;
        appData.history.push({ id: Date.now(), classId: currentClassId, text: `${s.name}: ${reason}`, pts: pts, date: new Date().toLocaleDateString() });
    });
    saveLocal(); renderStudents(); renderClassHistory();
}

// ================= LOGBOOK LOCAL =================
function renderClassLogbook() {
    const list = document.getElementById('classLogbookList');
    list.innerHTML = '';
    const logs = appData.anecdotes.filter(a => a.classId == currentClassId).reverse();
    if(!logs.length) { list.innerHTML = '<small style="display:block; text-align:center">-</small>'; return; }

    logs.forEach(a => {
        const s = appData.students.find(x => x.id == a.studentId);
        list.innerHTML += `
        <div class="anecdote-item ${a.importance}">
            <div class="anec-content">
                <strong>${s?s.name:'?'}</strong> <small>${a.date}</small><br>
                <span>${a.text}</span>
            </div>
            <div class="anec-actions">
                <button class="btn-icon-small edit" onclick="editLocalLog(${a.id})"><i class="fas fa-pen"></i></button>
                <button class="btn-icon-small danger" onclick="deleteLog(${a.id}, 'local')"><i class="fas fa-trash"></i></button>
            </div>
        </div>`;
    });
}

function editLocalLog(id) {
    const a = appData.anecdotes.find(x => x.id == id);
    if(!a) return;
    document.getElementById('localLogStudent').value = a.studentId;
    document.getElementById('localLogImp').value = a.importance;
    document.getElementById('localLogText').value = a.text;
    document.getElementById('localLogEditId').value = a.id;
    document.getElementById('btnSaveLocalLog').innerText = t('btnSave');
    document.getElementById('btnCancelLocalLog').style.display = 'inline-block';
    document.querySelector('.logbook-form').scrollIntoView({behavior:'smooth'});
}

function saveLocalLog() {
    const sid = document.getElementById('localLogStudent').value;
    const imp = document.getElementById('localLogImp').value;
    const txt = document.getElementById('localLogText').value;
    const eid = document.getElementById('localLogEditId').value;
    if(!sid || !txt) return;

    if(eid) {
        const idx = appData.anecdotes.findIndex(x => x.id == eid);
        if(idx > -1) { appData.anecdotes[idx] = { ...appData.anecdotes[idx], studentId: sid, importance: imp, text: txt }; }
    } else {
        appData.anecdotes.push({ id: Date.now(), classId: currentClassId, studentId: sid, importance: imp, text: txt, date: new Date().toLocaleDateString() });
    }
    saveLocal(); cancelLocalLog(); renderClassLogbook();
}

function cancelLocalLog() {
    document.getElementById('localLogStudent').value = "";
    document.getElementById('localLogText').value = "";
    document.getElementById('localLogEditId').value = "";
    document.getElementById('btnSaveLocalLog').innerText = t('btnSave');
    document.getElementById('btnCancelLocalLog').style.display = 'none';
}

// ================= NOTEBOOK GLOBAL =================
function initNotebook() {
    const tSel = document.getElementById('taskClass');
    tSel.innerHTML = '';
    appData.classes.forEach(c => tSel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    renderTasks();

    const gSel = document.getElementById('globalLogClass');
    gSel.innerHTML = '<option value="">-- --</option>';
    appData.classes.forEach(c => gSel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    renderGlobalLog();
    renderRewards();
}

function updateGlobalStudents() {
    const cid = document.getElementById('globalLogClass').value;
    const sSel = document.getElementById('globalLogStudent');
    sSel.innerHTML = '';
    sSel.disabled = !cid;
    if(cid) {
        appData.students.filter(s => s.classId == cid).forEach(s => sSel.innerHTML += `<option value="${s.id}">${s.name}</option>`);
    }
}

function renderGlobalLog() {
    const div = document.getElementById('globalLogList');
    div.innerHTML = '';
    appData.anecdotes.slice().reverse().forEach(a => {
        const c = appData.classes.find(x => x.id == a.classId);
        const s = appData.students.find(x => x.id == a.studentId);
        div.innerHTML += `
        <div class="anecdote-item ${a.importance}">
            <div class="anec-content">
                <small>${c?c.name:'?'}</small> <strong>${s?s.name:'?'}</strong><br>${a.text}
            </div>
            <div class="anec-actions">
                <button class="btn-icon-small edit" onclick="editGlobalLog(${a.id})"><i class="fas fa-pen"></i></button>
                <button class="btn-icon-small danger" onclick="deleteLog(${a.id}, 'global')"><i class="fas fa-trash"></i></button>
            </div>
        </div>`;
    });
}

function editGlobalLog(id) {
    const a = appData.anecdotes.find(x => x.id == id);
    if(!a) return;
    document.getElementById('globalLogClass').value = a.classId;
    updateGlobalStudents();
    document.getElementById('globalLogStudent').value = a.studentId;
    document.getElementById('globalLogImp').value = a.importance;
    document.getElementById('globalLogText').value = a.text;
    document.getElementById('globalLogEditId').value = a.id;
    document.getElementById('btnSaveGlobalLog').innerText = t('btnSave');
    document.getElementById('btnCancelGlobalLog').style.display = 'inline-block';
    document.getElementById('nb-anec').scrollIntoView();
}

function saveGlobalLog() {
    const cid = document.getElementById('globalLogClass').value;
    const sid = document.getElementById('globalLogStudent').value;
    const imp = document.getElementById('globalLogImp').value;
    const txt = document.getElementById('globalLogText').value;
    const eid = document.getElementById('globalLogEditId').value;
    if(!cid || !sid || !txt) return;

    if(eid) {
        const idx = appData.anecdotes.findIndex(x => x.id == eid);
        if(idx > -1) { appData.anecdotes[idx] = { ...appData.anecdotes[idx], classId:cid, studentId:sid, importance:imp, text:txt }; }
    } else {
        appData.anecdotes.push({ id: Date.now(), classId:cid, studentId:sid, importance:imp, text:txt, date: new Date().toLocaleDateString() });
    }
    saveLocal(); cancelGlobalLog(); renderGlobalLog();
}

function cancelGlobalLog() {
    document.getElementById('globalLogText').value = "";
    document.getElementById('globalLogEditId').value = "";
    document.getElementById('btnSaveGlobalLog').innerText = t('btnSave');
    document.getElementById('btnCancelGlobalLog').style.display = 'none';
}

function deleteLog(id, origin) {
    if(confirm('Delete?')) {
        appData.anecdotes = appData.anecdotes.filter(a => a.id != id);
        saveLocal();
        if(origin === 'local') renderClassLogbook(); else renderGlobalLog();
        updateDashboard();
    }
}

// ================= PLANNER & REWARDS =================
function addTask() {
    const title = document.getElementById('taskTitle').value;
    const cid = document.getElementById('taskClass').value;
    const date = document.getElementById('taskDate').value;
    if(title && cid && date) {
        appData.tasks.push({id:Date.now(), title, classId:cid, date, tag:document.getElementById('taskTag').value});
        saveLocal(); renderTasks();
    }
}
function renderTasks() {
    const l = document.getElementById('tasksList'); l.innerHTML = '';
    appData.tasks.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(t => {
        const c = appData.classes.find(x => x.id == t.classId);
        l.innerHTML += `<div class="anecdote-item"><div><b>${t.title}</b> (${c?c.name:''})<br><small>${t.date}</small></div></div>`;
    });
}
function addReward() {
    const name = document.getElementById('rewardName').value;
    const cost = document.getElementById('rewardCost').value;
    if(name && cost) {
        appData.rewards.push({id:Date.now(), name, cost});
        saveLocal(); renderRewards();
    }
}
function renderRewards() {
    const d = document.getElementById('rewardsList'); d.innerHTML = '';
    appData.rewards.forEach(r => d.innerHTML += `<div style="border:1px solid #ddd; padding:5px; text-align:center">${r.name}<br><b>${r.cost} pts</b></div>`);
}

// ================= CONFIG & CLOUD (PANTRY) =================
function openProfileModal() {
    document.getElementById('profName').value = appData.settings.name;
    document.getElementById('profTheme').value = appData.settings.theme;
    document.getElementById('pantryId').value = appData.settings.pantryId || '';
    document.getElementById('modalProfile').style.display = 'flex';
}

function saveProfile() {
    appData.settings.name = document.getElementById('profName').value;
    appData.settings.theme = document.getElementById('profTheme').value;
    appData.settings.pantryId = document.getElementById('pantryId').value;
    
    applySettings();
    saveLocal();
    closeModal('modalProfile');
}

function changeLang(l) {
    appData.settings.lang = l;
    updateLanguageUI();
    renderClasses(); // Refresh dynamic text
    updateDashboard();
}

function updateLanguageUI() {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.dataset.translate;
        if(translations[appData.settings.lang][key]) {
            el.innerText = translations[appData.settings.lang][key];
        }
    });
}

function applySettings() {
    document.getElementById('sidebarName').innerText = appData.settings.name;
    document.documentElement.style.setProperty('--primary', appData.settings.theme);
    updateLanguageUI();
    const status = document.getElementById('syncStatus');
    if(appData.settings.pantryId) status.innerText = "☁️ " + (appData.settings.lang==='es' ? "Nube OK" : "Cloud OK");
    else status.innerText = "☁️ Offline";
}

function resetTheme() {
    document.getElementById('profTheme').value = '#3b82f6';
}

// --- CLOUD SYNC LOGIC ---
async function cloudSync(action, silent = false) {
    const pid = appData.settings.pantryId;
    const btnId = action === 'push' ? 'btnSaveCloud' : 'btnLoadCloud';
    if(!pid) return !silent && alert(t('alertNoId'));
    
    const url = `${PANTRY_BASE}${pid}/basket/${BASKET_NAME}`;
    const status = document.getElementById('syncStatus');
    status.innerText = "☁️ ...";

    try {
        if(action === 'push') {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appData)
            });
            if(!silent) alert(t('syncSuccess'));
        } else {
            const res = await fetch(url);
            if(!res.ok) throw new Error("No data");
            const data = await res.json();
            appData = { ...appData, ...data };
            saveLocal();
            applySettings();
            nav('dashboard');
            if(!silent) alert(t('syncSuccess'));
        }
        status.innerText = "☁️ OK";
    } catch(e) {
        console.error(e);
        status.innerText = "☁️ Err";
        if(!silent) alert(t('syncError'));
    }
}

// --- EXCEL EXPORT LOGIC ---
function exportExcel() {
    let table = `
    <html><head><meta charset="UTF-8"></head><body>
    <h2>Report - ${appData.settings.name}</h2>
    <table border="1"><thead><tr style="background:#ddd;"><th>ID</th><th>Name</th><th>Class</th><th>Points</th></tr></thead><tbody>`;
    appData.students.forEach(s => {
        const c = appData.classes.find(x => x.id == s.classId);
        table += `<tr><td>${s.id}</td><td>${s.name}</td><td>${c ? c.name : '-'}</td><td>${s.points}</td></tr>`;
    });
    table += `</tbody></table></body></html>`;

    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${new Date().toLocaleDateString()}.xls`;
    a.click();
}

// ================= UTILS & OTHERS =================
function saveLocal() { localStorage.setItem('TeacherAppV12_8', JSON.stringify(appData)); }
function loadLocal() {
    const d = localStorage.getItem('TeacherAppV12_8');
    if(d) appData = { ...appData, ...JSON.parse(d) };
}

function openClassModal() {
    document.getElementById('modalClass').style.display = 'flex';
    document.getElementById('modalClassName').value = '';
    document.getElementById('modalEditClassId').value = '';
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function editCurrentClass() {
    const c = appData.classes.find(x => x.id == currentClassId);
    document.getElementById('modalClassName').value = c.name;
    document.getElementById('modalClassColor').value = c.color;
    document.getElementById('modalEditClassId').value = c.id;
    document.getElementById('modalClass').style.display = 'flex';
}
function deleteCurrentClass() {
    if(confirm('Delete?')) {
        appData.classes = appData.classes.filter(x => x.id != currentClassId);
        appData.students = appData.students.filter(x => x.classId != currentClassId);
        appData.anecdotes = appData.anecdotes.filter(x => x.classId != currentClassId);
        appData.tasks = appData.tasks.filter(x => x.classId != currentClassId);
        saveLocal(); nav('classes');
    }
}
function renderClassPlanning() {
    const div = document.getElementById('classWeeklyPlanList'); div.innerHTML = '';
    appData.tasks.filter(t => t.classId == currentClassId).forEach(t => {
        div.innerHTML += `<div class="anecdote-item"><b>${t.title}</b> (${t.date})</div>`;
    });
}
function renderClassHistory() {
    const div = document.getElementById('classHistoryList'); div.innerHTML = '';
    appData.history.filter(h => h.classId == currentClassId).reverse().forEach(h => {
        div.innerHTML += `<div style="padding:5px; border-bottom:1px solid #eee"><small>${h.date}</small> ${h.text} <b style="color:${h.pts>0?'green':'red'}">${h.pts}</b></div>`;
    });
}
function openRedeemModal() {
    document.getElementById('modalRedeem').style.display = 'flex';
    const grid = document.getElementById('redeemGrid');
    grid.innerHTML = '';
    appData.rewards.forEach(r => {
        grid.innerHTML += `<div class="student-card" onclick="redeemPrize('${r.name}', ${r.cost})"><b>${r.name}</b><br>${r.cost} pts</div>`;
    });
}
function redeemPrize(name, cost) {
    const checked = document.querySelectorAll('.stu-checkbox:checked');
    if(!checked.length) return;
    if(confirm(`Canjear ${name} (${cost} pts)?`)) {
        checked.forEach(chk => {
            const s = appData.students.find(x => x.id == chk.value);
            if(s.points >= cost) {
                s.points -= cost;
                appData.history.push({id:Date.now(), classId:currentClassId, text:`Canje: ${name}`, pts:-cost, date:new Date().toLocaleDateString()});
            }
        });
        saveLocal(); renderStudents(); renderClassHistory(); closeModal('modalRedeem');
    }
}