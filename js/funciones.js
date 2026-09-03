/* =========================================================================
   VETERINARIA SAN MARCOS
   Módulo: Usuarios, Autenticación y Panel de Administración (RBAC)
   Autor: Oscar (rama "Oscar")

   NOTA TÉCNICA:
   Esta es la etapa de maquetación (HTML/CSS/JS) del proyecto. Como el
   backend definitivo será Spring Boot + MySQL vía API REST (según el
   stack obligatorio del caso), aquí se simula la persistencia con
   localStorage para poder demostrar el comportamiento real de las
   pantallas (login, roles, citas, fichas clínicas) sin depender del
   servicio aún. Toda esta capa está aislada en las funciones que
   empiezan con "db" para que sea fácil reemplazarla por llamadas
   fetch()/axios a la API cuando el backend esté disponible.
   ========================================================================= */

const CLAVES = {
    USUARIOS: 'sanmarcos_usuarios',
    SESION: 'sanmarcos_sesion',
    CITAS: 'sanmarcos_citas',
    PACIENTES: 'sanmarcos_pacientes'
};

/* =========================================================================
   0. CAPA DE DATOS SIMULADA (reemplazable por API REST más adelante)
   ========================================================================= */

function dbLeer(clave) {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
}

function dbGuardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function inicializarDatosDemo() {
    // Usuarios base: 1 administrador y 1 recepcionista ya existen
    // (el administrador se crea a nivel de sistema, no por auto-registro).
    if (!dbLeer(CLAVES.USUARIOS)) {
        dbGuardar(CLAVES.USUARIOS, [
            { id: 1, nombre: 'Constanza Rivas', rut: '11111111-1', email: 'admin@sanmarcos.cl', rol: 'ADMINISTRADOR', password: 'Admin2026', activo: true },
            { id: 2, nombre: 'Pablo Herrera', rut: '22222222-2', email: 'recepcion@sanmarcos.cl', rol: 'RECEPCIONISTA', password: 'Recepcion2026', activo: true },
            { id: 3, nombre: 'Dra. Javiera Muñoz', rut: '33333333-3', email: 'veterinario@sanmarcos.cl', rol: 'VETERINARIO', password: 'Vet2026a', activo: true }
        ]);
    }

    // Citas "guardadas por el módulo de Kevin" (solicitudes de dueños),
    // pendientes de confirmación por recepción.
    if (!dbLeer(CLAVES.CITAS)) {
        dbGuardar(CLAVES.CITAS, [
            { id: 1, duenoNombre: 'Juan Pérez', duenoRut: '19011022-K', mascota: 'Fuchy', motivo: 'Control de peso', fecha: '2026-09-10T10:00', estado: 'PENDIENTE' },
            { id: 2, duenoNombre: 'María Soto', duenoRut: '18222333-4', mascota: 'Pelusa', motivo: 'Vacunación', fecha: '2026-09-10T11:30', estado: 'PENDIENTE' },
            { id: 3, duenoNombre: 'Ricardo Vega', duenoRut: '17555666-7', mascota: 'Toby', motivo: 'Consulta general', fecha: '2026-09-11T09:15', estado: 'CONFIRMADA' }
        ]);
    }

    // Fichas clínicas de pacientes (mascotas).
    if (!dbLeer(CLAVES.PACIENTES)) {
        dbGuardar(CLAVES.PACIENTES, [
            {
                id: 1,
                nombreMascota: 'Fuchy',
                especie: 'Perro',
                raza: 'Mestizo',
                fechaNacimiento: '2021-04-12',
                duenoNombre: 'Juan Pérez',
                duenoRut: '19011022-K',
                diagnosticos: [
                    { fecha: '2026-06-02', motivo: 'Control de peso', diagnostico: 'Sobrepeso leve', tratamiento: 'Dieta controlada', medicamento: '—', dosis: null }
                ],
                vacunas: [
                    { nombre: 'Séxtuple canina', fechaAplicacion: '2026-03-01', fechaVencimiento: '2027-03-01' }
                ]
            },
            {
                id: 2,
                nombreMascota: 'Pelusa',
                especie: 'Gato',
                raza: 'Común europeo',
                fechaNacimiento: '2022-11-05',
                duenoNombre: 'María Soto',
                duenoRut: '18222333-4',
                diagnosticos: [],
                vacunas: [
                    { nombre: 'Antirrábica', fechaAplicacion: '2025-09-15', fechaVencimiento: '2026-09-15' }
                ]
            }
        ]);
    }
}

