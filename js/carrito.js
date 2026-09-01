// js/carrito.js

let carrito = JSON.parse(localStorage.getItem("carrito_compras")) || [];

function agregarAlCarrito(idServicio) {
    if (typeof listaServicios === "undefined") return;

    const servicio = listaServicios.find(s => s.id === idServicio);
    if (!servicio) return;

    const existe = carrito.find(s => s.id === idServicio);
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({
            id: servicio.id,
            nombre: servicio.nombre,
            precio: servicio.precio,
            imagen: servicio.imagen,
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarVistaCarrito();
    
    // Avisar al usuario mediante una notificación
    mostrarNotificacion(`¡"${servicio.nombre}" se agregó a tus citas!`);
}

function eliminarDelCarrito(idServicio) {
    carrito = carrito.filter(s => s.id !== idServicio);
    guardarCarrito();
    actualizarVistaCarrito();
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    actualizarVistaCarrito();
}

function guardarCarrito() {
    localStorage.setItem("carrito_compras", JSON.stringify(carrito));
}

function actualizarVistaCarrito() {
    const contenedorModal = document.getElementById("lista-carrito");
    const totalElemento = document.getElementById("total-carrito");
    const contadorBadge = document.getElementById("contador-carrito");

    if (!contenedorModal || !totalElemento || !contadorBadge) return;

    contenedorModal.innerHTML = "";
    let total = 0;
    let cantidadTotalItems = 0;

    if (carrito.length === 0) {
        contenedorModal.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay citas ni servicios en tu lista.</td></tr>`;
    } else {
        carrito.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;
            cantidadTotalItems += item.cantidad;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <img src="${item.imagen}" width="40" height="40" class="me-2 rounded object-fit-cover">
                    ${item.nombre}
                </td>
                <td>$${item.precio.toLocaleString('es-CL')}</td>
                <td>
                    <span class="badge bg-secondary px-3 py-2">${item.cantidad}</span>
                </td>
                <td>$${subtotal.toLocaleString('es-CL')}</td>
                <td>
                    <button onclick="eliminarDelCarrito(${item.id})" class="btn btn-outline-danger btn-sm">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            contenedorModal.appendChild(tr);
        });
    }

    totalElemento.textContent = total.toLocaleString('es-CL');
    contadorBadge.textContent = cantidadTotalItems;
}

// Función para mostrar la notificación flotante
function mostrarNotificacion(mensaje) {
    // Verificar si ya existe el contenedor de notificaciones, si no, crearlo
    let contenedorToast = document.getElementById("toast-container");
    if (!contenedorToast) {
        contenedorToast = document.createElement("div");
        contenedorToast.id = "toast-container";
        contenedorToast.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999;";
        document.body.appendChild(contenedorToast);
    }

    // Crear el elemento de la alerta
    const toast = document.createElement("div");
    toast.className = "alert alert-success alert-dismissible fade show shadow-lg d-flex align-items-center gap-2";
    toast.style.cssText = "min-width: 280px; background-color: #15803d; color: #ffffff; border: none;";
    toast.innerHTML = `
        <i class="bi bi-check-circle-fill fs-5"></i>
        <div>${mensaje}</div>
        <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    contenedorToast.appendChild(toast);

    // Remover la alerta automáticamente después de 3 segundos
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 150);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", actualizarVistaCarrito);