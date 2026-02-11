let appData = {
    settings: { themeColor: '#3b82f6', teacherName: 'Profesor' },
    classes: [], students: [], tasks: [], anecdotes: [], rewards: [], history: [], schedule: {}
};
let currentClassId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadLocal();
    applyTheme(appData.settings.themeColor);
    updateProfileUI();
    nav('dashboard');
});

// ================= NAVEGACIÓN Y GENERAL =================
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

function saveLocal() { localStorage.setItem('ScienceV12_7', JSON.stringify(appData)); }
function loadLocal() {
    const s = localStorage.getItem('ScienceV12_7');
    if(s) appData = { ...appData, ...JSON.parse(s) };
}

function applyTheme(color) {
    document.documentElement.style.setProperty('--primary', color);
    appData.settings.themeColor = color;
}
function setTheme(c) { applyTheme(c); }

function updateProfileUI() {
    document.getElementById('sidebarName').innerText = appData.settings.teacherName;
    document.getElementById('profName').value = appData.settings.teacherName;
}
function openProfileModal() { document.getElementById('modalProfile').style.display = 'flex'; }
function saveProfileSettings() {
    appData.settings.teacherName = document.getElementById('profName').value;
    updateProfileUI(); saveLocal(); closeModal('modalProfile');
}

// ================= DASHBOARD =================
function updateDashboard() {
    const alerts = appData.anecdotes.filter(a => a.importance === 'high');
    const divA = document.getElementById('dash-alerts');
    divA.innerHTML = alerts.length ? '' : '<small>Sin alertas críticas.</small>';
    alerts.forEach(a => {
        const s = appData.students.find(stu => stu.id == a.studentId);
        divA.innerHTML += `<div class="alert-item"><b>${s?s.name:'?'}</b>: ${a.text}</div>`;
    });

    const divP = document.getElementById('dash-weekly-plan');
    const tasks = appData.tasks.filter(t => isThisWeek(t.date));
    divP.innerHTML = tasks.length ? '' : '<small>Nada esta semana.</small>';
    tasks.forEach(t => {
        const c = appData.classes.find(cl => cl.id == t.classId);
        divP.innerHTML += `<div class="plan-item" style="border-color:${c?c.color:'#ccc'}"><b>${c?c.name:''}</b>: ${t.title}</div>`;
    });
    renderSchedule();
}
function isThisWeek(d) {
    const date = new Date(d); const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const end = new Date(now.setDate(now.getDate() + 6));
    return date >= start && date <= end;
}

// ================= CLASES =================
function renderClasses() {
    const grid = document.getElementById('classesGrid'); grid.innerHTML = '';
    appData.classes.forEach(c => {
        const count = appData.students.filter(s => s.classId == c.id).length;
        const card = document.createElement('div');
        card.className = 'class-card';
        card.style.borderTop = `5px solid ${c.color}`;
        card.innerHTML = `<div style="font-size:2rem;margin-bottom:10px">${c.icon||'⚛️'}</div><h3>${c.name}</h3><small>${count} Alumnos</small>`;
        card.onclick = () => openClassDetail(c.id);
        grid.appendChild(card);
    });
}

function openClassDetail(id) {
    currentClassId = id;
    const c = appData.classes.find(x => x.id == id);
    document.getElementById('detailTitle').innerText = c.name;
    document.getElementById('detailTitle').style.color = c.color;
    nav('class-detail');
    
    // Preparar select de bitácora rápida
    const sel = document.getElementById('classAnecStudent');
    sel.innerHTML = '<option value="">-- Alumno --</option><option value="ALL">📢 TODA LA CLASE</option>';
    appData.students.filter(s => s.classId == id).forEach(s => sel.innerHTML += `<option value="${s.id}">${s.name}</option>`);

    renderStudents(); renderClassPlanning(); renderGradesView(); renderClassHistory(); renderClassLogbook();
}

