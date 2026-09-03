// ==========================================
// 1. FUNCIONES AUXILIARES DE VALIDACIÓN
// ==========================================

// Algoritmo para verificar el RUT chileno
function validarRut(rut) {
    if (!rut) return false;
    rut = rut.replace(/\./g, '').replace('-', '').trim().toUpperCase();
    if (rut.length < 8) return false;

    const cuerpo = rut.slice(0, -1);
    let dv = rut.slice(-1);

    if (!/^[0-9]+$/.test(cuerpo)) return false;

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    let dvCalc = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

    return dv === dvCalc;
}


// ==========================================
// 2. MÓDULO DE AUTENTICACIÓN Y REGISTRO
// ==========================================

// Manejar Inicio de Sesión (Login)
function manejarLogin() {
    const email = $('#loginEmail').val().trim();
    const pass = $('#loginPass').val();
    const contenedorError = $('#resultado-validacion');
    
    contenedorError.html('');

    const regexPass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!email || !pass) {
        contenedorError.html('<div class="alert alert-danger"><i class="bi bi-exclamation-triangle"></i> Todos los campos son obligatorios.</div>');
        return;
    }

    if (!regexPass.test(pass)) {
        contenedorError.html('<div class="alert alert-warning"><i class="bi bi-shield-slash"></i> La contraseña debe contener al menos 8 caracteres, letras y números.</div>');
        return;
    }

    // Buscar si el usuario fue registrado en localStorage
    let usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
    let usuarioEncontrado = usuariosGuardados.find(u => u.email === email && u.pass === pass);

    let paginaDestino = 'usuarios.html';

    if (usuarioEncontrado) {
        if (usuarioEncontrado.rol === 'admin' || usuarioEncontrado.rol === 'Administrador') {
            paginaDestino = 'admin.html';
        } else if (usuarioEncontrado.rol === 'veterinario' || usuarioEncontrado.rol === 'Veterinario') {
            paginaDestino = 'ficha_veterinaria.html';
        } else {
            paginaDestino = 'usuarios.html';
        }
    } else {
        // Redirección para cuentas demo
        if (email === 'admin@sanmarcos.cl') {
            paginaDestino = 'admin.html';
        } else if (email === 'veterinario@sanmarcos.cl') {
            paginaDestino = 'ficha_veterinaria.html';
        } else if (email === 'recepcion@sanmarcos.cl') {
            paginaDestino = 'usuarios.html';
        }
    }

    // Guardar usuario en sesión activa
    localStorage.setItem('usuarioSesion', JSON.stringify({ email: email }));

    contenedorError.html('<div class="alert alert-success"><i class="bi bi-check-circle"></i> Acceso exitoso. Redireccionando...</div>');

    setTimeout(() => {
        window.location.href = paginaDestino;
    }, 1000);
}

// Validar y Guardar Registro de Usuario
function validarRegistro() {
    const nombre = $('#regNombre').val().trim();
    const rut = $('#regRut').val().trim();
    const email = $('#regEmail').val().trim();
    const rol = $('#regRol').val();
    const pass = $('#regPass').val();
    const passConfirm = $('#regPassConfirm').val();
    const contenedor = $('#resultado-validacion-registro');

    contenedor.html('');

    if (!nombre || !rut || !email || !rol || !pass || !passConfirm) {
        contenedor.html('<div class="alert alert-danger"><i class="bi bi-exclamation-triangle"></i> Todos los campos son obligatorios.</div>');
        return;
    }

    if (!validarRut(rut)) {
        contenedor.html('<div class="alert alert-danger"><i class="bi bi-card-heading"></i> El RUT ingresado no es válido (ejemplo de formato correcto: 12345678-9).</div>');
        return;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
        contenedor.html('<div class="alert alert-danger"><i class="bi bi-envelope-exclamation"></i> Ingrese un formato de correo electrónico válido.</div>');
        return;
    }

    const regexPass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!regexPass.test(pass)) {
        contenedor.html('<div class="alert alert-warning"><i class="bi bi-shield-slash"></i> La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.</div>');
        return;
    }

    if (pass !== passConfirm) {
        contenedor.html('<div class="alert alert-danger"><i class="bi bi-lock"></i> Las contraseñas no coinciden.</div>');
        return;
    }

    // Guardar en localStorage
    let usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
    
    if (usuariosGuardados.some(u => u.email === email)) {
        contenedor.html('<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> El correo ya se encuentra registrado.</div>');
        return;
    }

    const nuevoUsuario = { nombre, rut, email, rol, pass };
    usuariosGuardados.push(nuevoUsuario);
    localStorage.setItem('usuarios_registrados', JSON.stringify(usuariosGuardados));

    contenedor.html('<div class="alert alert-success"><i class="bi bi-check-circle"></i> Registro exitoso. Redirigiendo al inicio de sesión...</div>');

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

