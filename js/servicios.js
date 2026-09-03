// js/servicios.js

// Arreglo global de servicios
const listaServicios = [
    {
        id: 1,
        nombre: "Consulta Médica General",
        descripcion: "Evaluación física completa de la mascota, diagnóstico inicial y prescripción de tratamientos por profesionales calificados.",
        precio: 25000,
        categoria: "Atención Básica",
        imagen: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=500&q=80"
    },
    {
        id: 2,
        nombre: "Programa de Vacunación",
        descripcion: "Aplicación de vacunas óctuple, quíntuple y antirrábica con certificado oficial según la edad de la mascota.",
        precio: 18000,
        categoria: "Preventiva",
        imagen: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80"
    },
    {
        id: 3,
        nombre: "Cirugía Menor y Esterilización",
        descripcion: "Procedimientos quirúrgicos ambulatorios con anestesia de última generación, monitoreo y cuidados postoperatorios.",
        precio: 55000,
        categoria: "Quirúrgica",
        imagen: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&q=80"
    },
    {
        id: 4,
        nombre: "Desparasitación Interna y Externa",
        descripcion: "Tratamiento profiláctico integral y efectivo contra parásitos intestinales, pulgas, garrapatas y ácaros.",
        precio: 12000,
        categoria: "Preventiva",
        imagen: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&q=80"
    }
];

function cargarServicios() {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    listaServicios.forEach(servicio => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
        col.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${servicio.imagen}" class="card-img-top object-fit-cover" height="180" alt="${servicio.nombre}">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-warning text-dark w-auto mb-2 align-self-start">${servicio.categoria}</span>
                    <h5 class="card-title h6 fw-bold">${servicio.nombre}</h5>
                    <p class="card-text small flex-grow-1">${servicio.descripcion.substring(0, 75)}...</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="fw-bold fs-5 text-warning">$${servicio.precio.toLocaleString('es-CL')}</span>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0 d-grid gap-2">
                    <a href="servicios.html?id=${servicio.id}" class="btn btn-dulce btn-sm">Ver Detalle</a>
                    <button onclick="agregarAlCarrito(${servicio.id})" class="btn btn-reserva btn-sm">
                        <i class="bi bi-calendar-plus"></i> Agendar Cita
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
    });
}

document.addEventListener("DOMContentLoaded", cargarServicios);