/* =========================================================================
   1. UTILIDADES DE VALIDACIÓN
   ========================================================================= */

// Algoritmo de verificación de dígito verificador de RUT chileno.
function validarRut(rut) {
    if (!rut) return false;
    rut = rut.replace(/\./g, '').replace('-', '').trim().toUpperCase();
    if (rut.length < 8) return false;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    if (!/^[0-9]+$/.test(cuerpo)) return false;

    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalc = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    return dv === dvCalc;
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Mínimo 8 caracteres, al menos una letra y un número.
function validarPassword(pass) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pass);
}

function marcarCampo($campo, esValido) {
    $campo.removeClass('is-invalid is-valid');
    $campo.addClass(esValido ? 'is-valid' : 'is-invalid');
}

function mostrarAviso(selectorContenedor, tipo, mensaje) {
    const icono = tipo === 'exito' ? 'bi-check-circle' : tipo === 'alerta' ? 'bi-exclamation-triangle' : 'bi-x-circle';
    $(selectorContenedor).html(
        `<div class="aviso aviso-${tipo}"><i class="bi ${icono}"></i><span>${mensaje}</span></div>`
    );
}

/* =========================================================================
   2. SESIÓN Y CONTROL DE ACCESO POR ROL (RBAC)
   ========================================================================= */

function obtenerSesion() {
    return dbLeer(CLAVES.SESION);
}

function iniciarSesion(usuario) {
    dbGuardar(CLAVES.SESION, {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
    });
}

function cerrarSesion() {
    localStorage.removeItem(CLAVES.SESION);
    window.location.href = 'login.html';
}

// Regla del caso: "ninguna vista debe estar accesible sin autenticación,
// excepto login y registro". Se invoca al inicio de cada vista protegida.
function protegerRuta(rolesPermitidos) {
    const sesion = obtenerSesion();

    if (!sesion) {
        window.location.href = 'login.html?motivo=sesion';
        return null;
    }

    if (rolesPermitidos && rolesPermitidos.length && !rolesPermitidos.includes(sesion.rol)) {
        window.location.href = 'login.html?motivo=rol';
        return null;
    }

    return sesion;
}

// Pinta nombre, rol y botón de salir en la barra de navegación,
// y oculta secciones que no correspondan al rol (RBAC visual).
function pintarBarraSesion(sesion) {
    $('#nombreUsuarioActivo').text(sesion.nombre);
    $('#chipRolActivo').text(formatearRol(sesion.rol));

    if (sesion.rol !== 'ADMINISTRADOR') {
        $('.solo-administrador').addClass('d-none');
    }
}

function formatearRol(rol) {
    const nombres = {
        ADMINISTRADOR: 'Administrador',
        RECEPCIONISTA: 'Recepcionista',
        VETERINARIO: 'Médico veterinario',
        DUENO: 'Dueño de mascota'
    };
    return nombres[rol] || rol;
}

/* =========================================================================
   3. LOGIN Y REGISTRO
   ========================================================================= */

function manejarLogin() {
    const email = $('#loginEmail').val().trim();
    const pass = $('#loginPass').val();
    const $email = $('#loginEmail');
    const $pass = $('#loginPass');

    marcarCampo($email, validarEmail(email));
    marcarCampo($pass, !!pass);

    if (!email || !pass) {
        mostrarAviso('#resultado-validacion', 'error', 'Ingresa tu correo y contraseña para continuar.');
        return;
    }
    if (!validarEmail(email)) {
        mostrarAviso('#resultado-validacion', 'error', 'El formato del correo no es válido.');
        return;
    }

    const usuarios = dbLeer(CLAVES.USUARIOS) || [];
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!usuario || usuario.password !== pass) {
        mostrarAviso('#resultado-validacion', 'error', 'Correo o contraseña incorrectos.');
        return;
    }
    if (!usuario.activo) {
        mostrarAviso('#resultado-validacion', 'error', 'Esta cuenta está desactivada. Contacta al administrador del sistema.');
        return;
    }

    iniciarSesion(usuario);
    mostrarAviso('#resultado-validacion', 'exito', `Bienvenido/a, ${usuario.nombre}. Redirigiendo...`);

    setTimeout(() => {
        // Dueños de mascota no acceden al panel interno; el resto sí.
        window.location.href = usuario.rol === 'DUENO' ? 'login.html?motivo=rol-dueno' : 'admin.html';
    }, 900);
}

