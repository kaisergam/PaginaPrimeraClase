(() => {
    // Como en el <head> desactivamos la restauración automática del
    // scroll del navegador, acá la ponemos nosotros a mano: si la URL
    // trae un ancla (#seccion) saltamos ahí, si no arrancamos arriba
    // del todo. Así el scroll siempre queda en un lugar predecible en
    // vez de ir arrastrando la posición de la carga anterior.
    if (location.hash) {
        const objetivo = document.getElementById(location.hash.slice(1));
        if (objetivo) {
            objetivo.scrollIntoView({ behavior: 'auto', block: 'start' });
        } else {
            window.scrollTo(0, 0);
        }
    } else {
        window.scrollTo(0, 0);
    }

    const links = Array.from(document.querySelectorAll('.nav-links a'));

    if (!links.length) {
        return;
    }

    const normalize = (value) => (value || '')
        .split('/')
        .pop()
        .split('?')[0]
        .split('#')[0]
        .toLowerCase();

    const currentPage = normalize(window.location.pathname);

    links.forEach((link) => {
        if (normalize(link.getAttribute('href')) === currentPage) {
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'page');

            if (link.closest('.dropdown-menu')) {
                link.closest('li')?.classList.add('is-current');
            }
        }
    });

    const navToggle = document.querySelector('.nav-toggle');
    const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));

    const closeDropdowns = (suppressHover = false) => {
        dropdowns.forEach((dropdown) => {
            dropdown.classList.remove('is-open');
            dropdown.classList.toggle('is-closing', suppressHover);
            dropdown.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        });
    };

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const isOpen = document.body.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));

            if (!isOpen) {
                closeDropdowns();
            }
        });
    }

    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector('.dropdown-toggle');

        if (!toggle) {
            return;
        }

        dropdown.addEventListener('mouseenter', () => {
            dropdown.classList.remove('is-closing');
        });

        dropdown.addEventListener('mouseleave', () => {
            dropdown.classList.remove('is-closing');
            dropdown.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        });

        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const wasOpen = dropdown.classList.contains('is-open');

            closeDropdowns();
            dropdown.classList.remove('is-closing');

            if (wasOpen) {
                dropdown.classList.add('is-closing');
                toggle.blur();
                return;
            }

            const isOpen = dropdown.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.nav-dropdown')) {
            closeDropdowns(true);
        }

        if (!event.target.closest('header')) {
            document.body.classList.remove('nav-open');
            navToggle?.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDropdowns();
        }
    });

    // Scroll suave solo para links que apuntan a un ancla dentro de la misma
    // página (como "Saltar al contenido principal"). Se hace a mano, en vez
    // de usar scroll-behavior:smooth en el html, porque ese estilo global
    // también hacía que la restauración automática del navegador al
    // refrescar la página se animara -y si refrescabas varias veces
    // seguidas, cada animación se sumaba a la anterior, empujando la
    // página cada vez más abajo-.
    const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

    anchorLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href')?.slice(1);
            if (!targetId) {
                return;
            }

            const target = document.getElementById(targetId);
            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const dropdownLinks = Array.from(document.querySelectorAll('.dropdown-link'));

    dropdownLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            if (link.classList.contains('is-clicked')) {
                return;
            }

            const destination = link.getAttribute('href');
            if (!destination) {
                return;
            }

            event.preventDefault();

            const rect = link.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            link.style.setProperty('--click-x', `${x}%`);
            link.style.setProperty('--click-y', `${y}%`);
            link.classList.add('is-clicked');
            link.closest('li')?.classList.add('is-clicked');

            window.setTimeout(() => {
                window.location.href = destination;
            }, 260);
        });
    });

    const updateScrolledState = () => {
        document.body.classList.toggle('is-scrolled', window.scrollY > 8);
    };

    updateScrolledState();
    window.addEventListener('scroll', updateScrolledState, { passive: true });

    window.requestAnimationFrame(() => {
        document.body.classList.add('ui-ready');
    });
})();

// La galería y el visor ampliado (lightbox) ahora se manejan por completo
// desde el <script> embebido en galeria.html -esa versión sí respeta las
// secciones/categorías (Todas, Aulas, Comunidad, etc.)-. Acá antes había
// una implementación vieja y separada, con una lista fija de sólo 4 fotos
// sin categorías, que enganchaba los mismos botones (data-gallery-prev,
// data-lightbox-next, etc.). Como las dos lógicas quedaban escuchando el
// mismo click, cada navegación disparaba AMBAS a la vez, y la de acá
// terminaba pisando el resultado correcto con su propio índice y su
// lista fija -de ahí los saltos raros y el "vuelve siempre a Todas"-. Se
// quita del todo para que quede una sola fuente de verdad.

function validarFormulario() {
    const nombre = document.getElementById('nombre');
    const email = document.getElementById('email');
    const mensaje = document.getElementById('mensaje');
    const respuesta = document.getElementById('respuesta');

    if (!nombre || !email || !mensaje || !respuesta) {
        return false;
    }

    respuesta.textContent = `Gracias, ${nombre.value.trim()}. Tu mensaje quedó listo para enviar.`;
    respuesta.classList.add('is-visible');
    return false;
}