// PESTAÑAS CLASE
function openClassTab(id) {
    document.querySelectorAll('.class-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
}

// LOGBOOK EN CLASE (LO QUE PEDISTE)
function renderClassLogbook() {
    const list = document.getElementById('classLogbookList'); list.innerHTML = '';
    // Filtrar por esta clase
    const logs = appData.anecdotes.filter(a => a.classId == currentClassId).reverse();
    
    if(!logs.length) { list.innerHTML = '<p style="text-align:center;color:#999">Sin entradas.</p>'; return; }

    logs.forEach(a => {
        const sName = a.studentId === 'ALL' ? 'TODA LA CLASE' : (appData.students.find(s=>s.id==a.studentId)?.name || '?');
        list.innerHTML += `
            <div class="anecdote-item ${a.importance}">
                <div style="flex:1">
                    <strong>${sName}</strong>: ${a.text} <br>
                    <small style="opacity:0.7">${a.date}</small>
                </div>
                <button class="btn-act edit" onclick="fillClassAnecdoteForm(${a.id})">✏️</button>
                <button class="btn-act del" onclick="deleteAnecdote(${a.id}, 'class')">🗑️</button>
            </div>
        `;
    });
}

// Función para rellenar el formulario DE LA CLASE (sin salir)
function fillClassAnecdoteForm(id) {
    const a = appData.anecdotes.find(x => x.id == id);
    if(!a) return;
    
    // Rellenar campos
    document.getElementById('classAnecStudent').value = a.studentId;
    document.getElementById('classAnecImp').value = a.importance;
    document.getElementById('classAnecText').value = a.text;
    document.getElementById('editClassAnecId').value = a.id;
    
    // Cambiar UI de botones
    document.getElementById('btnSaveClassAnec').innerHTML = '🔄 Actualizar';
    document.getElementById('btnCancelClassAnec').style.display = 'inline-block';
    
    // Hacer scroll arriba
    document.getElementById('tab-logbook').scrollIntoView({behavior: 'smooth'});
}

function cancelClassAnecEdit() {
    document.getElementById('classAnecText').value = '';
    document.getElementById('classAnecStudent').value = '';
    document.getElementById('editClassAnecId').value = '';
    document.getElementById('btnSaveClassAnec').innerHTML = '💾 Guardar';
    document.getElementById('btnCancelClassAnec').style.display = 'none';
}

function saveClassAnecdote() {
    const sid = document.getElementById('classAnecStudent').value;
    const txt = document.getElementById('classAnecText').value;
    const imp = document.getElementById('classAnecImp').value;
    const editId = document.getElementById('editClassAnecId').value;

    if(!sid || !txt) return alert("Faltan datos");

    if(editId) {
        // ACTUALIZAR EXISTENTE
        const a = appData.anecdotes.find(x => x.id == editId);
        if(a) {
            a.studentId = sid;
            a.text = txt;
            a.importance = imp;
        }
    } else {
        // CREAR NUEVO
        appData.anecdotes.push({
            id: Date.now(),
            classId: currentClassId,
            studentId: sid,
            text: txt,
            importance: imp,
            date: new Date().toLocaleDateString()
        });
    }

    saveLocal();
    cancelClassAnecEdit(); // Resetear formulario
    renderClassLogbook();  // Refrescar lista
}

// LOGICA GENERAL DE CLASE (Puntos, Notas, Planner)
function renderStudents() {
    const div = document.getElementById('studentsList'); div.innerHTML = '';
    appData.students.filter(s => s.classId == currentClassId).forEach(s => {
        div.innerHTML += `
        <div class="student-card" id="card-${s.id}" onclick="toggleSelect(${s.id})">
            <input type="checkbox" class="stu-check" value="${s.id}">
            <b>${s.name}</b><br><span class="points-badge">${s.points} pts</span>
        </div>`;
    });
}
function toggleSelect(id) {
    const chk = document.querySelector(`#card-${id} .stu-check`);
    chk.checked = !chk.checked;
    document.getElementById(`card-${id}`).classList.toggle('selected', chk.checked);
}
function toggleSelectAll() {
    const all = document.getElementById('selectAll').checked;
    document.querySelectorAll('.stu-check').forEach(c => {
        c.checked = all;
        document.getElementById(`card-${c.value}`).classList.toggle('selected', all);
    });
}
function applyPoints(n) {
    const ids = Array.from(document.querySelectorAll('.stu-check:checked')).map(c => c.value);
    if(!ids.length) return;
    const r = document.getElementById('pointReason').value;
    ids.forEach(id => {
        const s = appData.students.find(x => x.id == id);
        s.points += n;
        appData.history.push({id:Date.now(), studentId:s.id, classId:currentClassId, text:r, pts:n, date:new Date().toLocaleDateString()});
    });
    saveLocal(); renderStudents(); renderClassHistory();
}
function applyCustomPoints() {
    const v = parseInt(document.getElementById('customPointsInput').value);
    if(v) applyPoints(v);
}
function renderClassPlanning() {
    const div = document.getElementById('classWeeklyPlanList'); div.innerHTML = '';
    appData.tasks.filter(t => t.classId == currentClassId && isThisWeek(t.date)).forEach(t => {
        div.innerHTML += `<div class="task-item"><div><b>${t.title}</b><br><small>${t.date}</small></div></div>`;
    });
}
function renderGradesView() {
    const t = document.getElementById('gradesTableView');
    const tasks = appData.tasks.filter(x => x.classId == currentClassId);
    const studs = appData.students.filter(s => s.classId == currentClassId);
    let h = '<thead><tr><th>Alumno</th>';
    tasks.forEach(task => h += `<th>${task.title}</th>`);
    h += '</tr></thead><tbody>';
    studs.forEach(s => {
        h += `<tr><td>${s.name}</td>`;
        tasks.forEach(task => h += `<td>${(s.grades||{})[task.id] || '-'}</td>`);
        h += '</tr>';
    });
    t.innerHTML = h + '</tbody>';
}
function renderClassHistory() {
    const d = document.getElementById('classHistoryList');
    const h = appData.history.filter(x => x.classId == currentClassId).reverse();
    d.innerHTML = h.map(x => {
        const s = appData.students.find(st => st.id == x.studentId);
        return `<div style="display:flex;justify-content:space-between;padding:5px;border-bottom:1px solid #eee">
            <span><b>${s?s.name:'?'}</b>: ${x.text}</span>
            <span style="color:${x.pts>0?'green':'red'}">${x.pts>0?'+':''}${x.pts}</span>
        </div>`;
    }).join('');
}

// ================= NOTEBOOK GLOBAL =================
function initNotebook() {
    // Poblar selects globales
    ['taskClass','anecClass','gradebookClassSelect','adminStudentClass'].forEach(id => {
        const sel = document.getElementById(id); sel.innerHTML = '<option value="">Clase...</option>';
        appData.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    });
    renderTasks(); renderGlobalLog(); renderStudentAdmin(); renderRewards();
}
function openNbTab(id) {
    document.querySelectorAll('.nb-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nb-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
}

// PLANNER GLOBAL (Con Edición)
function addTask() {
    const id = document.getElementById('editTaskId').value;
    const title = document.getElementById('taskTitle').value;
    const cid = document.getElementById('taskClass').value;
    const date = document.getElementById('taskDate').value;
    if(!title || !cid || !date) return;

    if(id) {
        const t = appData.tasks.find(x => x.id == id);
        if(t) { t.title = title; t.classId = cid; t.date = date; t.tag = document.getElementById('taskTag').value; t.description = document.getElementById('taskDesc').value; }
    } else {
        appData.tasks.push({id:Date.now(), title, classId:cid, date, tag:document.getElementById('taskTag').value, description:document.getElementById('taskDesc').value});
    }
    saveLocal(); cancelTaskEdit(); renderTasks();
}
function editTask(id) {
    const t = appData.tasks.find(x => x.id == id);
    if(t) {
        document.getElementById('taskTitle').value = t.title;
        document.getElementById('taskClass').value = t.classId;
        document.getElementById('taskDate').value = t.date;
        document.getElementById('taskTag').value = t.tag;
        document.getElementById('taskDesc').value = t.description;
        document.getElementById('editTaskId').value = t.id;
        document.getElementById('btnSaveTask').innerText = 'Actualizar Plan';
        document.getElementById('btnCancelTask').style.display = 'block';
    }
}
function cancelTaskEdit() {
    document.getElementById('editTaskId').value = '';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('btnSaveTask').innerText = 'Guardar Plan';
    document.getElementById('btnCancelTask').style.display = 'none';
}
function deleteTask(id) {
    if(confirm('¿Borrar?')) { appData.tasks = appData.tasks.filter(x => x.id != id); saveLocal(); renderTasks(); }
}
function renderTasks() {
    const l = document.getElementById('tasksList'); l.innerHTML = '';
    appData.tasks.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(t => {
        const c = appData.classes.find(x => x.id == t.classId);
        l.innerHTML += `
        <div class="task-item">
            <div><b>${t.title}</b> <span class="tag-badge tag-${t.tag}">${t.tag}</span><br><small>${c?c.name:''}</small></div>
            <div><button class="btn-act edit" onclick="editTask(${t.id})">✏️</button><button class="btn-act del" onclick="deleteTask(${t.id})">🗑️</button></div>
        </div>`;
    });
}

// BITÁCORA GLOBAL
function updateAnecStudents() {
    const cid = document.getElementById('anecClass').value;
    const s = document.getElementById('anecStudent'); s.innerHTML = '<option value="ALL">Toda la clase</option>'; s.disabled = !cid;
    if(cid) appData.students.filter(x => x.classId == cid).forEach(x => s.innerHTML += `<option value="${x.id}">${x.name}</option>`);
}
function saveAnecdote() {
    const cid = document.getElementById('anecClass').value;
    const sid = document.getElementById('anecStudent').value;
    const txt = document.getElementById('anecText').value;
    const imp = document.getElementById('anecImportance').value;
    const editId = document.getElementById('editAnecId').value;
    
    if(!cid || !txt) return;

    if(editId) {
        const a = appData.anecdotes.find(x => x.id == editId);
        if(a) { a.classId = cid; a.studentId = sid; a.text = txt; a.importance = imp; }
    } else {
        appData.anecdotes.push({id:Date.now(), classId:cid, studentId:sid, text:txt, importance:imp, date:new Date().toLocaleDateString()});
    }
    saveLocal(); cancelAnecEdit(); renderGlobalLog();
}
function renderGlobalLog() {
    const l = document.getElementById('notebookAnecdotesList'); l.innerHTML = '';
    appData.anecdotes.slice().reverse().forEach(a => {
        const c = appData.classes.find(x => x.id == a.classId);
        const sName = a.studentId === 'ALL' ? 'Todos' : (appData.students.find(s=>s.id==a.studentId)?.name || '?');
        l.innerHTML += `
        <div class="anecdote-item ${a.importance}">
            <div style="flex:1"><small>${c?c.name:''}</small><br><b>${sName}</b>: ${a.text}</div>
            <button class="btn-act edit" onclick="editAnecdoteGlobal(${a.id})">✏️</button>
            <button class="btn-act del" onclick="deleteAnecdote(${a.id}, 'global')">🗑️</button>
        </div>`;
    });
}
function editAnecdoteGlobal(id) {
    const a = appData.anecdotes.find(x => x.id == id);
    if(a) {
        document.getElementById('anecClass').value = a.classId;
        updateAnecStudents();
        document.getElementById('anecStudent').value = a.studentId;
        document.getElementById('anecText').value = a.text;
        document.getElementById('anecImportance').value = a.importance;
        document.getElementById('editAnecId').value = a.id;
        document.getElementById('btnSaveAnec').innerText = 'Actualizar';
        document.getElementById('btnCancelAnec').style.display = 'block';
    }
}
function cancelAnecEdit() {
    document.getElementById('anecText').value = '';
    document.getElementById('editAnecId').value = '';
    document.getElementById('btnSaveAnec').innerText = 'Registrar';
    document.getElementById('btnCancelAnec').style.display = 'none';
}
// Función de borrado unificada para vista local y global
function deleteAnecdote(id, origin) {
    if(confirm('¿Borrar?')) {
        appData.anecdotes = appData.anecdotes.filter(x => x.id != id);
        saveLocal();
        if(origin === 'class') renderClassLogbook();
        else renderGlobalLog();
    }
}

// GRADEBOOK GLOBAL
function renderCentralGradebook() {
    const cid = document.getElementById('gradebookClassSelect').value;
    const div = document.getElementById('centralGradebookContainer');
    if(!cid) return div.innerHTML = '';
    const ts = appData.tasks.filter(t => t.classId == cid);
    const ss = appData.students.filter(s => s.classId == cid);
    let h = '<table class="data-table"><thead><tr><th>Alumno</th>';
    ts.forEach(t => h+=`<th>${t.title}</th>`);
    h += '</tr></thead><tbody>';
    ss.forEach(s => {
        h += `<tr><td><b>${s.name}</b></td>`;
        ts.forEach(t => h += `<td><input type="number" style="width:50px" value="${(s.grades||{})[t.id]||''}" onchange="updateGrade(${s.id},${t.id},this.value)"></td>`);
        h += '</tr>';
    });
    div.innerHTML = h + '</tbody></table>';
}
function updateGrade(sid, tid, val) {
    const s = appData.students.find(x => x.id == sid);
    if(!s.grades) s.grades = {};
    s.grades[tid] = val;
    saveLocal();
}

// ADMIN ALUMNOS
function saveStudentAdmin() {
    const cid = document.getElementById('adminStudentClass').value;
    const nom = document.getElementById('adminStudentName').value;
    if(cid && nom) {
        appData.students.push({id:Date.now(), classId:cid, name:nom, points:0, grades:{}});
        document.getElementById('adminStudentName').value = '';
        saveLocal(); renderStudentAdmin();
    }
}
function renderStudentAdmin() {
    const l = document.getElementById('adminStudentsList'); l.innerHTML = '';
    appData.classes.forEach(c => {
        const ss = appData.students.filter(s => s.classId == c.id);
        if(ss.length) {
            l.innerHTML += `<h4>${c.name}</h4>`;
            ss.forEach(s => l.innerHTML += `<div class="admin-student-item">${s.name} <button class="btn-act del" onclick="delStu(${s.id})">🗑️</button></div>`);
        }
    });
}
function delStu(id) { if(confirm('¿Borrar alumno?')) { appData.students = appData.students.filter(x => x.id != id); saveLocal(); renderStudentAdmin(); } }

// SHOP
function saveReward() {
    const n = document.getElementById('rewardName').value;
    const c = document.getElementById('rewardCost').value;
    if(n&&c) { appData.rewards.push({id:Date.now(), name:n, cost:c}); saveLocal(); renderRewards(); }
}
function renderRewards() {
    const d = document.getElementById('rewardsConfigList'); d.innerHTML = '';
    appData.rewards.forEach(r => d.innerHTML += `<div style="border:1px solid #eee;padding:5px">${r.name} (${r.cost})</div>`);
}

// UTILIDADES MODALES
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function openClassModal() { document.getElementById('modalClass').style.display = 'flex'; loadColorPicker(); }
function loadColorPicker() {
    const d = document.getElementById('classColorPicker'); d.innerHTML = '';
    ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6'].forEach(c => {
        d.innerHTML += `<div class="cp-option" style="background:${c}" onclick="document.getElementById('selectedColor').value='${c}'"></div>`;
    });
}
function saveClass() {
    const n = document.getElementById('modalClassName').value;
    if(n) {
        const id = document.getElementById('editClassId').value;
        if(id) {
            const c = appData.classes.find(x => x.id == id);
            c.name = n; c.icon = document.getElementById('modalClassIcon').value || '⚛️'; c.color = document.getElementById('selectedColor').value;
        } else {
            appData.classes.push({id:Date.now(), name:n, icon:document.getElementById('modalClassIcon').value||'⚛️', color:document.getElementById('selectedColor').value});
        }
        saveLocal(); renderClasses(); closeModal('modalClass');
    }
}
function editCurrentClass() {
    const c = appData.classes.find(x => x.id == currentClassId);
    document.getElementById('modalClassName').value = c.name;
    document.getElementById('editClassId').value = c.id;
    document.getElementById('modalClass').style.display = 'flex';
}
function deleteCurrentClass() {
    if(confirm('¿Borrar clase y alumnos?')) {
        appData.classes = appData.classes.filter(x => x.id != currentClassId);
        appData.students = appData.students.filter(x => x.classId != currentClassId);
        saveLocal(); nav('classes');
    }
}