function manejarRegistro() {
    const nombre = $('#regNombre').val().trim();
    const rut = $('#regRut').val().trim();
    const email = $('#regEmail').val().trim();
    const rol = $('#regRol').val();
    const pass = $('#regPass').val();
    const passConfirm = $('#regPassConfirm').val();

    marcarCampo($('#regNombre'), !!nombre);
    marcarCampo($('#regRut'), validarRut(rut));
    marcarCampo($('#regEmail'), validarEmail(email));
    marcarCampo($('#regRol'), !!rol);
    marcarCampo($('#regPass'), validarPassword(pass));
    marcarCampo($('#regPassConfirm'), !!passConfirm && passConfirm === pass);

    if (!nombre || !rut || !email || !rol || !pass || !passConfirm) {
        mostrarAviso('#resultado-validacion-registro', 'error', 'Todos los campos son obligatorios.');
        return;
    }
    if (!validarRut(rut)) {
        mostrarAviso('#resultado-validacion-registro', 'error', 'El RUT ingresado no es válido (ej: 12345678-9).');
        return;
    }
    if (!validarEmail(email)) {
        mostrarAviso('#resultado-validacion-registro', 'error', 'Ingresa un correo electrónico válido.');
        return;
    }

    const usuarios = dbLeer(CLAVES.USUARIOS) || [];
    if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        mostrarAviso('#resultado-validacion-registro', 'error', 'Ya existe una cuenta registrada con ese correo.');
        return;
    }
    if (usuarios.some(u => u.rut.toUpperCase() === rut.toUpperCase())) {
        mostrarAviso('#resultado-validacion-registro', 'error', 'Ya existe una cuenta registrada con ese RUT.');
        return;
    }
    if (!validarPassword(pass)) {
        mostrarAviso('#resultado-validacion-registro', 'alerta', 'La contraseña debe tener mínimo 8 caracteres, con letras y números.');
        return;
    }
    if (pass !== passConfirm) {
        mostrarAviso('#resultado-validacion-registro', 'error', 'Las contraseñas no coinciden.');
        return;
    }

    const nuevoUsuario = {
        id: Date.now(),
        nombre, rut, email, rol,
        password: pass,
        activo: true
    };

    usuarios.push(nuevoUsuario);
    dbGuardar(CLAVES.USUARIOS, usuarios);

    mostrarAviso('#resultado-validacion-registro', 'exito', 'Cuenta creada correctamente. Redirigiendo al inicio de sesión...');
    setTimeout(() => { window.location.href = 'login.html'; }, 1400);
}

function resetearRegistro() {
    if (!$('#formularioRegistro').length) return;

    // Se limpia cada campo de forma explícita (en vez de depender solo de
    // form.reset(), que en algunos navegadores no sobreescribe valores
    // rellenados por autocompletado).
    $('#regNombre, #regRut, #regEmail, #regPass, #regPassConfirm').val('');
    $('#regRol').val('');

    $('#formularioRegistro .form-control, #formularioRegistro .form-select').removeClass('is-valid is-invalid');
    $('#resultado-validacion-registro').html('');
    $('#regNombre').trigger('focus');
}

// Muestra un aviso en login.html cuando llega redirigido desde una ruta protegida.
function revisarMotivoRedireccion() {
    const params = new URLSearchParams(window.location.search);
    const motivo = params.get('motivo');
    if (!motivo) return;

    const mensajes = {
        sesion: ['alerta', 'Debes iniciar sesión para acceder a esa página.'],
        rol: ['error', 'Tu cuenta no tiene permisos para acceder a esa sección.'],
        'rol-dueno': ['alerta', 'Sesión iniciada. El panel interno es solo para personal de la clínica; el portal de dueños se encuentra en otro módulo del sistema.']
    };
    const [tipo, texto] = mensajes[motivo] || [];
    if (texto) mostrarAviso('#resultado-validacion', tipo, texto);
}

/* =========================================================================
   4. PANEL DE ADMINISTRACIÓN / RECEPCIÓN — GESTIÓN DE CITAS
   ========================================================================= */

