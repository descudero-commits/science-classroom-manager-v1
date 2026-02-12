// ================= CONFIGURACIÓN =================
const PANTRY_ID = "9df76c09-c878-45e6-9df9-7b02d9cd00ef"; 
const BASKET_NAME = "teacherTitaniumV16";
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

// ================= ESTADO =================
let app = {
    settings: { name: "Docente", lang: "es" },
    classes: [], students: [], assignments: [], grades: {}, planning: [], logs: [], schedule: []
};
let currentClassId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadLocal(); initCustomizers(); updateUI(); nav('dashboard');
});

// ================= UI & UTILS =================
function t(key) { return dictionary[app.settings.lang || 'es'][key] || key; }
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => el.innerText = t(el.getAttribute('data-i18n')));
}
function nav(view) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    document.querySelectorAll('.menu button, .class-btn').forEach(b => b.classList.remove('active'));
    if(view==='dashboard') { document.getElementById('nav-dashboard').classList.add('active'); renderDashboard(); }
    if(view==='notebook') { document.getElementById('nav-notebook').classList.add('active'); renderStudents(); }
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
function saveData() { localStorage.setItem('TeacherTitaniumV16', JSON.stringify(app)); }
function loadLocal() { const d = localStorage.getItem('TeacherTitaniumV16'); if(d) app = JSON.parse(d); }

// ================= CLASES =================
function initCustomizers() {
    const icons = ['fa-chalkboard', 'fa-flask', 'fa-book', 'fa-palette', 'fa-calculator', 'fa-music', 'fa-globe'];
    const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#db2777', '#0891b2'];
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
        app.classes.push({ id: Date.now().toString(), name, icon: document.getElementById('selectedIcon').value, color: document.getElementById('selectedColor').value });
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
    renderClassStudentGrid(); renderClassGradebookView(); renderClassLogbookView();
    nav('class'); if(btn) btn.classList.add('active');
}

// ================= GRADEBOOK & ASSIGNMENTS (EDITABLE) =================
function openAssignmentModal(editId = null) {
    openModal('modalAssignment');
    const sel = document.getElementById('newAssClass');
    sel.innerHTML = '<option value="">-- Seleccionar Clase --</option>';
    app.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);

    if(editId) {
        // MODO EDICIÓN
        const task = app.assignments.find(a => a.id === editId);
        document.getElementById('assEditId').value = task.id;
        document.getElementById('newAssTitle').value = task.title;
        document.getElementById('newAssTag').value = task.tag;
        document.getElementById('newAssClass').value = task.classId;
    } else {
        // MODO NUEVO
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
            // EDITAR EXISTENTE
            const idx = app.assignments.findIndex(a => a.id === id);
            if(idx > -1) {
                app.assignments[idx].title = title;
                app.assignments[idx].tag = tag;
                app.assignments[idx].classId = cid;
            }
        } else {
            // CREAR NUEVO
            app.assignments.push({ id: Date.now().toString(), classId: cid, title, tag });
        }
        saveData(); renderGradebook(); closeModal('modalAssignment');
    }
}