// HORARIO
function openScheduleModal(d) {
    document.getElementById('modalSchedule').style.display = 'flex';
    document.getElementById('modalSchedule').dataset.day = d;
    const s = document.getElementById('schedClassSelect'); s.innerHTML = '';
    appData.classes.forEach(c => s.innerHTML += `<option value="${c.id}">${c.name}</option>`);
}
function saveScheduleItem() {
    const d = document.getElementById('modalSchedule').dataset.day;
    const cid = document.getElementById('schedClassSelect').value;
    const st = document.getElementById('schedTimeStart').value;
    const en = document.getElementById('schedTimeEnd').value;
    if(cid && st && en) {
        if(!appData.schedule[d]) appData.schedule[d] = [];
        appData.schedule[d].push({classId:cid, start:st, end:en});
        saveLocal(); updateDashboard(); closeModal('modalSchedule');
    }
}
function renderSchedule() {
    ['mon','tue','wed','thu','fri'].forEach(d => {
        const div = document.getElementById(`sch-${d}`); div.innerHTML = '';
        (appData.schedule[d]||[]).sort((a,b)=>a.start.localeCompare(b.start)).forEach((x,i) => {
            const c = appData.classes.find(cl => cl.id == x.classId);
            div.innerHTML += `<div class="sched-item" style="background:${c?c.color:'#ccc'}">
                ${x.start}-${x.end}<br><b>${c?c.name:'?'}</b>
                <span style="float:right;cursor:pointer" onclick="delSched('${d}',${i})">×</span>
            </div>`;
        });
    });
}
function delSched(d, i) { appData.schedule[d].splice(i, 1); saveLocal(); updateDashboard(); }