function cargarCitas() {
    const citas = (dbLeer(CLAVES.CITAS) || []).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const $tabla = $('#tablaCitas');

    if (!citas.length) {
        $tabla.html('');
        $('#citasVacio').removeClass('d-none');
        return;
    }
    $('#citasVacio').addClass('d-none');

    const badges = { PENDIENTE: 'badge-pendiente', CONFIRMADA: 'badge-confirmada', REAGENDADA: 'badge-reagendada' };
    const etiquetas = { PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', REAGENDADA: 'Reagendada' };

    let html = '';
    citas.forEach(c => {
        const fecha = new Date(c.fecha);
        const fechaTexto = isNaN(fecha) ? c.fecha : fecha.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
        html += `
            <tr>
                <td>${c.duenoNombre}<br><small class="text-muted">${c.duenoRut}</small></td>
                <td>${c.mascota}</td>
                <td>${c.motivo || '—'}</td>
                <td>${fechaTexto}</td>
                <td><span class="badge-estado ${badges[c.estado] || 'badge-pendiente'}">${etiquetas[c.estado] || c.estado}</span></td>
                <td class="text-nowrap">
                    <button class="btn btn-sm btn-primario me-1" onclick="confirmarCita(${c.id})" ${c.estado === 'CONFIRMADA' ? 'disabled' : ''}>
                        <i class="bi bi-check-lg"></i> Confirmar
                    </button>
                    <button class="btn btn-sm btn-secundario" onclick="reagendarCita(${c.id})">
                        <i class="bi bi-clock-history"></i> Reagendar
                    </button>
                </td>
            </tr>`;
    });
    $tabla.html(html);
}

function confirmarCita(id) {
    const citas = dbLeer(CLAVES.CITAS) || [];
    const cita = citas.find(c => c.id === id);
    if (!cita) return;
    cita.estado = 'CONFIRMADA';
    dbGuardar(CLAVES.CITAS, citas);
    cargarCitas();
}

function reagendarCita(id) {
    const citas = dbLeer(CLAVES.CITAS) || [];
    const cita = citas.find(c => c.id === id);
    if (!cita) return;

    const nuevaFecha = prompt('Nueva fecha y hora (AAAA-MM-DDTHH:MM):', cita.fecha);
    if (!nuevaFecha) return;

    if (isNaN(new Date(nuevaFecha).getTime())) {
        alert('El formato de fecha ingresado no es válido.');
        return;
    }

    cita.fecha = nuevaFecha;
    cita.estado = 'REAGENDADA';
    dbGuardar(CLAVES.CITAS, citas);
    cargarCitas();
}

/* =========================================================================
   5. PANEL DE ADMINISTRACIÓN — GESTIÓN DE USUARIOS (solo Administrador)
   ========================================================================= */

function cargarUsuarios() {
    if (!$('#tablaUsuarios').length) return;

    const usuarios = dbLeer(CLAVES.USUARIOS) || [];
    let html = '';
    usuarios.forEach(u => {
        html += `
            <tr>
                <td>${u.nombre}<br><small class="text-muted">${u.email}</small></td>
                <td>${u.rut}</td>
                <td>
                    <select class="form-select form-select-sm" style="min-width:170px" onchange="actualizarRolUsuario(${u.id}, this.value)">
                        ${['ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO', 'DUENO'].map(r =>
                            `<option value="${r}" ${u.rol === r ? 'selected' : ''}>${formatearRol(r)}</option>`
                        ).join('')}
                    </select>
                </td>
                <td><span class="badge-estado ${u.activo ? 'badge-activo' : 'badge-inactivo'}">${u.activo ? 'Activo' : 'Desactivado'}</span></td>
                <td>
                    <button class="btn btn-sm btn-peligro-out" onclick="toggleActivoUsuario(${u.id})">
                        <i class="bi ${u.activo ? 'bi-slash-circle' : 'bi-arrow-counterclockwise'}"></i>
                        ${u.activo ? 'Desactivar' : 'Reactivar'}
                    </button>
                </td>
            </tr>`;
    });
    $('#tablaUsuarios').html(html);
}

function actualizarRolUsuario(id, nuevoRol) {
    const usuarios = dbLeer(CLAVES.USUARIOS) || [];
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;
    usuario.rol = nuevoRol;
    dbGuardar(CLAVES.USUARIOS, usuarios);
    cargarUsuarios();
}

function toggleActivoUsuario(id) {
    const usuarios = dbLeer(CLAVES.USUARIOS) || [];
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;
    usuario.activo = !usuario.activo;
    dbGuardar(CLAVES.USUARIOS, usuarios);
    cargarUsuarios();
}

/* =========================================================================
   6. FICHAS CLÍNICAS DE PACIENTES
   ========================================================================= */

let pacienteSeleccionadoId = null;

function calcularEstadoVacuna(fechaVencimiento) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const venc = new Date(fechaVencimiento + 'T00:00:00');
    const diasRestantes = Math.round((venc - hoy) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) return { clase: 'badge-vencida', texto: 'Vencida' };
    if (diasRestantes <= 30) return { clase: 'badge-por-vencer', texto: `Vence en ${diasRestantes} días` };
    return { clase: 'badge-vigente', texto: 'Vigente' };
}

