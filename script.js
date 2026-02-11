// ================= CONFIGURACIÓN =================
// PEGA AQUÍ TU ID DE PANTRY (Mantén las comillas)
const PANTRY_ID = "TU_ID_DE_PANTRY_AQUI"; 
const BASKET_NAME = "teacherTitaniumV14";
const API_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BASKET_NAME}`;

// ================= ESTADO DE DATOS =================
let app = {
    settings: { name: "Docente", lastSync: null },
    classes: [],        // { id, name }
    students: [],       // { id, name, classId }
    assignments: [],    // { id, classId, title, tag }
    grades: {},         // Objeto mapa: { "studentId_assignmentId": score }
    planning: [],       // { id, classId, title, date, tag, desc }
    logs: [],           // { id, studentId, classId, date, text, importance }
    schedule: []        // { id, day, classId, start, end }
};

let currentClassId = null;

// ================= INICIALIZACIÓN =================
document.addEventListener('DOMContentLoaded', () => {
    loadLocal();
    updateUI();
    nav('dashboard');
    if(PANTRY_ID && !PANTRY_ID.includes("TU_ID")) document.getElementById('cloudStatus').innerText = "☁️ Ready";
});

// ================= NAVEGACIÓN Y UI =================
function nav(viewId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    
    // Sidebar active state
    document.querySelectorAll('.menu button').forEach(b => b.classList.remove('active'));
    if(viewId === 'dashboard') {
        document.getElementById('nav-dashboard').classList.add('active');
        renderDashboard();
    } else if(viewId === 'notebook') {
        document.getElementById('nav-notebook').classList.add('active');
        // Render initial notebook tab
        renderStudents(); 
    }
}

function switchNbTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    // Refresh data logic
    if(tabId === 'tab-nb-students') renderStudents();
    if(tabId === 'tab-nb-gradebook') renderGradebook();
    if(tabId === 'tab-nb-planning') renderPlanning();
    if(tabId === 'tab-nb-logs') renderGlobalLogs();
}

// ================= LOGICA DE DATOS (CRUD) =================

// --- CLASES ---
function addClass() {
    const name = document.getElementById('newClassName').value;
    if(name) {
        app.classes.push({ id: Date.now().toString(), name: name });
        saveData();
        updateUI();
        closeModal('modalClass');
        document.getElementById('newClassName').value = "";
    }
}

function openClassView(id) {
    currentClassId = id;
    const cls = app.classes.find(c => c.id == id);
    document.getElementById('viewClassTitle').innerText = cls.name;
    
    // Ocultar widget asistencia
    document.getElementById('attendanceWidget').style.display = 'none';

    // Render Read-Only Views
    renderClassGradebookView();
    renderClassPlanningView();
    renderClassLogbookView();

    nav('class');
    
    // Highlight sidebar manually
    document.querySelectorAll('.menu button').forEach(b => b.classList.remove('active'));
}

function deleteCurrentClass() {
    if(confirm("¿Borrar esta clase y todos sus datos?")) {
        app.classes = app.classes.filter(c => c.id !== currentClassId);
        // Clean orphan data
        app.students = app.students.filter(s => s.classId !== currentClassId);
        app.assignments = app.assignments.filter(a => a.classId !== currentClassId);
        app.planning = app.planning.filter(p => p.classId !== currentClassId);
        saveData();
        nav('dashboard');
        updateUI();
    }
}

// --- ESTUDIANTES ---
function addStudent() {
    const name = document.getElementById('newStudName').value;
    const cid = document.getElementById('newStudClass').value;
    if(name && cid) {
        app.students.push({ id: Date.now().toString(), name, classId: cid });
        saveData();
        renderStudents();
        closeModal('modalStudent');
        document.getElementById('newStudName').value = "";
    }
}

function renderStudents() {
    const filter = document.getElementById('filterStudentClass').value;
    const container = document.getElementById('studentsTable');
    
    let list = app.students;
    if(filter) list = list.filter(s => s.classId == filter);

    let html = `<table><thead><tr><th>Nombre</th><th>Clase</th><th>Acción</th></tr></thead><tbody>`;
    list.forEach(s => {
        const c = app.classes.find(x => x.id == s.classId);
        html += `<tr>
            <td>${s.name}</td>
            <td>${c ? c.name : 'Sin clase'}</td>
            <td><button onclick="deleteStudent('${s.id}')" class="btn-text" style="color:var(--danger)">Eliminar</button></td>
        </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}
