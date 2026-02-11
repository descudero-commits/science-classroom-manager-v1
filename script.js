// ================= CONFIGURACIÓN =================
const PANTRY_ID = "TU_ID_DE_PANTRY_AQUI"; // <--- PEGA TU ID
const BASKET_NAME = "teacherV13Pro";
const PANTRY_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BASKET_NAME}`;

// ================= ESTADO INICIAL =================
let app = {
    config: { name: "Profesor", lastSync: null },
    classes: [],     // { id, name }
    students: [],    // { id, classId, name }
    assignments: [], // { id, classId, title, tag, maxScore }
    grades: [],      // { studentId, assignmentId, score }
    logbook: [],     // { id, studentId, classId, date, text, importance }
    planning: [],    // { id, title, date, tag, notes }
    schedule: []     // { day, start, end, classId }
};

let currentClassId = null; // Para la vista de clase

// ================= INICIO =================
document.addEventListener('DOMContentLoaded', () => {
    loadLocal();
    initUI();
    updateSidebar();
    renderDashboard();
    checkCloudStatus();
});

// ================= UI & NAVEGACIÓN =================
function nav(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-menu button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`view-${view}`).classList.add('active');
    
    // Highlight sidebar
    if(view === 'dashboard' || view === 'notebook') {
        document.getElementById(`nav-${view}`).classList.add('active');
        currentClassId = null;
    }

    if(view === 'notebook') renderNotebook();
    if(view === 'dashboard') renderDashboard();
}

function setNbTab(tabId) {
    document.querySelectorAll('.nb-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
    
    // Refresh specific tab data
    if(tabId === 'nb-students') renderNbStudents();
    if(tabId === 'nb-gradebook') renderNbGradebook();
    if(tabId === 'nb-planning') renderNbPlanning();
    if(tabId === 'nb-logbook') renderNbLogbook();
}

// ================= LOGICA DE DATOS (CRUD) =================

// --- CLASES ---
function createClass(name) {
    const id = Date.now().toString();
    app.classes.push({ id, name });
    save(); updateSidebar();
}

function openClassView(id) {
    currentClassId = id;
    const cls = app.classes.find(c => c.id == id);
    document.getElementById('clsTitle').innerText = cls.name;
    
    // Render Read-Only Views
    renderClassLogbookView();
    renderClassGradebookView();
    document.getElementById('attendanceWidget').style.display = 'none'; // Reset
    
    nav('class');
    // Highlight in sidebar manually
    document.querySelectorAll('.nav-menu button').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-cls-${id}`).classList.add('active');
}

// --- ESTUDIANTES (NOTEBOOK) ---
function renderNbStudents() {
    const filterCls = document.getElementById('nbStudentClassSelect').value;
    const list = document.getElementById('nbStudentList');
    
    // Populate Select if empty
    const sel = document.getElementById('nbStudentClassSelect');
    if(sel.options.length === 1) {
        app.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    }

    let studs = app.students;
    if(filterCls) studs = studs.filter(s => s.classId == filterCls);

    let html = `<table><thead><tr><th>Nombre</th><th>Clase</th><th>Acciones</th></tr></thead><tbody>`;
    studs.forEach(s => {
        const clsName = app.classes.find(c => c.id == s.classId)?.name || 'Unknown';
        html += `<tr>
            <td>${s.name}</td>
            <td>${clsName}</td>
            <td><button onclick="deleteStudent('${s.id}')" class="btn-text" style="color:var(--danger)">Eliminar</button></td>
        </tr>`;
    });
    html += `</tbody></table>`;
    list.innerHTML = html;
}

