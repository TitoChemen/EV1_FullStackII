// Algoritmo para verificar el RUT Chileno
function validarRutChileno(rut) {
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

// Validar inicio de sesión
function validarLogin() {
    const email = $('#loginEmail').val().trim();
    const pass = $('#loginPass').val();
    const contenedorError = $('#resultado-validacion');
    
    contenedorError.html('');

    // Validar contraseña (al menos 8 caracteres, números y letras)
    const regexPass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!email || !pass) {
        contenedorError.html('<div class="alert alert-danger">Todos los campos son obligatorios.</div>');
        return;
    }

    if (!regexPass.test(pass)) {
        contenedorError.html('<div class="alert alert-warning">La contraseña debe contener al menos 8 caracteres, letras y números.</div>');
        return;
    }

    // Redirección o petición AJAX según el rol del usuario
    contenedorError.html('<div class="alert alert-success">Acceso exitoso. Redireccionando...</div>');
    setTimeout(() => {
        window.location.href = "admin-citas.html";
    }, 1000);
}

// Validaciones para la Ficha Clínica
function guardarFichaClinica() {
    const rut = $('#rutDueno').val();
    const mascota = $('#nombreMascota').val().trim();
    const dosis = parseFloat($('#dosisMedicamento').val());
    const fechaVenc = new Date($('#fechaVencimiento').val());
    const hoy = new Date();
    const contenedor = $('#resultado-validacion-ficha');

    contenedor.html('');

    if (!validarRutChileno(rut)) {
        contenedor.html('<div class="alert alert-danger">El RUT ingresado no es válido.</div>');
        return;
    }

    if (!mascota) {
        contenedor.html('<div class="alert alert-danger">Debe ingresar el nombre de la mascota.</div>');
        return;
    }

    if (isNaN(dosis) || dosis <= 0) {
        contenedor.html('<div class="alert alert-danger">La dosis del medicamento debe ser un valor numérico positivo.</div>');
        return;
    }

    if (fechaVenc <= hoy) {
        contenedor.html('<div class="alert alert-danger">La fecha de vencimiento de la vacuna debe ser futura.</div>');
        return;
    }

    contenedor.html('<div class="alert alert-success">Ficha clínica registrada correctamente.</div>');
}

// Carga simulación de citas entrantes guardadas por otros integrantes
$(document).ready(function() {
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
});