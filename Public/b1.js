(() => {
    const STORAGE_KEY = 'eest3Sugerencias';

    const inputTitulo = document.getElementById('titulo');
    const inputMensaje = document.getElementById('mensaje');
    const btnEnviar = document.getElementById('enviar');
    const btnBorrar = document.getElementById('borrar');
    const contenedor = document.getElementById('contenedorMensajes');

    if (!inputTitulo || !inputMensaje || !btnEnviar || !contenedor) {
        return;
    }

    // --- Toast simple de feedback ---
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        toastContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastContainer);
    }

    function mostrarToast(texto) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = texto;
        toastContainer.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('is-visible'));
        setTimeout(() => {
            toast.classList.remove('is-visible');
            setTimeout(() => toast.remove(), 300);
        }, 2200);
    }

    function cargarMensajes() {
        try {
            const datos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(datos) ? datos : [];
        } catch (e) {
            return [];
        }
    }

    function guardarMensajes(mensajes) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes));
    }

    function formatearFecha(iso) {
        const fecha = new Date(iso);
        return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' · ' + fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    function crearTarjeta(item) {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'sugerencia-card';
        tarjeta.dataset.id = item.id;

        const titulo = document.createElement('h3');
        titulo.className = 'sugerencia-titulo';
        titulo.textContent = item.titulo;

        const fecha = document.createElement('span');
        fecha.className = 'sugerencia-fecha';
        fecha.textContent = formatearFecha(item.fecha);

        const mensaje = document.createElement('p');
        mensaje.className = 'sugerencia-mensaje';
        mensaje.textContent = item.mensaje;

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(fecha);
        tarjeta.appendChild(mensaje);

        return tarjeta;
    }

    function renderizarMensajes() {
        const mensajes = cargarMensajes();
        contenedor.innerHTML = '';

        if (!mensajes.length) {
            const vacio = document.createElement('p');
            vacio.className = 'sugerencia-vacio';
            vacio.textContent = 'Todavía no hay mensajes. ¡Sé el primero en dejar una sugerencia!';
            contenedor.appendChild(vacio);
            return;
        }

        mensajes
            .slice()
            .reverse()
            .forEach((item) => contenedor.appendChild(crearTarjeta(item)));
    }

    function enviarMensaje() {
        const titulo = inputTitulo.value.trim();
        const mensaje = inputMensaje.value.trim();

        if (!titulo || !mensaje) {
            mostrarToast('Completá el título y el mensaje antes de enviar.');
            return;
        }

        const mensajes = cargarMensajes();
        mensajes.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            titulo,
            mensaje,
            fecha: new Date().toISOString(),
        });

        guardarMensajes(mensajes);
        renderizarMensajes();

        inputTitulo.value = '';
        inputMensaje.value = '';
        inputTitulo.focus();

        mostrarToast('¡Gracias! Tu sugerencia fue enviada al Centro de Estudiantes.');
    }

    function borrarCampos() {
        inputTitulo.value = '';
        inputMensaje.value = '';
        inputTitulo.focus();
    }

    btnEnviar.addEventListener('click', enviarMensaje);

    if (btnBorrar) {
        btnBorrar.addEventListener('click', borrarCampos);
    }

    inputMensaje.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            enviarMensaje();
        }
    });

    renderizarMensajes();
})();