function deleteAssignment(id) {
    if(confirm("¿Eliminar columna y notas asociadas?")) {
        app.assignments = app.assignments.filter(a => a.id !== id);
        // Limpiar notas huerfanas (opcional pero recomendado)
        // ...
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
    // HEADERS CON BOTONES DE EDICIÓN
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
    // Llenar select
    const sel = document.getElementById('planClass');
    sel.innerHTML = '<option value="">-- Clase --</option>';
    app.classes.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    
    // Reset Checkbox
    document.getElementById('planLinkToGradebook').checked = false;

    if(editId) {
        // MODO EDICION
        const p = app.planning.find(x => x.id === editId);
        document.getElementById('planEditId').value = p.id;
        document.getElementById('planTitle').value = p.title;
        document.getElementById('planDate').value = p.date;
        document.getElementById('planTag').value = p.tag;
        document.getElementById('planClass').value = p.classId;
        document.getElementById('planDesc').value = p.desc;
        // Ocultar smart link en edición para no duplicar
        document.querySelector('.smart-link-box').style.display = 'none';
    } else {
        // MODO NUEVO
        document.getElementById('planEditId').value = "";
        document.getElementById('planTitle').value = "";
        document.getElementById('planDate').value = "";
        document.getElementById('planTag').value = "";
        document.getElementById('planDesc').value = "";
        document.querySelector('.smart-link-box').style.display = 'block';
    }
}

// Detectar palabras clave
function checkSmartKeywords() {
    const val = document.getElementById('planTitle').value.toLowerCase();
    const keywords = ["examen", "prueba", "test", "entrega", "proyecto", "quiz", "evaluacion", "evaluación"];
    const found = keywords.some(k => val.includes(k));
    
    // Si encuentra palabra clave, marca el checkbox automáticamente
    if(found) {
        document.getElementById('planLinkToGradebook').checked = true;
    }
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
            // Update
            const idx = app.planning.findIndex(p => p.id === id);
            if(idx > -1) {
                app.planning[idx] = { ...app.planning[idx], title, date, tag, classId: cid, desc };
            }
        } else {
            // New
            app.planning.push({ id: Date.now().toString(), title, date, tag: tag||"Evento", classId: cid, desc });
            
            // LOGICA SMART LINK: Si está marcado, crea la columna
            if(linkToGb) {
                // Confirmamos por si acaso
                if(confirm(`¿Crear también la columna "${title}" en el Gradebook?`)) {
                    app.assignments.push({ 
                        id: Date.now().toString() + "_lnk", // ID distinto
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

// ================= RESTO DE FUNCIONES (ALUMNOS, HORARIO...) =================
function addStudent() {
    const name = document.getElementById('newStudName').value; const cid = document.getElementById('newStudClass').value;
    if(name && cid) { app.students.push({ id: Date.now().toString(), name, classId: cid, points: 0 }); saveData(); renderStudents(); closeModal('modalStudent'); }
}
function renderStudents() {
    const cid = document.getElementById('filterStudentClass').value;
    const t = document.getElementById('studentsTable');
    let d = app.students; if(cid) d = d.filter(s => s.classId == cid);
    let h = `<table><thead><tr><th>Nombre</th><th>XP</th><th>X</th></tr></thead><tbody>`;
    d.forEach(s => h += `<tr><td>${s.name}</td><td>⭐ ${s.points}</td><td><button onclick="deleteStud('${s.id}')" class="btn-flat" style="color:red">×</button></td></tr>`);
    t.innerHTML = h + `</tbody></table>`;
}
function deleteStud(id) { if(confirm("Borrar?")) { app.students = app.students.filter(s => s.id !== id); saveData(); renderStudents(); } }

function renderDashboard() {
    // Schedule
    const g = document.getElementById('dashSchedule'); g.innerHTML='';
    ["Lunes","Martes","Miércoles","Jueves","Viernes"].forEach(d => {
        let h = `<div class="day-col"><b>${d}</b>`;
        app.schedule.filter(s => s.day==d).sort((a,b)=>a.start.localeCompare(b.start)).forEach(i => {
            const c = app.classes.find(x=>x.id==i.classId);
            h += `<div class="sch-item" style="border-left-color:${c?c.color:'#ccc'}"><small>${i.start}</small><br>${c?c.name:'?'}</div>`;
        });
        g.innerHTML += h + `</div>`;
    });
    // Top Students
    const ts = document.getElementById('dashTopStudents'); ts.innerHTML='';
    [...app.students].sort((a,b)=>(b.points||0)-(a.points||0)).slice(0,5).forEach(s => {
        ts.innerHTML += `<div>🥇 <b>${s.name}</b> (${s.points})</div>`;
    });
    // Planner
    const pl = document.getElementById('dashPlannerList'); pl.innerHTML='';
    app.planning.slice(0,5).forEach(p => pl.innerHTML += `<div>📌 <b>${p.title}</b> (${p.date})</div>`);
}

function addScheduleItem() {
    const day = document.getElementById('schDay').value; const cid = document.getElementById('schClass').value;
    const start = document.getElementById('schStart').value; const end = document.getElementById('schEnd').value;
    if(cid && start) { app.schedule.push({id:Date.now().toString(), day, classId:cid, start, end}); saveData(); renderDashboard(); closeModal('modalSchedule'); }
}
function openScheduleEditor() { openModal('modalSchedule'); const s = document.getElementById('schClass'); s.innerHTML=''; app.classes.forEach(c=>s.innerHTML+=`<option value="${c.id}">${c.name}</option>`); }

// VISTAS CLASE
function renderClassStudentGrid() {
    const g = document.getElementById('classStudentGrid'); g.innerHTML='';
    app.students.filter(s => s.classId == currentClassId).forEach(s => {
        g.innerHTML += `<div class="student-card"><b>${s.name}</b><br><span style="color:#d97706">⭐ ${s.points}</span><br>
        <button class="btn-icon" onclick="givePoints('${s.id}',1)">+</button><button class="btn-icon" onclick="givePoints('${s.id}',-1)">-</button></div>`;
    });
}
function givePoints(id, v) { const s = app.students.find(x=>x.id==id); if(s){ s.points += v; saveData(); renderClassStudentGrid(); } }
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