function cargarPacientes(filtro) {
    const pacientes = dbLeer(CLAVES.PACIENTES) || [];
    const texto = (filtro || '').trim().toLowerCase();

    const filtrados = texto
        ? pacientes.filter(p =>
            p.nombreMascota.toLowerCase().includes(texto) ||
            p.duenoNombre.toLowerCase().includes(texto) ||
            p.duenoRut.toLowerCase().includes(texto.replace(/\./g, '')))
        : pacientes;

    const $lista = $('#listaPacientes');
    if (!filtrados.length) {
        $lista.html('<div class="estado-vacio"><i class="bi bi-search"></i>No se encontraron pacientes con ese criterio.</div>');
        return;
    }

    let html = '';
    filtrados.forEach(p => {
        const activo = p.id === pacienteSeleccionadoId ? 'active' : '';
        html += `
            <button type="button" class="list-group-item list-group-item-action ${activo}" onclick="seleccionarPaciente(${p.id})">
                <div class="d-flex justify-content-between">
                    <strong>${p.nombreMascota}</strong>
                    <small class="text-muted">${p.especie}</small>
                </div>
                <small class="text-muted">${p.duenoNombre} · ${p.duenoRut}</small>
            </button>`;
    });
    $lista.html(html);
}

function seleccionarPaciente(id) {
    pacienteSeleccionadoId = id;
    const paciente = (dbLeer(CLAVES.PACIENTES) || []).find(p => p.id === id);
    if (!paciente) return;

    $('#panelPacienteVacio').addClass('d-none');
    $('#panelPacienteDatos').removeClass('d-none');

    $('#fpNombreMascota').val(paciente.nombreMascota);
    $('#fpEspecie').val(paciente.especie);
    $('#fpRaza').val(paciente.raza);
    $('#fpFechaNacimiento').val(paciente.fechaNacimiento);
    $('#fpDuenoNombre').val(paciente.duenoNombre);
    $('#fpDuenoRut').val(paciente.duenoRut);
    $('#nombreMascotaPanel').text(paciente.nombreMascota);

    renderizarDiagnosticos(paciente);
    renderizarVacunas(paciente);
    cargarPacientes($('#buscarPaciente').val());
}

function nuevoPaciente() {
    pacienteSeleccionadoId = null;
    $('#formDatosPaciente')[0].reset();
    $('#panelPacienteVacio').addClass('d-none');
    $('#panelPacienteDatos').removeClass('d-none');
    $('#nombreMascotaPanel').text('Nuevo paciente');
    $('#tablaDiagnosticos').html('<tr><td colspan="4" class="text-muted text-center">Guarda los datos del paciente antes de registrar un diagnóstico.</td></tr>');
    $('#tablaVacunas').html('<tr><td colspan="3" class="text-muted text-center">Guarda los datos del paciente antes de registrar vacunas.</td></tr>');
    cargarPacientes($('#buscarPaciente').val());
}

