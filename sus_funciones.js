function validarFormulario(formId){

  
    //Paso 1 : Obtener Formulario
    var formulario=document.getElementById(formId);

    //Paso 2 : Obtener  todos los campos (input,select,textarea)
    var campos=formulario.querySelectorAll('input,select,textarea')

    //Paso 3 : Contador de campos vacios
    var vacios =0;
    var mensaje='';

    // Paso 4: revisar cada campo


    
    for(var i=0; i <campos.length;i++ ) {
        var campo =campos[i];

        //Ignorar los botones
        if(campo.type ==='button'  || campo.type ==='submit' ){
            continue
        }

        // si el campo esta vacio

        if(campo.value.trim() ===''){
            vacios++;
            mensaje = mensaje + '*' + campo.placeholder + '\n';
            campo.style.borderColor='red'; // Resaltamos el rojo 
        }else{
            campo.style.borderColor=''; // Quitamos el rojo
        }// if   

    }// fin for

    //Paso 5: Mostrar resultado
    var resultado =document.getElementById('resultado-validacion')

    if(vacios >0){
        // Errores en los campos
        resultado.innerHTML='Faltan '+ vacios +'campos: <br>'+ mensaje.replace(/\n/g,'<br>');
        resultado.style.color='red';
        resultado.style.display='block';
    }else{
        resultado.innerHTML='Formulario validado ';
        resultado.style.color='green';
        resultado.style.display='block';
    }


} // fin function validarFormulario



function resetearFormulario(formId){
   // alert('resetearFormulario')

    //Paso 1 : Obtener Formulario
    var formulario=document.getElementById(formId);

    //Paso 2 : Obtener  todos los campos (input,select,textarea)
    var campos=formulario.querySelectorAll('input,select,textarea')

    // Paso 3 : Limpiar cada campo

     for(var i=0; i <campos.length;i++ ) {
        var campo =campos[i];

        //Ignorar los botones
        if(campo.type !=='button'  && campo.type !=='submit' ){
            campo.value="";
             campo.style.borderColor=''; // Quitar el rojo 
        }

    }// fin for

    // Paso 4:  Ocultar mensaje
      var resultado =document.getElementById('resultado-validacion');
      resultado.style.display='none';

} // fin function vFormulario