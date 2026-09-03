# 🐾 Veterinaria San Marcos 

Bienvenidos al repositorio oficial de la **Veterinaria San Marcos** (Rancagua). Este proyecto une el trabajo de todo el equipo en una sola plataforma web impecable, combinando la vitrina pública, el catálogo con carrito de horas y un panel de administración interno con seguridad por roles.

---

## 🛠️ ¿Quién hizo qué? (División del equipo)

* **Kevin:** Integración general, diseño y unificación de estilos (*Caramel & Dulce de Leche*), desarrollo del catálogo de servicios con carrito/citas (`agendar.html`), y la unificación de los flujos de navegación y ruteo entre los distintos módulos.
* **Jaime:** Maquetación y estructura de la portada principal (`index.html`) y la sección de contacto (`contacto.html`) con su respectiva validación de formularios (`funcionesJ.js`).
* **Oscar:** Desarrollo del sistema administrativo completo (`admin.html`, `login.html`, `registro.html`, `usuarios.html`, `ficha-veterinaria.html`) y el motor de almacenamiento local con control de roles (`funciones.js`).

---

## 📂 Estructura del Proyecto

El proyecto está ordenado de forma modular para que no se nos enrede nada:

* 🏠 `index.html`: La portada oficial con la identidad de la clínica y accesos directos.
* 🛒 `agendar.html`: Catálogo interactivo de especialidades médicas con gestión de citas.
* ✉️ `contacto.html`: Formulario de consultas y mapa de ubicación.
* 🔐 `login.html` & `registro.html`: Módulos de acceso y creación de cuentas.
* ⚙️ `admin.html`: Panel para que recepción gestione las citas entrantes.
* 📋 `ficha-veterinaria.html`: Historiales clínicos, diagnósticos y vacunas de los regalones.
* 👥 `usuarios.html`: Gestión de personal exclusiva para administradores.
* 🎨 `css/estilos.css`: Nuestra hoja de estilos centralizada con la facha gourmet.
* 📜 `js/`: Los scripts de lógica (`carrito.js`, `servicios.js`, `funcionesJ.js` y el motor `funciones.js`).

---

## 🚀 Tecnologías que usamos

* **Frontend:** HTML5 semántico, CSS3 personalizado y Bootstrap 5.3.
* **Iconografía y Fuentes:** Bootstrap Icons, Material Icons y Google Fonts (*Open Sans*).
* **Lógica y Datos:** JavaScript moderno (ES6+), jQuery 3.7.1 y `localStorage` para simular la base de datos de usuarios y citas.

---

## 🔑 Credenciales de Prueba (Portal Médico)

Para revisar los distintos niveles de permisos por dentro, pásale estas cuentas al profe:

* **Administrador:** `admin@sanmarcos.cl` / `Admin2026`
* **Recepcionista:** `recepcion@sanmarcos.cl` / `Recepcion2026`
* **Veterinario:** `veterinario@sanmarcos.cl` / `Vet2026a`

---

## 💻 ¿Cómo correrlo localmente?

1. Clona el repositorio y ponte en la rama de entrega EV!.
2. Abre la carpeta en tu editor favorito (como VS Code).
3. Levanta un servidor local (por ejemplo, con la extensión *Live Server*) para que el `localStorage` y los scripts corran sin atados de seguridad.
4. Abre `index.html` y ¡a navegar se ha dicho!
