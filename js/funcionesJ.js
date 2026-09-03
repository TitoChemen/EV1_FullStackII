function validarFormulario(formId) {
    // Paso 1: Obtener Formulario
    var formulario = document.getElementById(formId);

    // Paso 2: Obtener todos los campos (input, select, textarea)
    var campos = formulario.querySelectorAll('input, select, textarea');

    // Paso 3: Contadores y texto
    var errores = 0;
    var textoErrores = ''; // Cambiamos el nombre para que no choque con el id del textarea

    // Paso 4: Revisar cada campo
    for (var i = 0; i < campos.length; i++) {
        var campo = campos[i];

        // Ignorar los botones
        if (campo.type === 'button' || campo.type === 'submit') {
            continue;
        }

        var nombreCampo = campo.placeholder || campo.id; 

        // Condición A: Si el campo está vacio
        if (campo.value.trim() === '') {
            
            // ¡NUEVO!: Verificamos si es el campo opcional usando su id
            if (campo.id === 'mensaje') {
                campo.style.borderColor = ''; // Es opcional, le quitamos el rojo si lo tenía
            } else {
                // Si está vacío y NO es el mensaje, cuenta como error
                errores++;
                textoErrores = textoErrores + '• El campo ' + nombreCampo + ' está vacío<br>';
                campo.style.borderColor = 'red'; 
            }
            
        } 
        // Condición B: Si no está vacío y es el campo de email
        else if (campo.type === 'email') {
            var correo = campo.value.trim().toLowerCase(); 
            
            // Verificamos si NO termina en @duoc.cl y NO termina en @gmail.com
            if (!correo.endsWith('@duoc.cl') && !correo.endsWith('@gmail.com')) {
                errores++;
                textoErrores = textoErrores + '• El correo debe terminar en @duoc.cl o @gmail.com<br>';
                campo.style.borderColor = 'red';
            } else {
                campo.style.borderColor = ''; 
            }
        } 
        // Condición C: Si no está vacío y no es email, todo está correcto
        else {
            campo.style.borderColor = ''; // Quitamos el rojo
        }
    }

    // Paso 5: Mostrar resultado
    var resultado = document.getElementById('resultado-validacion');

    if (errores > 0) {
        resultado.innerHTML = `
            <div class="alert alert-danger">
                <strong>Por favor corrige los siguientes errores:</strong><br>
                ${textoErrores}
            </div>
        `;
        resultado.style.display = 'block';
    } else {
        resultado.innerHTML = `
            <div class="alert alert-success">
                <i class="bi bi-check-circle-fill"></i> ¡Formulario validado! Tu mensaje ha sido enviado correctamente.
            </div>
        `;
        resultado.style.display = 'block';
    }
}


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