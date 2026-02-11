// ESTRUCTURA DE DATOS
let appData = {
    classes: [], 
    students: [], 
    tasks: [], 
    anecdotes: [] // { id, classId, studentId, text, importance, date }
};
let currentClassId = null;

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    loadLocal();
    nav('dashboard');
});

function nav(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-menu button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`view-${viewId}`).classList.add('active');
    const btn = document.getElementById(`nav-${viewId}`);
    if(btn) btn.classList.add('active');

    if(viewId === 'classes') renderClasses();
    if(viewId === 'notebook') renderGlobalNotebook();
    if(viewId === 'dashboard') updateDashboard();
}

// ================= GESTIÓN DE CLASES =================

function renderClasses() {
    const grid = document.getElementById('classesGrid'); 
    grid.innerHTML = '';
    appData.classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `<h3>${c.name}</h3><small>${getStudentCount(c.id)} Alumnos</small>`;
        card.onclick = () => openClassDetail(c.id);
        grid.appendChild(card);
    });
}

function getStudentCount(cid) { return appData.students.filter(s => s.classId == cid).length; }

function openClassDetail(id) {
    currentClassId = id;
    const c = appData.classes.find(x => x.id == id);
    document.getElementById('detailTitle').innerText = c.name;
    nav('class-detail');
    
    // Rellenar select de alumnos en la pestaña Bitácora
    const sel = document.getElementById('classAnecStudent');
    sel.innerHTML = '<option value="">-- Seleccionar Alumno --</option>';
    appData.students.filter(s => s.classId == id).forEach(s => {
        sel.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });

    renderStudents();
    renderClassLogbook(); // IMPORTANTE: Cargar la bitácora al abrir
    renderClassPlanning();
    openClassTab('tab-mgmt'); // Abrir pestaña por defecto
}

function openClassTab(tabId) {
    document.querySelectorAll('.class-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    // Encontrar el botón que llamó a esta función (si existe) y activarlo
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        if(btn.getAttribute('onclick').includes(tabId)) btn.classList.add('active');
    });
}

// ================= BITÁCORA (LOGBOOK) DENTRO DE LA CLASE =================

// 1. RENDERIZAR LA LISTA
function renderClassLogbook() {
    const list = document.getElementById('classLogbookList');
    list.innerHTML = '';
    
    // Filtrar anécdotas SOLO de esta clase
    const logs = appData.anecdotes.filter(a => a.classId == currentClassId).reverse();

    if(logs.length === 0) {
        list.innerHTML = '<p style="color:#888; text-align:center;">No hay entradas en la bitácora aún.</p>';
        return;
    }

    logs.forEach(a => {
        const s = appData.students.find(stu => stu.id == a.studentId);
        const sName = s ? s.name : 'Alumno Eliminado';
        
        list.innerHTML += `
            <div class="anecdote-item ${a.importance}">
                <div style="flex:1">
                    <strong>${sName}</strong> <small>(${a.date})</small><br>
                    <span>${a.text}</span>
                </div>
                <div>
                    <button class="btn-act edit" onclick="fillClassAnecdoteForm(${a.id})">✏️</button>
                    <button class="btn-act del" onclick="deleteAnecdote(${a.id})">🗑️</button>
                </div>
            </div>
        `;
    });
}

// 2. RELLENAR FORMULARIO PARA EDITAR (Sin salir de la pantalla)
function fillClassAnecdoteForm(anecId) {
    const anecdote = appData.anecdotes.find(a => a.id == anecId);
    if (!anecdote) return;

    // Poner valores en los inputs
    document.getElementById('classAnecStudent').value = anecdote.studentId;
    document.getElementById('classAnecImp').value = anecdote.importance;
    document.getElementById('classAnecText').value = anecdote.text;
    
    // Guardar el ID que estamos editando en el input oculto
    document.getElementById('editClassAnecId').value = anecdote.id;

    // Cambiar texto de botones
    document.getElementById('btnSaveClassAnec').innerHTML = '🔄 Actualizar Entrada';
    document.getElementById('btnSaveClassAnec').classList.replace('btn-primary', 'btn-warning');
    document.getElementById('btnCancelClassAnec').style.display = 'inline-block';

    // Scroll suave hacia arriba para ver el formulario
    document.getElementById('tab-logbook').scrollIntoView({ behavior: 'smooth' });
}

// 3. GUARDAR (CREAR O EDITAR)
function saveClassAnecdote() {
    const studentId = document.getElementById('classAnecStudent').value;
    const text = document.getElementById('classAnecText').value;
    const importance = document.getElementById('classAnecImp').value;
    const editId = document.getElementById('editClassAnecId').value; // Recuperar ID si estamos editando

    if (!studentId || !text) return alert("Selecciona alumno y escribe texto.");

    if (editId) {
        // MODO EDICIÓN: Buscar y actualizar
        const index = appData.anecdotes.findIndex(a => a.id == editId);
        if (index !== -1) {
            appData.anecdotes[index].studentId = studentId;
            appData.anecdotes[index].text = text;
            appData.anecdotes[index].importance = importance;
        }
    } else {
        // MODO CREACIÓN: Nueva entrada
        appData.anecdotes.push({
            id: Date.now(),
            classId: currentClassId,
            studentId: studentId,
            text: text,
            importance: importance,
            date: new Date().toLocaleDateString()
        });
    }

    saveLocal();
    cancelClassAnecEdit(); // Limpiar formulario y restaurar botones
    renderClassLogbook();  // Refrescar la lista inmediatamente
}

