// ================= CONFIGURACIÓN =================
const PANTRY_ID = "TU_ID_DE_PANTRY_AQUI"; 
const BASKET_NAME = "teacherTitaniumV17";
const API_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BASKET_NAME}`;

// ================= DICCIONARIO =================
const dictionary = {
    es: {
        settings: "Configuración", menu_main: "PRINCIPAL", dashboard: "Dashboard", notebook: "Notebook (Admin)",
        menu_classes: "MIS CLASES", btn_new_class: "Nueva Clase", dashboard_subtitle: "Resumen general",
        schedule: "Horario Semanal", top_students: "🏆 Top Estudiantes", upcoming: "📌 Próximos Eventos",
        notebook_subtitle: "Gestión centralizada", tab_students: "Estudiantes", tab_gradebook: "Notas", tab_planning: "Planning",
        btn_add_student: "+ Alumno", btn_add_col: "+ Columna", btn_add_event: "+ Evento", class_view_subtitle: "Gestión",
        rewards_title: "⭐ Recompensas", grades_view: "📊 Calificaciones", logbook: "📖 Bitácora"
    },
    en: {
        settings: "Settings", menu_main: "MAIN MENU", dashboard: "Dashboard", notebook: "Notebook (Admin)",
        menu_classes: "MY CLASSES", btn_new_class: "New Class", dashboard_subtitle: "Overview",
        schedule: "Weekly Schedule", top_students: "🏆 Top Students", upcoming: "📌 Upcoming Events",
        notebook_subtitle: "Central Management", tab_students: "Students", tab_gradebook: "Gradebook", tab_planning: "Planning",
        btn_add_student: "+ Student", btn_add_col: "+ Column", btn_add_event: "+ Event", class_view_subtitle: "Management",
        rewards_title: "⭐ Rewards", grades_view: "📊 Grades", logbook: "📖 Logbook"
    }
};

// ================= ESTADO INICIAL =================
let app = {
    settings: { name: "Docente", lang: "es" },
    classes: [], 
    students: [], 
    assignments: [], 
    grades: {}, 
    planning: [], 
    logs: [], 
    schedule: [] // Array: { id, day, classId, start, end }
};
let currentClassId = null;

// ================= INICIO =================
document.addEventListener('DOMContentLoaded', () => {
    loadLocal(); 
    initCustomizers(); 
    updateUI(); 
    nav('dashboard');
});

// ================= UI & UTILS =================
function t(key) { return dictionary[app.settings.lang || 'es'][key] || key; }

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => el.innerText = t(el.getAttribute('data-i18n')));
}

function nav(view) {
    // Cambiar página visible
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    
    // Cambiar estado botones menú
    document.querySelectorAll('.menu button, .class-btn').forEach(b => b.classList.remove('active'));
    
    if(view==='dashboard') { 
        document.getElementById('nav-dashboard').classList.add('active'); 
        renderDashboard(); // IMPORTANTE: Renderizar al entrar
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
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function saveData() { localStorage.setItem('TeacherTitaniumV17', JSON.stringify(app)); }
function loadLocal() { const d = localStorage.getItem('TeacherTitaniumV17'); if(d) app = JSON.parse(d); }

// ================= LOGICA DASHBOARD (HORARIO Y RECOMPENSAS) =================

function renderDashboard() {
    // 1. RENDERIZAR HORARIO
    const scheduleGrid = document.getElementById('dashSchedule');
    scheduleGrid.innerHTML = '';
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    
    days.forEach(day => {
        // Filtrar items del día y ordenar por hora de inicio
        const dayItems = app.schedule
            .filter(s => s.day === day)
            .sort((a,b) => a.start.localeCompare(b.start));

        let html = `<div class="day-col"><h4>${day}</h4>`;
        
        dayItems.forEach(item => {
            const cls = app.classes.find(c => c.id == item.classId);
            const color = cls ? cls.color : '#ccc';
            const name = cls ? cls.name : 'Clase Borrada';
            
            html += `
            <div class="sch-item" style="border-left-color: ${color}">
                <div style="font-weight:bold; color:${color}">${name}</div>
                <small><i class="far fa-clock"></i> ${item.start} - ${item.end}</small>
                <div style="text-align:right; margin-top:5px">
                    <button onclick="deleteScheduleItem('${item.id}')" style="border:none;background:none;color:red;cursor:pointer;">×</button>
                </div>
            </div>`;
        });
        
        html += `</div>`;
        scheduleGrid.innerHTML += html;
    });

    // 2. RENDERIZAR TOP ESTUDIANTES (GLOBAL)
    const topList = document.getElementById('dashTopStudents');
    topList.innerHTML = '';
    
    // Clonar array, ordenar por puntos descendente, tomar top 5
    const topStudents = [...app.students]
        .sort((a,b) => (b.points || 0) - (a.points || 0))
        .slice(0, 5);

    topStudents.forEach((s, index) => {
        const cls = app.classes.find(c => c.id == s.classId);
        const medals = ["🥇", "🥈", "🥉"];
        const medal = medals[index] || "🏅";
        
        topList.innerHTML += `
        <div class="top-student-row">
            <div>
                <span class="medal">${medal}</span> <b>${s.name}</b>
                <br><small style="color:#666">${cls ? cls.name : ''}</small>
            </div>
            <span class="xp-badge">${s.points || 0} XP</span>
        </div>`;
    });

    // 3. RENDERIZAR PROXIMOS EVENTOS (Resumen)
    const planList = document.getElementById('dashPlannerList');
    planList.innerHTML = '';
    const upcoming = app.planning
        .sort((a,b) => new Date(a.date) - new Date(b.date))
        .filter(p => new Date(p.date) >= new Date().setHours(0,0,0,0)) // Solo futuros o hoy
        .slice(0, 5);

    upcoming.forEach(p => {
        planList.innerHTML += `
        <div style="padding:10px; border-bottom:1px solid #eee">
            📌 <b>${p.title}</b> <span style="font-size:0.8rem; color:#666">(${p.date})</span>
        </div>`;
    });
}

// ================= HORARIO (SCHEDULE) LOGICA =================

function openScheduleEditor() { 
    openModal('modalSchedule'); 
    const s = document.getElementById('schClass'); 
    s.innerHTML = ''; 
    app.classes.forEach(c => s.innerHTML += `<option value="${c.id}">${c.name}</option>`); 
}

function addScheduleItem() {
    const day = document.getElementById('schDay').value;
    const cid = document.getElementById('schClass').value;
    const start = document.getElementById('schStart').value;
    const end = document.getElementById('schEnd').value;

    if(cid && start && end) {
        app.schedule.push({
            id: Date.now().toString(),
            day: day,
            classId: cid,
            start: start,
            end: end
        });
        saveData();
        renderDashboard();
        closeModal('modalSchedule');
    } else {
        alert("Por favor completa todos los campos del horario");
    }
}

function deleteScheduleItem(id) {
    if(confirm("¿Eliminar bloque horario?")) {
        app.schedule = app.schedule.filter(s => s.id !== id);
        saveData();
        renderDashboard();
    }
}

// ================= RECOMPENSAS & ALUMNOS (CLASE) =================

function renderClassStudentGrid() {
    const grid = document.getElementById('classStudentGrid');
    grid.innerHTML = '';
    
    const studentsInClass = app.students.filter(s => s.classId == currentClassId);

    if(studentsInClass.length === 0) {
        grid.innerHTML = '<p style="color:#888; grid-column:1/-1; text-align:center">No hay alumnos en esta clase.</p>';
        return;
    }

    studentsInClass.forEach(s => {
        grid.innerHTML += `
        <div class="student-card">
            <h4>${s.name}</h4>
            <div style="margin:10px 0;">
                <span class="xp-badge">⭐ ${s.points || 0} XP</span>
            </div>
            <div class="btn-xp-row">
                <button class="btn-xp plus" onclick="givePoints('${s.id}', 1)" title="+1 XP">+</button>
                <button class="btn-xp minus" onclick="givePoints('${s.id}', -1)" title="-1 XP">-</button>
            </div>
        </div>`;
    });
}

function givePoints(studentId, amount) {
    const student = app.students.find(s => s.id == studentId);
    if(student) {
        // Inicializar si es undefined
        if(typeof student.points !== 'number') student.points = 0;
        
        student.points += amount;
        saveData();
        
        // Refrescar vista actual
        renderClassStudentGrid(); 
        
        // Nota: El dashboard se actualizará cuando navegues a él
    }
}

// ================= CLASES (CREACIÓN Y VISTA) =================
function initCustomizers() {
    const icons = ['fa-chalkboard', 'fa-flask', 'fa-book', 'fa-palette', 'fa-calculator', 'fa-music', 'fa-globe', 'fa-laptop-code'];
    const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#db2777', '#0891b2', '#4b5563'];
    const iCont = document.getElementById('iconSelector'), cCont = document.getElementById('colorSelector');
    
    if(iCont.innerHTML === '') {
        icons.forEach(ic => iCont.innerHTML += `<div class="sel-opt" onclick="selectOpt('selectedIcon', '${ic}', this)"><i class="fas ${ic}"></i></div>`);
        colors.forEach(col => cCont.innerHTML += `<div class="sel-color" style="background:${col}" onclick="selectOpt('selectedColor', '${col}', this)"></div>`);
    }
}
function selectOpt(hiddenId, val, el) {
    document.getElementById(hiddenId).value = val;
    el.parentNode.querySelectorAll('div').forEach(x => x.classList.remove('selected'));
    el.classList.add('selected');
}
function addClass() {
    const name = document.getElementById('newClassName').value;
    if(name) {
        app.classes.push({ 
            id: Date.now().toString(), 
            name, 
            icon: document.getElementById('selectedIcon').value, 
            color: document.getElementById('selectedColor').value 
        });
        saveData(); updateUI(); closeModal('modalClass');
    }
}
function openClassView(id, btn) {
    currentClassId = id;
    const c = app.classes.find(x => x.id == id);
    const h = document.getElementById('classHeader');
    h.style.borderLeft = `5px solid ${c.color}`;
    document.getElementById('viewClassTitle').innerText = c.name;
    document.getElementById('viewClassTitle').style.color = c.color;
    
    renderClassStudentGrid(); 
    renderClassGradebookView(); 
    renderClassLogbookView();
    
    nav('class'); 
    if(btn) btn.classList.add('active');
}

// ================= GRADEBOOK & ASSIGNMENTS (EDITABLE) =================
function openAssignmentModal(editId = null) {
    openModal('modalAssignment');
    const sel = document.getElementById('newAssClass');
    sel.innerHTML = '<option value="">-- Seleccionar Clase --</option>';
    app.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);

    if(editId) {
        const task = app.assignments.find(a => a.id === editId);
        document.getElementById('assEditId').value = task.id;
        document.getElementById('newAssTitle').value = task.title;
        document.getElementById('newAssTag').value = task.tag;
        document.getElementById('newAssClass').value = task.classId;
    } else {
        document.getElementById('assEditId').value = "";
        document.getElementById('newAssTitle').value = "";
        document.getElementById('newAssTag').value = "";
    }
}

function saveAssignment() {
    const id = document.getElementById('assEditId').value;
    const title = document.getElementById('newAssTitle').value;
    const tag = document.getElementById('newAssTag').value;
    const cid = document.getElementById('newAssClass').value;

    if(title && cid) {
        if(id) {
            const idx = app.assignments.findIndex(a => a.id === id);
            if(idx > -1) {
                app.assignments[idx].title = title;
                app.assignments[idx].tag = tag;
                app.assignments[idx].classId = cid;
            }
        } else {
            app.assignments.push({ id: Date.now().toString(), classId: cid, title, tag });
        }
        saveData(); renderGradebook(); closeModal('modalAssignment');
    }
}

function deleteAssignment(id) {
    if(confirm("¿Eliminar columna y notas asociadas?")) {
        app.assignments = app.assignments.filter(a => a.id !== id);
        saveData(); renderGradebook();
    }
}

function renderGradebook() {
    const cid = document.getElementById('filterGradebookClass').value;
    const div = document.getElementById('gradebookContainer');
    if(!cid) { div.innerHTML='<p style="padding:20px;color:#888">Selecciona una clase</p>'; return; }
    
    const assigns = app.assignments.filter(a => a.classId == cid);
    const studs = app.students.filter(s => s.classId == cid);
    
    let html = `<table><thead><tr><th>Alumno</th>`;
    assigns.forEach(a => {
        html += `<th>
            <div style="display:flex; justify-content:space-between; align-items:center">
                <span>${a.title}<br><small>${a.tag}</small></span>
                <div>
                    <button class="btn-icon" onclick="openAssignmentModal('${a.id}')">✏️</button>
                    <button class="btn-icon" style="color:red" onclick="deleteAssignment('${a.id}')">×</button>
                </div>
            </div>
        </th>`;
    });
    html += `</tr></thead><tbody>`;

    studs.forEach(s => {
        html += `<tr><td><b>${s.name}</b></td>`;
        assigns.forEach(a => {
            const k = `${s.id}_${a.id}`;
            const val = app.grades[k] || "";
            html += `<td><input type="number" class="gb-input" value="${val}" onchange="app.grades['${k}']=this.value;saveData()"></td>`;
        });
        html += `</tr>`;
    });
    html += `</tbody></table>`;
    div.innerHTML = html;
}

// ================= PLANNING (SMART LINK) =================
function openPlanningModal(editId = null) {
    openModal('modalPlanning');
    const sel = document.getElementById('planClass');
    sel.innerHTML = '<option value="">-- Clase --</option>';
    app.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    
    document.getElementById('planLinkToGradebook').checked = false;

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
        document.getElementById('planDate').value = "";
        document.getElementById('planTag').value = "";
        document.getElementById('planDesc').value = "";
        document.querySelector('.smart-link-box').style.display = 'block';
    }
}

function checkSmartKeywords() {
    const val = document.getElementById('planTitle').value.toLowerCase();
    const keywords = ["examen", "prueba", "test", "entrega", "proyecto", "quiz", "evaluacion"];
    const found = keywords.some(k => val.includes(k));
    if(found) document.getElementById('planLinkToGradebook').checked = true;
}

function savePlanning() {
    const id = document.getElementById('planEditId').value;
    const title = document.getElementById('planTitle').value;
    const date = document.getElementById('planDate').value;
    const tag = document.getElementById('planTag').value;
    const cid = document.getElementById('planClass').value;
    const desc = document.getElementById('planDesc').value;
    const linkToGb = document.getElementById('planLinkToGradebook').checked;

    if(title && cid) {
        if(id) {
            const idx = app.planning.findIndex(p => p.id === id);
            if(idx > -1) {
                app.planning[idx] = { ...app.planning[idx], title, date, tag, classId: cid, desc };
            }
        } else {
            app.planning.push({ id: Date.now().toString(), title, date, tag: tag||"Evento", classId: cid, desc });
            if(linkToGb) {
                if(confirm(`¿Crear también la columna "${title}" en el Gradebook?`)) {
                    app.assignments.push({ 
                        id: Date.now().toString() + "_lnk", 
                        classId: cid, 
                        title: title, 
                        tag: tag.substring(0,3).toUpperCase() || "EV" 
                    });
                }
            }
        }
        saveData(); renderPlanning(); renderDashboard(); closeModal('modalPlanning');
    }
}

function renderPlanning() {
    const div = document.getElementById('planningGrid');
    div.innerHTML = '';
    app.planning.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(p => {
        const c = app.classes.find(x => x.id == p.classId);
        div.innerHTML += `
        <div class="card" style="padding:15px">
            <div style="display:flex;justify-content:space-between">
                <h4>${p.title}</h4>
                <div>
                    <button class="btn-icon" onclick="openPlanningModal('${p.id}')">✏️</button>
                    <button class="btn-icon" style="color:red" onclick="deletePlan('${p.id}')">×</button>
                </div>
            </div>
            <span style="font-size:0.8rem;background:#eff6ff;padding:2px 5px;border-radius:3px;color:var(--primary)">${p.tag}</span>
            <p style="font-size:0.85rem;color:#666;margin:5px 0">${p.date} - ${c?c.name:'?'}</p>
        </div>`;
    });
}
function deletePlan(id) {
    if(confirm("Borrar?")) { app.planning = app.planning.filter(p => p.id !== id); saveData(); renderPlanning(); renderDashboard(); }
}

// ================= BITACORA (EDITABLE) =================
function openLogModal(editId = null) {
    openModal('modalLog');
    const sel = document.getElementById('logStudent');
    sel.innerHTML = '';
    app.classes.forEach(c => {
        const g = document.createElement('optgroup'); g.label = c.name;
        app.students.filter(s => s.classId == c.id).forEach(s => {
            const o = document.createElement('option'); o.value = s.id; o.innerText = s.name;
            g.appendChild(o);
        });
        sel.appendChild(g);
    });

    if(editId) {
        const l = app.logs.find(x => x.id === editId);
        document.getElementById('logEditId').value = l.id;
        document.getElementById('logStudent').value = l.studentId;
        document.getElementById('logImp').value = l.importance;
        document.getElementById('logText').value = l.text;
    } else {
        document.getElementById('logEditId').value = "";
        document.getElementById('logText').value = "";
    }
}

function saveLog() {
    const id = document.getElementById('logEditId').value;
    const sid = document.getElementById('logStudent').value;
    const imp = document.getElementById('logImp').value;
    const txt = document.getElementById('logText').value;

    if(sid && txt) {
        if(id) {
            const idx = app.logs.findIndex(l => l.id === id);
            if(idx > -1) {
                app.logs[idx].studentId = sid;
                app.logs[idx].importance = imp;
                app.logs[idx].text = txt;
            }
        } else {
            const s = app.students.find(x => x.id == sid);
            app.logs.push({ id: Date.now().toString(), studentId: sid, classId: s.classId, date: new Date().toLocaleDateString(), text: txt, importance: imp });
        }
        saveData(); renderLogs(); renderDashboard(); closeModal('modalLog');
    }
}

function renderLogs() {
    const div = document.getElementById('globalLogsList');
    div.innerHTML = '';
    [...app.logs].reverse().forEach(l => {
        const s = app.students.find(x => x.id == l.studentId);
        const c = app.classes.find(x => x.id == l.classId);
        div.innerHTML += `
        <div class="log-card ${l.importance}">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#666">
                <span>${l.date} - ${c?c.name:''} - <b>${s?s.name:''}</b></span>
                <div class="action-icons">
                    <button class="btn-icon" onclick="openLogModal('${l.id}')">✏️</button>
                    <button class="btn-icon" style="color:red" onclick="deleteLog('${l.id}')">×</button>
                </div>
            </div>
            <p style="margin-top:5px">${l.text}</p>
        </div>`;
    });
}
function deleteLog(id) {
    if(confirm("Eliminar entrada?")) { app.logs = app.logs.filter(l => l.id !== id); saveData(); renderLogs(); renderDashboard(); }
}

// ================= ESTUDIANTES (CRUD BASIC) =================
function addStudent() {
    const name = document.getElementById('newStudName').value; const cid = document.getElementById('newStudClass').value;
    if(name && cid) { app.students.push({ id: Date.now().toString(), name, classId: cid, points: 0 }); saveData(); renderStudents(); closeModal('modalStudent'); }
}
function renderStudents() {
    const cid = document.getElementById('filterStudentClass').value;
    const t = document.getElementById('studentsTable');
    let d = app.students; if(cid) d = d.filter(s => s.classId == cid);
    let h = `<table><thead><tr><th>Nombre</th><th>XP</th><th>X</th></tr></thead><tbody>`;
    d.forEach(s => h += `<tr><td>${s.name}</td><td>⭐ ${s.points||0}</td><td><button onclick="deleteStud('${s.id}')" class="btn-flat" style="color:red">×</button></td></tr>`);
    t.innerHTML = h + `</tbody></table>`;
}
function deleteStud(id) { if(confirm("Borrar?")) { app.students = app.students.filter(s => s.id !== id); saveData(); renderStudents(); } }

// ================= VISTAS DE SOLO LECTURA EN CLASE =================
function renderClassGradebookView() {
    const d = document.getElementById('classGradebookView');
    const as = app.assignments.filter(a=>a.classId==currentClassId);
    const st = app.students.filter(s=>s.classId==currentClassId);
    let h = `<table><thead><tr><th>Alumno</th>`; as.forEach(a=>h+=`<th>${a.tag}</th>`); h+=`<th>Prom</th></tr></thead><tbody>`;
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
function deleteCurrentClass() { if(confirm("Borrar clase completa?")) { app.classes=app.classes.filter(c=>c.id!==currentClassId); nav('dashboard'); saveData(); updateUI(); } }

function updateUI() {
    applyTranslations(); document.getElementById('lblProfileName').innerText = app.settings.name;
    const l = document.getElementById('sidebarClassList'); l.innerHTML='';
    app.classes.forEach(c => {
        const b = document.createElement('button'); b.className = 'class-btn'; b.style.borderLeftColor = c.color;
        b.innerHTML = `<i class="fas ${c.icon}" style="color:${c.color}"></i> ${c.name}`;
        b.onclick = () => openClassView(c.id, b); l.appendChild(b);
    });
    ['newStudClass','newAssClass','filterStudentClass','filterGradebookClass'].forEach(id => {
        const s = document.getElementById(id); if(s){ s.innerHTML='<option value="">Clase...</option>'; app.classes.forEach(c=>s.innerHTML+=`<option value="${c.id}">${c.name}</option>`); }
    });
}

function openConfigModal() { openModal('modalConfig'); document.getElementById('cfgName').value=app.settings.name; document.getElementById('cfgLang').value=app.settings.lang; }
function saveConfig() { app.settings.name = document.getElementById('cfgName').value; app.settings.lang = document.getElementById('cfgLang').value; saveData(); updateUI(); closeModal('modalConfig'); }
async function cloudSync(act) {
    if(!PANTRY_ID || PANTRY_ID.includes("TU_ID")) return alert("Configura PANTRY_ID");
    try {
        if(act==='push') await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(app)});
        else { const r=await fetch(API_URL); app=await r.json(); saveData(); location.reload(); }
        alert("OK");
    } catch(e) { alert("Error"); }
}