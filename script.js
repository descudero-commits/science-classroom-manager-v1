// ==========================================
// 1. CONFIGURACIÓN
// ==========================================
const PANTRY_ID = "9df76c09-c878-45e6-9df9-7b02d9cd00ef"; // <--- CAMBIAR ID
const BUCKET_NAME = "ScienceTeacherV11";
const CLOUD_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BUCKET_NAME}`;

// ==========================================
// 2. ESTADO GLOBAL
// ==========================================
let appData = {
    settings: { 
        themeColor: '#3b82f6',
        teacherName: 'Profesor',
        teacherAvatar: '👨‍🔬'
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

document.addEventListener('DOMContentLoaded', () => {
    loadLocal();
    applyTheme(appData.settings.themeColor);
    updateProfileUI();
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', day: 'numeric', month: 'long' 
    });
    nav('dashboard');
});

// Tema
function applyTheme(color) {
    document.documentElement.style.setProperty('--primary', color);
    appData.settings.themeColor = color;
}
function setTheme(color) { applyTheme(color); }

// Persistencia
function saveLocal() { localStorage.setItem('ScienceV11', JSON.stringify(appData)); }
function loadLocal() {
    const s = localStorage.getItem('ScienceV11');
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
    const top = [...appData.students].sort((a,b) => b.points - a.points).slice(0,5);
    const topContainer = document.getElementById('dash-top');
    topContainer.innerHTML = top.length ? '' : '<small>Sin datos.</small>';
    top.forEach((s, index) => {
        const c = appData.classes.find(cl => cl.id == s.classId);
        topContainer.innerHTML += `<div style="padding:5px; border-bottom:1px solid #eee;">${index+1}. <b>${s.name}</b> <small>(${c?c.name:''})</small> <span style="float:right;">${s.points} pts</span></div>`;
    });

    const alerts = appData.anecdotes.filter(a => a.importance === 'high');
    const alertContainer = document.getElementById('dash-alerts');
    alertContainer.innerHTML = alerts.length ? '' : '<small style="color:#aaa">Todo en orden.</small>';
    alerts.forEach(a => {
        const s = appData.students.find(stu => stu.id == a.studentId);
        alertContainer.innerHTML += `<div class="alert-item"><b>${s ? s.name : 'General'}</b>: ${a.text}</div>`;
    });

    const planContainer = document.getElementById('dash-weekly-plan');
    const weeklyTasks = appData.tasks.filter(t => isDateInCurrentWeek(t.date)).sort((a,b) => new Date(a.date) - new Date(b.date));
    planContainer.innerHTML = weeklyTasks.length ? '' : '<small style="color:#aaa">Nada esta semana.</small>';
    weeklyTasks.forEach(t => {
        const c = appData.classes.find(cl => cl.id == t.classId);
        planContainer.innerHTML += `<div class="plan-item" style="border-left-color:${c ? c.color : '#ccc'}"><div><b>${c ? c.name : '?'}</b>: ${t.title}</div><small>${t.description || ''}</small></div>`;
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
    sel.innerHTML = '<option value="">-- Materia --</option>';
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
    if(confirm("¿Quitar?")) { appData.schedule[day].splice(idx, 1); saveLocal(); renderScheduleView(); }
}

// ==========================================
// 3. CLASES & DRAG AND DROP
// ==========================================
function renderClasses() {
    const grid = document.getElementById('classesGrid'); 
    grid.innerHTML = '';
    
    appData.classes.forEach((c, index) => {
        const count = appData.students.filter(s => s.classId == c.id).length;
        const icon = c.icon || '⚛️'; // Icono por defecto
        
        // Creamos elemento con Drag attributes
        const card = document.createElement('div');
        card.className = 'class-card';
        card.style.borderTop = `5px solid ${c.color}`;
        card.draggable = true;
        card.dataset.index = index; // Guardamos índice
        card.innerHTML = `
            <div style="font-size:2.5rem; margin-bottom:10px;">${icon}</div>
            <h3>${c.name}</h3>
            <small>${count} Alumnos</small>
        `;
        
        card.onclick = (e) => { if(!card.classList.contains('dragging')) openClassDetail(c.id); };
        
        // Eventos Drag
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
        // Intercambiar en el array de datos
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
    if(classStudents.length === 0) { list.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No hay alumnos.</p>'; return; }
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
    if(!checks.length) return alert("Selecciona alumnos.");
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
    let html = `<div class="hist-row header"><div>Estudiante</div><div>Fecha</div><div>Razón</div><div>Pts</div></div>`;
    logs.forEach(log => {
        const s = appData.students.find(stu => stu.id == log.studentId);
        if(s) html += `<div class="hist-row"><strong>${s.name}</strong><span style="font-size:0.8rem;color:#666">${log.date}</span><span>${log.reason}</span><span class="hist-badge ${log.amount > 0 ? 'h-earn' : 'h-spend'}">${log.amount>0?'+':''}${log.amount}</span></div>`;
    });
    container.innerHTML = html;
}
function renderClassPlanning() {
    const list = document.getElementById('classWeeklyPlanList');
    const tasks = appData.tasks.filter(t => t.classId == currentClassId && isDateInCurrentWeek(t.date)).sort((a,b) => new Date(a.date) - new Date(b.date));
    list.innerHTML = tasks.length ? '' : '<p style="text-align:center;">Nada esta semana.</p>';
    tasks.forEach(t => {
        list.innerHTML += `<div class="task-item"><div><b>${t.title}</b> <span class="tag-badge tag-${t.tag}">${t.tag}</span><br><small>${t.description || ''}</small></div><div>${new Date(t.date).toLocaleDateString()}</div></div>`;
    });
}
function renderGradesViewOnly() {
    const table = document.getElementById('gradesTableView');
    const tasks = appData.tasks.filter(t => t.classId == currentClassId).sort((a,b)=>new Date(a.date)-new Date(b.date));
    const studs = appData.students.filter(s => s.classId == currentClassId);
    let html = `<thead><tr><th>Alumno</th>${tasks.map(t=>`<th>${t.title}</th>`).join('')}</tr></thead><tbody>`;
    studs.forEach(s => {
        html += `<tr><td>${s.name}</td>${tasks.map(t => `<td>${(s.grades && s.grades[t.id]) ? s.grades[t.id] : '-'}</td>`).join('')}</tr>`;
    });
    table.innerHTML = html + '</tbody>';
}
function openRedeemModal() {
    if(!document.querySelectorAll('.stu-check:checked').length) return alert("Selecciona alumnos.");
    const grid = document.getElementById('redeemGrid'); 
    grid.innerHTML = appData.rewards.length ? '' : '<p>No hay premios.</p>';
    appData.rewards.forEach(r => {
        grid.innerHTML += `<div class="redeem-item" onclick="processRedeem(${r.cost}, '${r.name}')"><b>${r.name}</b><br>${r.cost} pts</div>`;
    });
    document.getElementById('modalRedeem').style.display = 'flex';
}
function processRedeem(cost, name) {
    if(confirm(`¿Canjear "${name}"?`)) {
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
        if(el) { el.innerHTML = '<option value="">Clase...</option>'; appData.classes.forEach(c => el.innerHTML += `<option value="${c.id}">${c.name}</option>`); }
    });
    renderTasks(); renderStudentAdminList(); renderRewards(); renderAnecdotesNotebook(); renderGlobalHistory();
}
function openNbTab(id) {
    document.querySelectorAll('.nb-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nb-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
}

// Historial Global (NUEVO V11)
function renderGlobalHistory() {
    const container = document.getElementById('globalHistoryContainer');
    const search = document.getElementById('globalHistSearch').value.toLowerCase();
    
    // Filtrar y ordenar
    const logs = appData.history.sort((a,b) => b.id - a.id).filter(log => {
        const s = appData.students.find(stu => stu.id == log.studentId);
        return !search || (s && s.name.toLowerCase().includes(search));
    }).slice(0, 100); // Límite de 100 para no saturar

    let html = `<table class="data-table"><thead><tr><th>Fecha</th><th>Clase</th><th>Alumno</th><th>Razón</th><th>Pts</th></tr></thead><tbody>`;
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

// Planner + Descripción
function addTask() {
    const id = document.getElementById('editTaskId').value; 
    const title = document.getElementById('taskTitle').value;
    const cid = document.getElementById('taskClass').value; 
    const date = document.getElementById('taskDate').value;
    const tag = document.getElementById('taskTag').value; 
    const period = document.getElementById('taskPeriod').value;
    const desc = document.getElementById('taskDesc').value; // Nueva descripción

    if(title && cid && date) {
        if(id) { 
            const t = appData.tasks.find(x => x.id == id); 
            if(t) { t.title = title; t.classId = cid; t.date = date; t.tag = tag; t.period = period; t.description = desc; } 
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
    appData.tasks.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(t => {
        list.innerHTML += `
        <div class="task-item">
            <div>
                <b>${t.title}</b> <span class="tag-badge tag-${t.tag}">${t.tag}</span>
                <br><small style="color:#666">${t.description || ''}</small>
                <br><small>${t.date}</small>
            </div>
            <button class="btn-act del" onclick="delTask(${t.id})">🗑️</button>
        </div>`;
    });
}
function cancelTaskEdit() { 
    document.getElementById('taskTitle').value = ''; 
    document.getElementById('taskDesc').value = '';
    document.getElementById('editTaskId').value = ''; 
    document.getElementById('btnCancelTask').style.display = 'none'; 
}
function delTask(id) { if(confirm("¿Borrar?")) { appData.tasks = appData.tasks.filter(t => t.id !== id); saveLocal(); renderTasks(); } }

// Admin Alumnos & Notas
function renderCentralGradebook() {
    const cid = document.getElementById('gradebookClassSelect').value;
    const container = document.getElementById('centralGradebookContainer');
    if(!cid) return container.innerHTML = '';
    const tasks = appData.tasks.filter(t => t.classId == cid).sort((a,b)=>new Date(a.date)-new Date(b.date));
    const studs = appData.students.filter(s => s.classId == cid);
    let html = `<table class="data-table"><thead><tr><th>Alumno</th>${tasks.map(t=>`<th>${t.title}</th>`).join('')}</tr></thead><tbody>`;
    studs.forEach(s => {
        html += `<tr><td><b>${s.name}</b></td>${tasks.map(t => `<td><input type="number" value="${(s.grades && s.grades[t.id]) ? s.grades[t.id] : ''}" onchange="saveGrade(${s.id}, ${t.id}, this.value)"></td>`).join('')}</tr>`;
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
function delStudent(id) { if(confirm("¿Borrar alumno?")) { appData.students = appData.students.filter(s => s.id !== id); saveLocal(); renderStudentAdminList(); } }

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
        const sName = a.studentId === 'ALL' ? '📢 TODA LA CLASE' : (appData.students.find(s=>s.id==a.studentId)?.name || '?');
        list.innerHTML += `<div class="anecdote-item ${a.importance}"><div style="flex:1;"><strong>${sName}</strong>: ${a.text}</div><button class="btn-act del" onclick="delAnec(${a.id})">🗑️</button></div>`;
    });
}
function delAnec(id) { if(confirm("¿Borrar?")) { appData.anecdotes = appData.anecdotes.filter(a => a.id !== id); saveLocal(); renderAnecdotesNotebook(); } }
function updateAnecStudents() {
    const cid = document.getElementById('anecClass').value;
    const sel = document.getElementById('anecStudent'); 
    sel.innerHTML = '<option value="">Alumno...</option>'; sel.disabled = !cid;
    if(cid) { sel.innerHTML += `<option value="ALL">📢 TODA LA CLASE</option>`; appData.students.filter(s => s.classId == cid).forEach(s => sel.innerHTML += `<option value="${s.id}">${s.name}</option>`); }
}
function saveReward() {
    const name = document.getElementById('rewardName').value; const cost = document.getElementById('rewardCost').value;
    if(name && cost) { appData.rewards.push({ id: Date.now(), name, cost }); document.getElementById('rewardName').value = ''; saveLocal(); renderRewards(); }
}
function renderRewards() {
    const list = document.getElementById('rewardsConfigList'); list.innerHTML = '';
    appData.rewards.forEach(r => { list.innerHTML += `<div style="border:1px solid #ddd; padding:5px;">${r.name} (${r.cost})</div>`; });
}

// Gestión Clases (Icono + Color)
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
function deleteCurrentClass() { if(confirm("¿Borrar clase?")) { appData.classes = appData.classes.filter(c => c.id != currentClassId); saveLocal(); nav('classes'); } }
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
    try { await fetch(CLOUD_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appData) }); alert('✅ Guardado.'); } 
    catch(e) { alert('❌ Error.'); } btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Subir a Nube';
}
async function loadFromCloud() {
    if(!confirm("Sobrescribir datos?")) return;
    const btn = document.querySelector('.btn-cloud-load'); btn.innerText = '⏳';
    try { const res = await fetch(CLOUD_URL + '?t=' + Date.now()); const json = await res.json(); appData = json[BUCKET_NAME] || json; saveLocal(); location.reload(); } 
    catch(e) { alert('❌ Error.'); } btn.innerHTML = '<i class="fas fa-cloud-download-alt"></i> Bajar de Nube';
}