// 4. CANCELAR EDICIÓN
function cancelClassAnecEdit() {
    document.getElementById('classAnecStudent').value = "";
    document.getElementById('classAnecText').value = "";
    document.getElementById('editClassAnecId').value = ""; // Limpiar ID oculto
    
    document.getElementById('btnSaveClassAnec').innerHTML = '💾 Guardar Entrada';
    document.getElementById('btnSaveClassAnec').classList.remove('btn-warning');
    document.getElementById('btnSaveClassAnec').classList.add('btn-primary');
    document.getElementById('btnCancelClassAnec').style.display = 'none';
}

function deleteAnecdote(id) {
    if(confirm('¿Borrar esta entrada?')) {
        appData.anecdotes = appData.anecdotes.filter(a => a.id != id);
        saveLocal();
        renderClassLogbook(); // Refrescar lista clase
        renderGlobalNotebook(); // Refrescar lista global por si acaso
    }
}

// ================= OTROS DE LA CLASE =================
function renderStudents() {
    const list = document.getElementById('studentsList');
    list.innerHTML = '';
    appData.students.filter(s => s.classId == currentClassId).forEach(s => {
        list.innerHTML += `
        <div class="student-card" onclick="toggleSelect(this)">
            <b>${s.name}</b><br>
            <span style="color:var(--primary)">${s.points} pts</span>
        </div>`;
    });
}

function applyPoints(pts) {
    // Lógica simplificada para demo
    alert(`Se aplicarían ${pts} puntos (demo)`);
}

function renderClassPlanning() {
    const list = document.getElementById('classWeeklyPlanList');
    list.innerHTML = '';
    const tasks = appData.tasks.filter(t => t.classId == currentClassId);
    if(!tasks.length) list.innerHTML = '<small>Sin tareas</small>';
    tasks.forEach(t => list.innerHTML += `<div style="padding:10px; border-bottom:1px solid #eee">${t.title} (${t.date})</div>`);
}

function deleteCurrentClass() {
    if(confirm('¿Borrar clase?')) {
        appData.classes = appData.classes.filter(c => c.id != currentClassId);
        saveLocal();
        nav('classes');
    }
}

// ================= NOTEBOOK GLOBAL =================
function renderGlobalNotebook() {
    // Render Anecdotas Globales
    const alist = document.getElementById('notebookAnecdotesList');
    alist.innerHTML = '';
    appData.anecdotes.forEach(a => {
        const c = appData.classes.find(cl => cl.id == a.classId);
        alist.innerHTML += `<div class="anecdote-item ${a.importance}"><b>${c?c.name:'?'}</b>: ${a.text}</div>`;
    });
    
    // Select Tareas
    const tSel = document.getElementById('taskClass');
    tSel.innerHTML = '';
    appData.classes.forEach(c => tSel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    
    // Lista Tareas
    const tlist = document.getElementById('tasksList');
    tlist.innerHTML = '';
    appData.tasks.forEach(t => tlist.innerHTML += `<div class="anecdote-item">${t.title}</div>`);
}

function addTask() {
    const title = document.getElementById('taskTitle').value;
    const cid = document.getElementById('taskClass').value;
    const date = document.getElementById('taskDate').value;
    if(title && cid) {
        appData.tasks.push({id:Date.now(), title, classId:cid, date});
        saveLocal(); renderGlobalNotebook();
    }
}

// ================= MODALES Y DATA =================
function openClassModal() { document.getElementById('modalClass').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function saveClass() {
    const name = document.getElementById('modalClassName').value;
    if(name) {
        const newId = Date.now();
        appData.classes.push({ id: newId, name: name });
        
        // Crear alumnos de prueba automáticamente
        appData.students.push({id: Date.now()+1, classId: newId, name: 'Juan Pérez', points: 0});
        appData.students.push({id: Date.now()+2, classId: newId, name: 'Ana Gómez', points: 0});
        
        saveLocal();
        renderClasses();
        closeModal('modalClass');
    }
}

// ================= PERSISTENCIA =================
function saveLocal() { localStorage.setItem('TeacherAppFixed', JSON.stringify(appData)); }
function loadLocal() {
    const d = localStorage.getItem('TeacherAppFixed');
    if(d) appData = JSON.parse(d);
    else {
        // Datos demo si está vacío
        appData.classes = [{id:1, name:'Ciencias 101'}];
        appData.students = [{id:101, classId:1, name:'Demo Alumno', points:10}];
    }
}

// DASHBOARD
function updateDashboard() {
    const alerts = document.getElementById('dash-alerts');
    alerts.innerHTML = '';
    appData.anecdotes.filter(a => a.importance === 'high').forEach(a => {
        alerts.innerHTML += `<div style="color:red; margin-bottom:5px;">⚠️ ${a.text}</div>`;
    });
}