function guardarDatosPaciente() {
    const nombreMascota = $('#fpNombreMascota').val().trim();
    const especie = $('#fpEspecie').val();
    const raza = $('#fpRaza').val().trim();
    const fechaNacimiento = $('#fpFechaNacimiento').val();
    const duenoNombre = $('#fpDuenoNombre').val().trim();
    const duenoRut = $('#fpDuenoRut').val().trim();

    marcarCampo($('#fpNombreMascota'), !!nombreMascota);
    marcarCampo($('#fpEspecie'), !!especie);
    marcarCampo($('#fpDuenoNombre'), !!duenoNombre);
    marcarCampo($('#fpDuenoRut'), validarRut(duenoRut));

    if (!nombreMascota || !especie || !duenoNombre || !duenoRut) {
        mostrarAviso('#resultado-validacion-ficha', 'error', 'Nombre de la mascota, especie, dueño y RUT son obligatorios.');
        return;
    }
    if (!validarRut(duenoRut)) {
        mostrarAviso('#resultado-validacion-ficha', 'error', 'El RUT del dueño no es válido (ej: 12345678-9).');
        return;
    }
    if (fechaNacimiento && new Date(fechaNacimiento) > new Date()) {
        mostrarAviso('#resultado-validacion-ficha', 'error', 'La fecha de nacimiento no puede ser futura.');
        return;
    }

    const pacientes = dbLeer(CLAVES.PACIENTES) || [];

    if (pacienteSeleccionadoId) {
        const paciente = pacientes.find(p => p.id === pacienteSeleccionadoId);
        Object.assign(paciente, { nombreMascota, especie, raza, fechaNacimiento, duenoNombre, duenoRut });
    } else {
        const nuevo = {
            id: Date.now(),
            nombreMascota, especie, raza, fechaNacimiento, duenoNombre, duenoRut,
            diagnosticos: [], vacunas: []
        };
        pacientes.push(nuevo);
        pacienteSeleccionadoId = nuevo.id;
    }

    dbGuardar(CLAVES.PACIENTES, pacientes);
    mostrarAviso('#resultado-validacion-ficha', 'exito', 'Ficha del paciente guardada correctamente.');
    $('#nombreMascotaPanel').text(nombreMascota);
    seleccionarPaciente(pacienteSeleccionadoId);
}

function renderizarDiagnosticos(paciente) {
    if (!paciente.diagnosticos.length) {
        $('#tablaDiagnosticos').html('<tr><td colspan="4" class="text-muted text-center">Sin diagnósticos registrados aún.</td></tr>');
        return;
    }
    let html = '';
    [...paciente.diagnosticos].reverse().forEach(d => {
        html += `
            <tr>
                <td>${d.fecha}</td>
                <td>${d.diagnostico}<br><small class="text-muted">${d.motivo || ''}</small></td>
                <td>${d.tratamiento || '—'}</td>
                <td>${d.medicamento && d.medicamento !== '—' ? `${d.medicamento} (${d.dosis} ml/mg)` : '—'}</td>
            </tr>`;
    });
    $('#tablaDiagnosticos').html(html);
}

function agregarDiagnostico() {
    if (!pacienteSeleccionadoId) {
        mostrarAviso('#resultado-validacion-diagnostico', 'error', 'Primero guarda o selecciona un paciente.');
        return;
    }

    const fecha = $('#dxFecha').val();
    const motivo = $('#dxMotivo').val().trim();
    const diagnostico = $('#dxDiagnostico').val().trim();
    const tratamiento = $('#dxTratamiento').val().trim();
    const medicamento = $('#dxMedicamento').val().trim();
    const dosisVal = $('#dxDosis').val();
    const dosis = dosisVal === '' ? null : parseFloat(dosisVal);

    marcarCampo($('#dxFecha'), !!fecha && new Date(fecha) <= new Date());
    marcarCampo($('#dxDiagnostico'), !!diagnostico);

    if (!fecha || !diagnostico) {
        mostrarAviso('#resultado-validacion-diagnostico', 'error', 'Fecha y diagnóstico son obligatorios.');
        return;
    }
    if (new Date(fecha) > new Date()) {
        mostrarAviso('#resultado-validacion-diagnostico', 'error', 'La fecha del diagnóstico no puede ser futura.');
        return;
    }
    if (medicamento && (dosis === null || isNaN(dosis) || dosis <= 0)) {
        mostrarAviso('#resultado-validacion-diagnostico', 'error', 'Si registras un medicamento, la dosis debe ser un número mayor a 0.');
        return;
    }

    const pacientes = dbLeer(CLAVES.PACIENTES) || [];
    const paciente = pacientes.find(p => p.id === pacienteSeleccionadoId);
    paciente.diagnosticos.push({
        fecha, motivo, diagnostico, tratamiento,
        medicamento: medicamento || '—',
        dosis: medicamento ? dosis : null
    });
    dbGuardar(CLAVES.PACIENTES, pacientes);

    mostrarAviso('#resultado-validacion-diagnostico', 'exito', 'Diagnóstico registrado en la ficha del paciente.');
    $('#formDiagnostico')[0].reset();
    $('#formDiagnostico .form-control').removeClass('is-valid is-invalid');
    renderizarDiagnosticos(paciente);
}