function resetearRegistro() {
    if ($('#formularioRegistro').length) {
        $('#formularioRegistro')[0].reset();
        $('#resultado-validacion-registro').html('');
    }
}


// ==========================================
// 3. MÓDULO ADMINISTRACIÓN Y FICHAS CLÍNICAS
// ==========================================

function guardarFichaClinica() {
    const rut = $('#rutDueno').val();
    const mascota = $('#nombreMascota').val().trim();
    const dosis = parseFloat($('#dosisMedicamento').val());
    const fechaVencVal = $('#fechaVencimiento').val();
    const contenedor = $('#resultado-validacion-ficha');

    contenedor.html('');

    if (!validarRut(rut)) {
        contenedor.html('<div class="alert alert-danger"><i class="bi bi-card-heading"></i> El RUT del dueño ingresado no es válido.</div>');
        return;
    }

    if (!mascota) {
        contenedor.html('<div class="alert alert-danger"><i class="bi bi-exclamation-circle"></i> Debe ingresar el nombre de la mascota.</div>');
        return;
    }

    if (isNaN(dosis) || dosis <= 0) {
        contenedor.html('<div class="alert alert-danger"><i class="bi bi-capsule"></i> La dosis del medicamento debe ser un valor numérico positivo.</div>');
        return;
    }

    if (!fechaVencVal) {
        contenedor.html('<div class="alert alert-danger"><i class="bi bi-calendar-x"></i> Debe seleccionar una fecha de vencimiento.</div>');
        return;
    }

    const fechaVenc = new Date(fechaVencVal);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaVenc <= hoy) {
        contenedor.html('<div class="alert alert-danger"><i class="bi bi-calendar-exclamation"></i> La fecha de vencimiento de la vacuna debe ser posterior a la fecha actual.</div>');
        return;
    }

    contenedor.html('<div class="alert alert-success"><i class="bi bi-check-circle"></i> Ficha clínica registrada correctamente.</div>');
}

// Cargar datos al cargar el documento
$(document).ready(function() {
    // Cargar Citas de Ejemplo
    if ($('#tablaCitas').length) {
        const citasEjemplo = [
            { id: 1, dueno: "Juan Pérez (11.111.111-1)", mascota: "Fuchy", fecha: "2026-09-10 10:00", estado: "Pendiente" },
            { id: 2, dueno: "María Soto (22.222.222-2)", mascota: "Pelusa", fecha: "2026-09-10 11:30", estado: "Pendiente" }
        ];

        let html = '';
        citasEjemplo.forEach(c => {
            html += `
                <tr>
                    <td>${c.dueno}</td>
                    <td>${c.mascota}</td>
                    <td>${c.fecha}</td>
                    <td><span class="badge bg-warning text-dark">${c.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="alert('Cita confirmada')"><i class="bi bi-check-circle"></i></button>
                        <button class="btn btn-sm btn-warning" onclick="alert('Reagendando cita...')"><i class="bi bi-clock-history"></i></button>
                    </td>
                </tr>
            `;
        });
        $('#tablaCitas').html(html);
    }

    // Cargar Usuarios Registrados
    if ($('#tablaUsuarios').length) {
        let usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
        let htmlUsuarios = '';

        if (usuariosGuardados.length === 0) {
            htmlUsuarios = '<tr><td colspan="4" class="text-center text-muted">No hay usuarios registrados aún.</td></tr>';
        } else {
            usuariosGuardados.forEach(u => {
                htmlUsuarios += `
                    <tr>
                        <td>${u.nombre}</td>
                        <td>${u.rut}</td>
                        <td>${u.email}</td>
                        <td><span class="badge bg-info text-dark">${u.rol}</span></td>
                    </tr>
                `;
            });
        }
        $('#tablaUsuarios').html(htmlUsuarios);
    }
});