// --- GRADEBOOK (MATRIX) ---
function renderNbGradebook() {
    const sel = document.getElementById('nbGradebookClassSelect');
    sel.innerHTML = '<option value="">Selecciona una clase...</option>';
    app.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    
    sel.onchange = () => {
        const cid = sel.value;
        const container = document.getElementById('nbGradebookTable');
        if(!cid) { container.innerHTML = ''; return; }
        
        const students = app.students.filter(s => s.classId == cid);
        const assignments = app.assignments.filter(a => a.classId == cid);
        
        let html = `<table><thead><tr><th>Alumno</th>`;
        assignments.forEach(a => html += `<th>${a.title} <br><small>${a.tag}</small></th>`);
        html += `</tr></thead><tbody>`;
        
        students.forEach(s => {
            html += `<tr><td><b>${s.name}</b></td>`;
            assignments.forEach(a => {
                const grade = app.grades.find(g => g.studentId == s.id && g.assignmentId == a.id);
                const val = grade ? grade.score : '';
                html += `<td><input type="number" class="gb-input" value="${val}" 
                         onchange="updateGrade('${s.id}', '${a.id}', this.value)"></td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;
    };
}

function updateGrade(sid, aid, val) {
    const idx = app.grades.findIndex(g => g.studentId == sid && g.assignmentId == aid);
    if(idx > -1) app.grades[idx].score = val;
    else app.grades.push({ studentId: sid, assignmentId: aid, score: val });
    save();
}

// --- LOGBOOK (EDITABLE) ---
function renderNbLogbook() {
    const container = document.getElementById('nbLogbookList');
    container.innerHTML = '';
    
    // Sort by date desc
    const logs = [...app.logbook].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    logs.forEach(l => {
        const s = app.students.find(x => x.id == l.studentId);
        const c = app.classes.find(x => x.id == l.classId);
        container.innerHTML += `
        <div class="log-entry ${l.importance}">
            <div class="log-entry-header">
                <span>${l.date} - <b>${s?s.name:'?'}</b> (${c?c.name:'?'})</span>
                <div class="log-actions">
                    <button onclick="editLog('${l.id}')" class="btn-text"><i class="fas fa-pen"></i></button>
                    <button onclick="deleteLog('${l.id}')" class="btn-text" style="color:red"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div>${l.text}</div>
        </div>`;
    });
}

// --- PLANNING & TAGS ---
function renderNbPlanning() {
    const container = document.getElementById('nbPlanningList');
    container.innerHTML = '';
    app.planning.forEach(p => {
        container.innerHTML += `
        <div class="card" style="padding:15px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between">
                <b>${p.title}</b> <span style="background:#eef2ff; padding:2px 6px; border-radius:4px; font-size:0.8rem; color:var(--primary)">${p.tag}</span>
            </div>
            <small>${p.date}</small>
            <p style="margin-top:5px; font-size:0.9rem">${p.notes}</p>
            <button onclick="deletePlan('${p.id}')" class="btn-text" style="color:red; float:right">Borrar</button>
        </div>`;
    });
}

// --- DASHBOARD ---
function renderDashboard() {
    // Schedule
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const grid = document.getElementById('dashboardSchedule');
    grid.innerHTML = '';
    days.forEach((d, i) => {
        let items = app.schedule.filter(s => s.day === i).sort((a,b) => a.start.localeCompare(b.start));
        let html = `<div class="day-col"><h4>${d}</h4>`;
        items.forEach(item => {
            const c = app.classes.find(x => x.id == item.classId);
            html += `<div class="sched-block"><b>${item.start}</b><br>${c?c.name:'?'}</div>`;
        });
        html += `</div>`;
        grid.innerHTML += html;
    });

    // Recent Logs
    const logList = document.getElementById('dash-logs');
    logList.innerHTML = '';
    app.logbook.slice(-5).reverse().forEach(l => {
        const s = app.students.find(x => x.id == l.studentId);
        logList.innerHTML += `<div style="padding:8px; border-bottom:1px solid #eee; font-size:0.85rem">
           ⚠️ <b>${s?s.name:'?'}</b>: ${l.text}
        </div>`;
    });

    // Planner
    const planList = document.getElementById('dash-planner');
    planList.innerHTML = '';
    app.planning.slice(0, 5).forEach(p => {
        planList.innerHTML += `<div style="padding:8px; border-bottom:1px solid #eee; font-size:0.85rem">
            📌 <b>${p.title}</b> (${p.tag}) <br><small>${p.date}</small>
        </div>`;
    });
}

// --- CLASS DETAIL VIEWS (READ ONLY) ---
function renderClassLogbookView() {
    const div = document.getElementById('clsLogbookView');
    div.innerHTML = '';
    const logs = app.logbook.filter(l => l.classId == currentClassId).reverse();
    logs.forEach(l => {
        const s = app.students.find(x => x.id == l.studentId);
        div.innerHTML += `<div class="log-entry ${l.importance}">
            <small>${l.date} - <b>${s?s.name:'?'}</b></small>
            <p>${l.text}</p>
        </div>`;
    });
}

function renderClassGradebookView() {
    const div = document.getElementById('clsGradebookView');
    const students = app.students.filter(s => s.classId == currentClassId);
    const assigns = app.assignments.filter(a => a.classId == currentClassId);
    
    if(assigns.length === 0) { div.innerHTML = "<small>No hay actividades.</small>"; return; }

    let html = `<table><thead><tr><th>Alumno</th>`;
    assigns.forEach(a => html += `<th>${a.tag}</th>`); // Short header
    html += `<th>Prom</th></tr></thead><tbody>`;
    
    students.forEach(s => {
        let total = 0, count = 0;
        html += `<tr><td>${s.name}</td>`;
        assigns.forEach(a => {
            const g = app.grades.find(x => x.studentId == s.id && x.assignmentId == a.id);
            const score = g ? parseFloat(g.score) : 0;
            if(g) { total += score; count++; }
            html += `<td>${g ? score : '-'}</td>`;
        });
        const avg = count ? (total/count).toFixed(1) : '-';
        html += `<td><b>${avg}</b></td></tr>`;
    });
    html += `</tbody></table>`;
    div.innerHTML = html;
}

// --- ATTENDANCE EXTRA ---
function toggleAttendance() {
    const widget = document.getElementById('attendanceWidget');
    if(widget.style.display === 'none') {
        widget.style.display = 'block';
        const list = document.getElementById('attendanceList');
        list.innerHTML = '';
        app.students.filter(s => s.classId == currentClassId).forEach(s => {
            list.innerHTML += `<label style="display:inline-block; margin-right:10px; background:white; padding:5px; border:1px solid #ddd; border-radius:4px;">
                <input type="checkbox" checked id="att-${s.id}"> ${s.name}
            </label>`;
        });
    } else {
        widget.style.display = 'none';
    }
}
function saveAttendance() {
    // Just a placeholder for "Saving" - in real app would save to history
    alert("Asistencia guardada (Simulado)");
    toggleAttendance();
}

// ================= MODALS & FORMS =================
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function openCreateClassModal() {
    const name = prompt("Nombre de la clase:");
    if(name) createClass(name);
}
function openConfigModal() {
    document.getElementById('modalConfig').style.display = 'flex';
    document.getElementById('cfgName').value = app.config.name;
}
function saveConfig() {
    app.config.name = document.getElementById('cfgName').value;
    document.getElementById('sidebarName').innerText = app.config.name;
    save(); closeModal('modalConfig');
}

// Generic Modal Builders
function openAddStudentModal() {
    showModal("Agregar Alumno", `
        <input type="text" id="newStudName" placeholder="Nombre completo">
        <select id="newStudClass">${app.classes.map(c=>`<option value='${c.id}'>${c.name}</option>`)}</select>
    `, () => {
        const name = document.getElementById('newStudName').value;
        const cid = document.getElementById('newStudClass').value;
        if(name && cid) {
            app.students.push({ id: Date.now().toString(), name, classId: cid });
            save(); renderNbStudents(); closeModal('modalGeneric');
        }
    });
}

function openAddAssignmentModal() {
    showModal("Nueva Columna (Actividad)", `
        <input type="text" id="newAssTitle" placeholder="Título (ej: Parcial 1)">
        <input type="text" id="newAssTag" placeholder="Tag corto (ej: P1, Tarea)" list="tagsList">
        <datalist id="tagsList"><option value="Examen"><option value="Tarea"><option value="Proyecto"></datalist>
        <select id="newAssClass">${app.classes.map(c=>`<option value='${c.id}'>${c.name}</option>`)}</select>
    `, () => {
        const title = document.getElementById('newAssTitle').value;
        const tag = document.getElementById('newAssTag').value;
        const cid = document.getElementById('newAssClass').value;
        if(title && cid) {
            app.assignments.push({ id: Date.now().toString(), classId: cid, title, tag, maxScore: 100 });
            save(); renderNbGradebook(); closeModal('modalGeneric');
        }
    });
}

function openLogbookModal() {
    // Build options dynamically
    const allStuds = app.students.map(s => `<option value="${s.id}">${s.name} (${app.classes.find(c=>c.id==s.classId)?.name})</option>`).join('');
    
    showModal("Nueva Bitácora", `
        <select id="logStud">${allStuds}</select>
        <select id="logImp">
            <option value="low">Info (Verde)</option>
            <option value="medium">Alerta (Naranja)</option>
            <option value="high">Crítico (Rojo)</option>
        </select>
        <textarea id="logTxt" rows="3" placeholder="Observación..."></textarea>
    `, () => {
        const sid = document.getElementById('logStud').value;
        const imp = document.getElementById('logImp').value;
        const txt = document.getElementById('logTxt').value;
        if(sid && txt) {
            const s = app.students.find(x => x.id == sid);
            app.logbook.push({ 
                id: Date.now().toString(), 
                studentId: sid, 
                classId: s.classId, 
                date: new Date().toLocaleDateString(), 
                text: txt, 
                importance: imp 
            });
            save(); renderNbLogbook(); renderDashboard(); closeModal('modalGeneric');
        }
    });
}

function openAddPlanModal() {
    showModal("Planificación", `
        <input type="text" id="planTitle" placeholder="Tema / Lección">
        <input type="date" id="planDate">
        <input type="text" id="planTag" placeholder="Tipo (Editable)" list="planTags">
        <datalist id="planTags"><option value="Lección"><option value="Examen"><option value="Entrega"></datalist>
        <textarea id="planNotes" placeholder="Detalles..."></textarea>
    `, () => {
        const t = document.getElementById('planTitle').value;
        const d = document.getElementById('planDate').value;
        const tag = document.getElementById('planTag').value;
        const n = document.getElementById('planNotes').value;
        if(t && d) {
            app.planning.push({ id: Date.now().toString(), title: t, date: d, tag: tag, notes: n });
            save(); renderNbPlanning(); renderDashboard(); closeModal('modalGeneric');
        }
    });
}

function openScheduleModal() {
    // Simplified: Just add a block for Monday as example of logic, requires full UI for day selection
    // For brevity in this response, I'll alert the logic
    alert("Para editar el horario, implementa un formulario que guarde en app.schedule: {day: 0-4, start: '08:00', classId: '...'}");
}

function showModal(title, bodyHtml, actionFn) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    const btn = document.getElementById('modalActionBtn');
    btn.onclick = actionFn;
    document.getElementById('modalGeneric').style.display = 'flex';
}

// ================= STORAGE & CLOUD =================
function save() {
    localStorage.setItem('TeacherAppV13', JSON.stringify(app));
}
function loadLocal() {
    const d = localStorage.getItem('TeacherAppV13');
    if(d) app = JSON.parse(d);
}

async function cloudSync(action) {
    if(!PANTRY_ID || PANTRY_ID.includes("TU_ID")) { alert("Configura el PANTRY_ID en script.js"); return; }
    
    document.getElementById('syncStatus').innerText = "☁️ ...";
    try {
        if(action === 'push') {
            await fetch(PANTRY_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(app)
            });
            alert("Subido correctamente");
        } else {
            const res = await fetch(PANTRY_URL);
            if(res.ok) {
                const data = await res.json();
                app = data;
                save(); location.reload();
            } else { alert("No se encontraron datos o error de ID"); }
        }
        document.getElementById('syncStatus').innerText = "☁️ OK";
    } catch(e) {
        console.error(e);
        document.getElementById('syncStatus').innerText = "☁️ Error";
        alert("Error de conexión");
    }
}

// Helpers
function updateSidebar() {
    const div = document.getElementById('sidebar-classes-list');
    div.innerHTML = '';
    app.classes.forEach(c => {
        div.innerHTML += `<button onclick="openClassView('${c.id}')" id="btn-cls-${c.id}"><i class="fas fa-chalkboard"></i> ${c.name}</button>`;
    });
    document.getElementById('sidebarName').innerText = app.config.name;
}

function checkCloudStatus() {
    if(PANTRY_ID && !PANTRY_ID.includes("TU_ID")) document.getElementById('syncStatus').innerText = "☁️ Ready";
}

function initUI() { renderNotebook(); }
function renderNotebook() { setNbTab('nb-students'); } // Default tab