function renderizarVacunas(paciente) {
    if (!paciente.vacunas.length) {
        $('#tablaVacunas').html('<tr><td colspan="4" class="text-muted text-center">Sin vacunas registradas aún.</td></tr>');
        return;
    }
    let html = '';
    [...paciente.vacunas].reverse().forEach(v => {
        const estado = calcularEstadoVacuna(v.fechaVencimiento);
        html += `
            <tr>
                <td>${v.nombre}</td>
                <td>${v.fechaAplicacion}</td>
                <td>${v.fechaVencimiento}</td>
                <td><span class="badge-estado ${estado.clase}">${estado.texto}</span></td>
            </tr>`;
    });
    $('#tablaVacunas').html(html);
}

function agregarVacuna() {
    if (!pacienteSeleccionadoId) {
        mostrarAviso('#resultado-validacion-vacuna', 'error', 'Primero guarda o selecciona un paciente.');
        return;
    }

    const nombre = $('#vacNombre').val().trim();
    const fechaAplicacion = $('#vacFechaAplicacion').val();
    const fechaVencimiento = $('#vacFechaVencimiento').val();

    marcarCampo($('#vacNombre'), !!nombre);
    marcarCampo($('#vacFechaAplicacion'), !!fechaAplicacion);
    marcarCampo($('#vacFechaVencimiento'), !!fechaVencimiento);

    if (!nombre || !fechaAplicacion || !fechaVencimiento) {
        mostrarAviso('#resultado-validacion-vacuna', 'error', 'Nombre de la vacuna, fecha de aplicación y de vencimiento son obligatorios.');
        return;
    }
    if (new Date(fechaAplicacion) > new Date()) {
        mostrarAviso('#resultado-validacion-vacuna', 'error', 'La fecha de aplicación no puede ser futura.');
        return;
    }
    if (new Date(fechaVencimiento) <= new Date(fechaAplicacion)) {
        mostrarAviso('#resultado-validacion-vacuna', 'error', 'La fecha de vencimiento debe ser posterior a la fecha de aplicación.');
        return;
    }

    const pacientes = dbLeer(CLAVES.PACIENTES) || [];
    const paciente = pacientes.find(p => p.id === pacienteSeleccionadoId);
    paciente.vacunas.push({ nombre, fechaAplicacion, fechaVencimiento });
    dbGuardar(CLAVES.PACIENTES, pacientes);

    mostrarAviso('#resultado-validacion-vacuna', 'exito', 'Vacuna registrada correctamente.');
    $('#formVacuna')[0].reset();
    $('#formVacuna .form-control').removeClass('is-valid is-invalid');
    renderizarVacunas(paciente);
}

/* =========================================================================
   7. INICIALIZACIÓN POR PÁGINA
   ========================================================================= */

$(document).ready(function () {
    inicializarDatosDemo();

    // --- login.html ---
    if ($('#formLogin').length) {
        revisarMotivoRedireccion();
    }

    // --- admin.html ---
    if ($('#tablaCitas').length) {
        const sesion = protegerRuta(['ADMINISTRADOR', 'RECEPCIONISTA']);
        if (sesion) {
            pintarBarraSesion(sesion);
            cargarCitas();
        }
    }

    // --- usuarios.html ---
    if ($('#tablaUsuarios').length) {
        const sesion = protegerRuta(['ADMINISTRADOR']);
        if (sesion) {
            pintarBarraSesion(sesion);
            cargarUsuarios();
        }
    }

    // --- ficha-veterinaria.html ---
    if ($('#listaPacientes').length) {
        const sesion = protegerRuta(['ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO']);
        if (sesion) {
            pintarBarraSesion(sesion);
            cargarPacientes('');
            $('#buscarPaciente').on('input', function () {
                cargarPacientes($(this).val());
            });
        }
    }
});
