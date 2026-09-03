/* =========================================================================
   VETERINARIA SAN MARCOS
   Módulo: Usuarios, Autenticación y Panel de Administración (RBAC)
   ========================================================================= */

const CLAVES = {
    USUARIOS: 'sanmarcos_usuarios',
    SESION: 'sanmarcos_sesion',
    CITAS: 'sanmarcos_citas',
    PACIENTES: 'sanmarcos_pacientes'
};

function dbLeer(clave) {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
}

function dbGuardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function inicializarDatosDemo() {
    if (!dbLeer(CLAVES.USUARIOS)) {
        dbGuardar(CLAVES.USUARIOS, [
            { id: 1, nombre: 'Constanza Rivas', rut: '11111111-1', email: 'admin@sanmarcos.cl', rol: 'ADMINISTRADOR', password: 'Admin2026', activo: true },
            { id: 2, nombre: 'Pablo Herrera', rut: '22222222-2', email: 'recepcion@sanmarcos.cl', rol: 'RECEPCIONISTA', password: 'Recepcion2026', activo: true },
            { id: 3, nombre: 'Dra. Javiera Muñoz', rut: '33333333-3', email: 'veterinario@sanmarcos.cl', rol: 'VETERINARIO', password: 'Vet2026a', activo: true }
        ]);
    }

    if (!dbLeer(CLAVES.CITAS)) {
        dbGuardar(CLAVES.CITAS, [
            { id: 1, duenoNombre: 'Juan Pérez', duenoRut: '19011022-K', mascota: 'Fuchy', motivo: 'Control de peso', fecha: '2026-09-10T10:00', estado: 'PENDIENTE' },
            { id: 2, duenoNombre: 'María Soto', duenoRut: '18222333-4', mascota: 'Pelusa', motivo: 'Vacunación', fecha: '2026-09-10T11:30', estado: 'PENDIENTE' },
            { id: 3, duenoNombre: 'Ricardo Vega', duenoRut: '17555666-7', mascota: 'Toby', motivo: 'Consulta general', fecha: '2026-09-11T09:15', estado: 'CONFIRMADA' }
        ]);
    }

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
            }
        ]);
    }
}

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
        mostrarAviso('#resultado-validacion', 'error', 'Esta cuenta está desactivada.');
        return;
    }

    iniciarSesion(usuario);
    mostrarAviso('#resultado-validacion', 'exito', `Bienvenido/a, ${usuario.nombre}. Redirigiendo...`);

    setTimeout(() => {
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

    if (!nombre || !rut || !email || !rol || !pass || !passConfirm) {
        mostrarAviso('#resultado-validacion-registro', 'error', 'Todos los campos son obligatorios.');
        return;
    }
    if (!validarRut(rut)) {
        mostrarAviso('#resultado-validacion-registro', 'error', 'El RUT ingresado no es válido.');
        return;
    }
    if (!validarEmail(email)) {
        mostrarAviso('#resultado-validacion-registro', 'error', 'Ingresa un correo electrónico válido.');
        return;
    }

    const usuarios = dbLeer(CLAVES.USUARIOS) || [];
    if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        mostrarAviso('#resultado-validacion-registro', 'error', 'Ya existe una cuenta con ese correo.');
        return;
    }

    usuarios.push({ id: Date.now(), nombre, rut, email, rol, password: pass, activo: true });
    dbGuardar(CLAVES.USUARIOS, usuarios);

    mostrarAviso('#resultado-validacion-registro', 'exito', 'Cuenta creada correctamente. Redirigiendo...');
    setTimeout(() => { window.location.href = 'login.html'; }, 1400);
}

function resetearRegistro() {
    if (!$('#formularioRegistro').length) return;
    $('#regNombre, #regRut, #regEmail, #regPass, #regPassConfirm').val('');
    $('#regRol').val('');
    $('#formularioRegistro .form-control, #formularioRegistro .form-select').removeClass('is-valid is-invalid');
    $('#resultado-validacion-registro').html('');
}

function revisarMotivoRedireccion() {
    const params = new URLSearchParams(window.location.search);
    const motivo = params.get('motivo');
    if (!motivo) return;

    const mensajes = {
        sesion: ['alerta', 'Debes iniciar sesión para acceder a esa página.'],
        rol: ['error', 'Tu cuenta no tiene permisos para acceder a esa sección.'],
        'rol-dueno': ['alerta', 'El panel interno es solo para personal de la clínica.']
    };
    const [tipo, texto] = mensajes[motivo] || [];
    if (texto) mostrarAviso('#resultado-validacion', tipo, texto);
}

function cargarCitas() {
    const citas = (dbLeer(CLAVES.CITAS) || []).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const $tabla = $('#tablaCitas');

    if (!citas.length) {
        $tabla.html('');
        $('#citasVacio').removeClass('d-none');
        return;
    }
    $('#citasVacio').addClass('d-none');

    let html = '';
    citas.forEach(c => {
        html += `
            <tr>
                <td>${c.duenoNombre}<br><small class="text-muted">${c.duenoRut}</small></td>
                <td>${c.mascota}</td>
                <td>${c.motivo || '—'}</td>
                <td>${c.fecha}</td>
                <td><span class="badge-estado">${c.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="confirmarCita(${c.id})"><i class="bi bi-check-lg"></i></button>
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

let pacienteSeleccionadoId = null;

function cargarPacientes(filtro) {
    const pacientes = dbLeer(CLAVES.PACIENTES) || [];
    const texto = (filtro || '').trim().toLowerCase();
    const filtrados = texto ? pacientes.filter(p => p.nombreMascota.toLowerCase().includes(texto)) : pacientes;

    const $lista = $('#listaPacientes');
    if (!filtrados.length) {
        $lista.html('<div class="estado-vacio">No se encontraron pacientes.</div>');
        return;
    }

    let html = '';
    filtrados.forEach(p => {
        html += `
            <button type="button" class="list-group-item list-group-item-action" onclick="seleccionarPaciente(${p.id})">
                <strong>${p.nombreMascota}</strong> (${p.especie})<br>
                <small class="text-muted">${p.duenoNombre}</small>
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
}

$(document).ready(function () {
    inicializarDatosDemo();

    if ($('#formLogin').length) revisarMotivoRedireccion();
    if ($('#tablaCitas').length) {
        const sesion = protegerRuta(['ADMINISTRADOR', 'RECEPCIONISTA']);
        if (sesion) { pintarBarraSesion(sesion); cargarCitas(); }
    }
    if ($('#listaPacientes').length) {
        const sesion = protegerRuta(['ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO']);
        if (sesion) {
            pintarBarraSesion(sesion);
            cargarPacientes('');
            $('#buscarPaciente').on('input', function () { cargarPacientes($(this).val()); });
        }
    }
});