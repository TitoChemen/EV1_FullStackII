function validarFormulario(formId) {
    // Paso 1: Obtener Formulario
    var formulario = document.getElementById(formId);

    // Paso 2: Obtener todos los campos (input, select, textarea)
    var campos = formulario.querySelectorAll('input, select, textarea');

    // Paso 3: Contador de campos vacios
    var vacios = 0;
    var mensaje = '';

    // Paso 4: Revisar cada campo
    for (var i = 0; i < campos.length; i++) {
        var campo = campos[i];

        // Ignorar los botones
        if (campo.type === 'button' || campo.type === 'submit') {
            continue;
        }

        // Si el campo está vacio
        if (campo.value.trim() === '') {
            vacios++;
            
            // MEJORA: Como el <select> no tiene placeholder, usamos su 'id' (asunto) si el placeholder no existe
            var nombreCampo = campo.placeholder || campo.id; 
            
            mensaje = mensaje + '• ' + nombreCampo + '<br>';
            campo.style.borderColor = 'red'; // Resaltamos en rojo 
        } else {
            campo.style.borderColor = ''; // Quitamos el rojo
        }
    }

    // Paso 5: Mostrar resultado
    var resultado = document.getElementById('resultado-validacion');

    if (vacios > 0) {
        // Errores en los campos (Usando el diseño de alerta roja de Bootstrap)
        resultado.innerHTML = `
            <div class="alert alert-danger">
                <strong>Faltan ${vacios} campos por completar:</strong><br>
                ${mensaje}
            </div>
        `;
        resultado.style.display = 'block';
    } else {
        // Éxito (Usando el diseño de alerta verde de Bootstrap)
        resultado.innerHTML = `
            <div class="alert alert-success">
                <i class="bi bi-check-circle-fill"></i> ¡Formulario validado! Tu mensaje ha sido enviado correctamente.
            </div>
        `;
        resultado.style.display = 'block';
    }
} // fin function validarFormulario


function resetearFormulario(formId) {
    // Paso 1: Obtener Formulario
    var formulario = document.getElementById(formId);

    // Paso 2: Obtener todos los campos (input, select, textarea)
    var campos = formulario.querySelectorAll('input, select, textarea');

    // Paso 3: Limpiar cada campo
    for (var i = 0; i < campos.length; i++) {
        var campo = campos[i];

        // Ignorar los botones
        if (campo.type !== 'button' && campo.type !== 'submit') {
            campo.value = "";
            campo.style.borderColor = ''; // Quitar el rojo 
        }
    }

    // Paso 4: Ocultar y limpiar mensaje
    var resultado = document.getElementById('resultado-validacion');
    resultado.style.display = 'none';
    resultado.innerHTML = ''; // Limpiamos el texto interno por si acaso
} // fin function resetearFormulario