function deleteStudent(id) {
    if(confirm("Eliminar alumno?")) {
        app.students = app.students.filter(s => s.id !== id);
        saveData(); renderStudents();
    }
}

// --- GRADEBOOK (MATRIX) ---
function addAssignment() {
    const title = document.getElementById('newAssTitle').value;
    const tag = document.getElementById('newAssTag').value;
    const cid = document.getElementById('newAssClass').value;
    if(title && cid) {
        app.assignments.push({ id: Date.now().toString(), classId: cid, title, tag });
        saveData();
        renderGradebook();
        closeModal('modalAssignment');
        document.getElementById('newAssTitle').value = "";
    }
}

function renderGradebook() {
    const cid = document.getElementById('filterGradebookClass').value;
    const container = document.getElementById('gradebookContainer');
    
    if(!cid) { container.innerHTML = '<p style="padding:20px; color:#666">Selecciona una clase para editar notas.</p>'; return; }

    const studs = app.students.filter(s => s.classId == cid);
    const assigns = app.assignments.filter(a => a.classId == cid);

    let html = `<table><thead><tr><th>Alumno</th>`;
    assigns.forEach(a => html += `<th>${a.title}<br><small>${a.tag}</small></th>`);
    html += `</tr></thead><tbody>`;

    studs.forEach(s => {
        html += `<tr><td><b>${s.name}</b></td>`;
        assigns.forEach(a => {
            const key = `${s.id}_${a.id}`;
            const val = app.grades[key] || "";
            html += `<td><input type="number" class="gb-input" value="${val}" onchange="saveGrade('${s.id}', '${a.id}', this.value)"></td>`;
        });
        html += `</tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function saveGrade(sid, aid, val) {
    const key = `${sid}_${aid}`;
    app.grades[key] = val;
    saveData(); // Auto save
}

// --- PLANNING ---
function addPlanning() {
    const title = document.getElementById('planTitle').value;
    const date = document.getElementById('planDate').value;
    const tag = document.getElementById('planTag').value; // TEXTO LIBRE
    const cid = document.getElementById('planClass').value;
    const desc = document.getElementById('planDesc').value;

    if(title && date && cid) {
        app.planning.push({ id: Date.now().toString(), title, date, tag: tag || "Evento", classId: cid, desc });
        saveData();
        renderPlanning();
        renderDashboard();
        closeModal('modalPlanning');
        document.getElementById('planTitle').value = "";
    }
}

function renderPlanning() {
    const filter = document.getElementById('filterPlanClass').value;
    const container = document.getElementById('planningGrid');
    
    let items = app.planning;
    if(filter) items = items.filter(i => i.classId == filter);
    
    // Sort by date
    items.sort((a,b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = '';
    items.forEach(p => {
        const c = app.classes.find(x => x.id == p.classId);
        container.innerHTML += `
        <div class="card" style="padding:15px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start">
                <div>
                    <h4 style="margin:0">${p.title}</h4>
                    <span style="font-size:0.75rem; background:#eff6ff; padding:2px 5px; border-radius:4px; color:var(--primary)">${p.tag}</span>
                </div>
                <button onclick="deletePlan('${p.id}')" class="btn-text" style="color:red">×</button>
            </div>
            <p style="font-size:0.85rem; color:#666; margin:5px 0;">${c ? c.name : '?'}</p>
            <p style="font-size:0.85rem;">📅 ${p.date}</p>
            <small>${p.desc}</small>
        </div>`;
    });
}
function deletePlan(id) {
    if(confirm("Borrar evento?")) {
        app.planning = app.planning.filter(p => p.id !== id);
        saveData(); renderPlanning(); renderDashboard();
    }
}

// --- LOGBOOK ---
function openLogModal() {
    openModal('modalLog');
    const sel = document.getElementById('logStudent');
    sel.innerHTML = '';
    // Group by class for better UX
    app.classes.forEach(c => {
        const studs = app.students.filter(s => s.classId == c.id);
        if(studs.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = c.name;
            studs.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.innerText = s.name;
                optgroup.appendChild(opt);
            });
            sel.appendChild(optgroup);
        }
    });
}

function saveLog() {
    const sid = document.getElementById('logStudent').value;
    const imp = document.getElementById('logImp').value;
    const txt = document.getElementById('logText').value;
    
    if(sid && txt) {
        const s = app.students.find(x => x.id == sid);
        app.logs.push({
            id: Date.now().toString(),
            studentId: sid,
            classId: s.classId,
            date: new Date().toLocaleDateString(),
            text: txt,
            importance: imp
        });
        saveData();
        renderGlobalLogs();
        renderDashboard();
        closeModal('modalLog');
        document.getElementById('logText').value = "";
    }
}

function renderGlobalLogs() {
    const div = document.getElementById('globalLogsList');
    div.innerHTML = '';
    const sorted = [...app.logs].reverse();
    
    sorted.forEach(l => {
        const s = app.students.find(x => x.id == l.studentId);
        const c = app.classes.find(x => x.id == l.classId);
        div.innerHTML += `
        <div class="log-card ${l.importance}">
            <div class="log-header">
                <span>${l.date} - ${c ? c.name : '?'}</span>
                <span>${s ? s.name : '?'}</span>
            </div>
            <p>${l.text}</p>
            <div class="log-actions">
                <button onclick="deleteLog('${l.id}')" class="btn-text">Borrar</button>
            </div>
        </div>`;
    });
}
function deleteLog(id) {
    if(confirm("¿Eliminar entrada?")) {
        app.logs = app.logs.filter(l => l.id !== id);
        saveData(); renderGlobalLogs(); renderDashboard();
    }
}

// --- DASHBOARD & SCHEDULE ---
function renderDashboard() {
    // Schedule
    const grid = document.getElementById('dashSchedule');
    grid.innerHTML = '';
    const days = ["Lunes","Martes","Miércoles","Jueves","Viernes"];
    
    days.forEach(d => {
        let html = `<div class="day-col"><h5>${d}</h5>`;
        const items = app.schedule.filter(s => s.day === d).sort((a,b) => a.start.localeCompare(b.start));
        items.forEach(i => {
            const c = app.classes.find(x => x.id == i.classId);
            html += `<div class="sch-item">
                <b>${i.start}</b> - ${c?c.name:'?'}<br>
                <small onclick="deleteSchedule('${i.id}')" style="cursor:pointer;color:red">Borrar</small>
            </div>`;
        });
        html += `</div>`;
        grid.innerHTML += html;
    });

    // Upcoming Planner
    const planList = document.getElementById('dashPlannerList');
    planList.innerHTML = '';
    app.planning.slice(0,5).forEach(p => {
        const c = app.classes.find(x => x.id == p.classId);
        planList.innerHTML += `<div style="padding:10px; border-bottom:1px solid #eee">
            <span class="btn-text" style="color:var(--primary)">${p.tag}</span> <b>${p.title}</b> 
            <br><small>${p.date} - ${c?c.name:''}</small>
        </div>`;
    });

    // Recent Logs
    const logList = document.getElementById('dashLogList');
    logList.innerHTML = '';
    app.logs.slice(-5).reverse().forEach(l => {
        const s = app.students.find(x => x.id == l.studentId);
        const color = l.importance === 'high' ? 'red' : l.importance === 'medium' ? 'orange' : 'green';
        logList.innerHTML += `<div style="padding:10px; border-bottom:1px solid #eee; border-left:3px solid ${color}">
            <b>${s?s.name:'?'}</b>: ${l.text}
        </div>`;
    });
}

// Editor de Horario
function openScheduleEditor() {
    openModal('modalSchedule');
    const sel = document.getElementById('schClass');
    sel.innerHTML = '';
    app.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
}
function addScheduleItem() {
    const day = document.getElementById('schDay').value;
    const cid = document.getElementById('schClass').value;
    const start = document.getElementById('schStart').value;
    const end = document.getElementById('schEnd').value;
    if(cid && start) {
        app.schedule.push({ id: Date.now().toString(), day, classId: cid, start, end });
        saveData(); renderDashboard(); closeModal('modalSchedule');
    }
}
function deleteSchedule(id) {
    app.schedule = app.schedule.filter(s => s.id !== id);
    saveData(); renderDashboard();
}

// --- VISTAS DE SOLO LECTURA (CLASE INDIVIDUAL) ---
function renderClassGradebookView() {
    const div = document.getElementById('classGradebookView');
    const assigns = app.assignments.filter(a => a.classId == currentClassId);
    const studs = app.students.filter(s => s.classId == currentClassId);

    if(!assigns.length) { div.innerHTML = "<small>No hay actividades.</small>"; return; }

    let html = `<table><thead><tr><th>Alumno</th>`;
    assigns.forEach(a => html += `<th>${a.tag}</th>`);
    html += `<th>Prom</th></tr></thead><tbody>`;

    studs.forEach(s => {
        let sum = 0, count = 0;
        html += `<tr><td>${s.name}</td>`;
        assigns.forEach(a => {
            const val = app.grades[`${s.id}_${a.id}`];
            const num = parseFloat(val);
            if(!isNaN(num)) { sum += num; count++; }
            html += `<td>${val || '-'}</td>`;
        });
        html += `<td><b>${count ? (sum/count).toFixed(1) : '-'}</b></td></tr>`;
    });
    html += `</tbody></table>`;
    div.innerHTML = html;
}

function renderClassLogbookView() {
    const div = document.getElementById('classLogbookView');
    const list = app.logs.filter(l => l.classId == currentClassId).reverse();
    div.innerHTML = '';
    list.forEach(l => {
        const s = app.students.find(x => x.id == l.studentId);
        div.innerHTML += `<div class="log-card ${l.importance}">
            <small>${l.date} - <b>${s?s.name:'?'}</b></small>
            <p>${l.text}</p>
        </div>`;
    });
}

function renderClassPlanningView() {
    const div = document.getElementById('classPlanningView');
    const list = app.planning.filter(p => p.classId == currentClassId).sort((a,b)=>new Date(a.date)-new Date(b.date));
    div.innerHTML = '';
    list.forEach(p => {
        div.innerHTML += `<div style="padding:10px; border-bottom:1px solid #eee">
            <b>${p.title}</b> (${p.tag})<br><small>${p.date}</small>
        </div>`;
    });
}

function toggleAttendance() {
    const w = document.getElementById('attendanceWidget');
    if(w.style.display === 'none') {
        w.style.display = 'block';
        document.getElementById('attDate').innerText = new Date().toLocaleDateString();
        const list = document.getElementById('attList');
        list.innerHTML = '';
        app.students.filter(s => s.classId == currentClassId).forEach(s => {
            list.innerHTML += `<label class="att-check"><input type="checkbox" checked id="att-${s.id}"> ${s.name}</label>`;
        });
    } else {
        w.style.display = 'none';
    }
}
function saveAttendance() {
    // Aquí podrías guardar un log automático de quién faltó
    alert("Asistencia Guardada (Simulación)");
    toggleAttendance();
}

// ================= UTILIDADES =================
function saveData() { localStorage.setItem('TeacherTitaniumV14', JSON.stringify(app)); }
function loadLocal() {
    const d = localStorage.getItem('TeacherTitaniumV14');
    if(d) app = JSON.parse(d);
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function updateUI() {
    document.getElementById('lblProfileName').innerText = app.settings.name;
    const sidebarList = document.getElementById('sidebarClassList');
    sidebarList.innerHTML = '';
    app.classes.forEach(c => {
        const btn = document.createElement('button');
        btn.innerHTML = `<i class="fas fa-chalkboard"></i> ${c.name}`;
        btn.onclick = () => openClassView(c.id);
        sidebarList.appendChild(btn);
    });

    // Llenar selects globales
    const populate = (id) => {
        const s = document.getElementById(id);
        if(!s) return;
        s.innerHTML = '<option value="">-- Seleccionar Clase --</option>';
        app.classes.forEach(c => s.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    };
    ['newStudClass', 'newAssClass', 'planClass', 'filterStudentClass', 'filterGradebookClass', 'filterPlanClass'].forEach(populate);
}

function openConfigModal() {
    openModal('modalConfig');
    document.getElementById('cfgName').value = app.settings.name;
}
function saveConfig() {
    app.settings.name = document.getElementById('cfgName').value;
    saveData(); updateUI(); closeModal('modalConfig');
}

// ================= NUBE (PANTRY) =================
async function cloudSync(action) {
    if(!PANTRY_ID || PANTRY_ID.includes("TU_ID")) {
        alert("⚠️ Configura el PANTRY_ID en script.js");
        return;
    }
    const status = document.getElementById('cloudStatus');
    status.innerText = "☁️ Sincronizando...";
    
    try {
        if(action === 'push') {
            await fetch(API_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(app)
            });
            alert("✅ Datos subidos correctamente.");
        } else {
            const res = await fetch(API_URL);
            if(!res.ok) throw new Error("Error fetching");
            const data = await res.json();
            app = data;
            saveData();
            location.reload();
        }
        status.innerText = "☁️ OK";
    } catch(e) {
        console.error(e);
        status.innerText = "☁️ Error";
        alert("Error de conexión con la nube.");
    }
}