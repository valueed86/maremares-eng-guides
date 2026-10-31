/* ================================================================
   MAREMARES ENGLISH GUIDE — main.js
   Lógica de animaciones con IntersectionObserver

   📌 NOTA PARA EL APRENDIZ:
   Este archivo usa JavaScript "puro" (Vanilla JS), sin frameworks.
   Te explicaré cada paso como si lo vieras por primera vez.
   ================================================================ */


/* ----------------------------------------------------------------
   ¿QUÉ ES UN IntersectionObserver?

   Imagina que tienes una "cámara" invisible apuntando a tu pantalla.
   El IntersectionObserver es esa cámara: vigila ciertos elementos del
   HTML y "dispara" una función automáticamente cuando el usuario
   hace scroll y esos elementos entran o salen del área visible.

   Esto nos permite crear la animación "aparece al hacer scroll" sin
   necesidad de escuchar el evento scroll manualmente (que es más lento
   y consume más batería en el teléfono).
   ---------------------------------------------------------------- */


/* ================================================================
   PARTE 1: ESPERAR A QUE EL HTML ESTÉ COMPLETAMENTE CARGADO
   ================================================================ */

/* 
   'DOMContentLoaded' es un evento que el navegador dispara cuando
   terminó de leer y construir todo el HTML de la página.
   
   Envolvemos TODO nuestro código dentro de este listener porque:
   → Si ejecutamos JS antes de que el HTML esté listo,
     intentaremos "buscar" elementos que todavía no existen.
   → Resultado: errores silenciosos o animaciones que nunca funcionan.
*/
document.addEventListener('DOMContentLoaded', function () {

    /* Punto de entrada: llamamos a cada función que configura
       las distintas partes de la interactividad. */
    setupScrollAnimations();

});


/* ================================================================
   PARTE 2: CONFIGURAR LAS ANIMACIONES DE SCROLL
   ================================================================ */

function setupScrollAnimations() {

    /*
       ── PASO 1: SELECCIONAR LOS ELEMENTOS A ANIMAR ──

       'document.querySelectorAll' busca en todo el HTML TODOS los
       elementos que coincidan con el selector CSS entre comillas.
       
       Devuelve un "NodeList": algo parecido a un array (lista) con
       todos los elementos encontrados.
       
       En nuestro caso, busca todos los elementos que tienen
       la clase CSS '.reveal-element' (que definimos en el CSS
       con opacity:0 y translateY(28px), es decir, invisibles).
       
       Elementos que tienen esa clase en nuestro HTML:
         - El título "MÓDULOS POR ÁREA DE TRABAJO" (dentro de .modules-header)
         - Las 4 tarjetas (.module-card)
    */
    const elementosAAnimar = document.querySelectorAll('.reveal-element');

    /*
       Si por alguna razón no hay elementos con esa clase en el HTML,
       salimos de la función para evitar errores.
       'return' detiene la ejecución de la función inmediatamente.
    */
    if (elementosAAnimar.length === 0) return;


    /*
       ── PASO 2: DEFINIR LAS OPCIONES DEL OBSERVER ──

       Antes de crear el observer, le decimos cómo debe comportarse
       mediante un objeto de "opciones" (objeto = { clave: valor }).
    */
    const opcionesObserver = {

        /*
           'root': null
           Significa "usa el viewport del navegador (la pantalla visible)
           como área de referencia". Si pusieramos un elemento específico,
           vigilaría la intersección dentro de ese elemento.
        */
        root: null,

        /*
           'rootMargin': '-80px 0px -40px 0px'
           Es como un margen que añadimos al área de referencia.
           Formato: arriba / derecha / abajo / izquierda (igual que CSS margin).
           
           '-80px' arriba: el elemento debe entrar 80px dentro del viewport
           para ser considerado "visible". Esto hace que la animación
           dispare un poco ANTES de que el elemento llegue totalmente al centro,
           dando un efecto más fluido.
           
           '-40px' abajo: el elemento se considera "fuera" cuando le faltan
           40px para salir por abajo (no queremos re-animar si el usuario
           sube el scroll de vuelta).
        */
        rootMargin: '-80px 0px -40px 0px',

        /*
           'threshold': 0
           Porcentaje del elemento que debe ser visible para disparar el callback.
           0 = dispara en cuanto cualquier píxel del elemento sea visible.
           1 = dispara solo cuando el elemento está completamente visible.
           0.25 = dispara cuando el 25% del elemento es visible.
        */
        threshold: 0,
    };


    /*
       ── PASO 3: CREAR EL IntersectionObserver ──

       new IntersectionObserver(callback, opciones) crea el observador.
       
       'callback' es la función que se ejecutará CADA VEZ que un elemento
       observado entre o salga del viewport.
       
       Esta función recibe automáticamente un parámetro 'entradas':
       un array con información de todos los elementos que cambiaron
       de estado en ese "tick" de observación.
    */
    const observer = new IntersectionObserver(function (entradas) {

        /*
           Iteramos (recorremos) cada entrada del array.
           'entrada' representa un elemento que el observer está vigilando
           y que acaba de "cambiar de estado" (entró o salió del viewport).
        */
        entradas.forEach(function (entrada, indice) {

            /*
               'entrada.isIntersecting' es un booleano (true/false).
               → true:  el elemento ENTRÓ en el área visible del viewport.
               → false: el elemento SALIÓ del área visible.
               
               Solo actuamos cuando el elemento es visible (true).
            */
            if (entrada.isIntersecting) {

                /*
                   'entrada.target' es el elemento HTML real del DOM que
                   acaba de volverse visible.
                   
                   Aquí usamos 'setTimeout' para crear la animación ESCALONADA.
                   
                   setTimeout(función, milisegundos): espera X milisegundos
                   antes de ejecutar la función.
                   
                   El truco: multiplicamos el índice por 120 milisegundos.
                   → Elemento 0 (título):  espera 0ms   → aparece inmediatamente
                   → Tarjeta 1:            espera 120ms → aparece 0.12s después
                   → Tarjeta 2:            espera 240ms → aparece 0.24s después
                   → Tarjeta 3:            espera 360ms → aparece 0.36s después
                   → Tarjeta 4:            espera 480ms → aparece 0.48s después
                   
                   Resultado: las tarjetas "caen" en cascada, una tras otra.
                */
                setTimeout(function () {

                    /*
                       Añadimos la clase 'is-visible' al elemento.
                       Recuerda: en el CSS definimos:
                         .reveal-element.is-visible { opacity: 1; transform: translateY(0) }
                       
                       Al añadir esta clase, el CSS transiciona el elemento
                       de invisible (opacity: 0) a visible (opacity: 1)
                       y de desplazado (translateY(28px)) a su posición normal.
                    */
                    entrada.target.classList.add('is-visible');

                    /*
                       Una vez que el elemento ya es visible y fue animado,
                       dejamos de observarlo. No tiene sentido seguir vigilando
                       algo que ya hizo lo que tenía que hacer.
                       
                       Esto también mejora el rendimiento: el observer tiene
                       menos elementos que monitorizar.
                    */
                    observer.unobserve(entrada.target);

                }, indice * 120); /* ← 120ms de delay entre cada elemento */

            } /* fin del if (entrada.isIntersecting) */

        }); /* fin del forEach */

    }, opcionesObserver); /* ← Le pasamos las opciones al crear el observer */


    /*
       ── PASO 4: DECIRLE AL OBSERVER QUÉ ELEMENTOS VIGILAR ──

       Tenemos el observer creado, pero todavía no sabe QUÉ vigilar.
       Debemos "registrar" cada elemento con observer.observe(elemento).
       
       Usamos forEach para hacerlo sobre todos los elementos de nuestra
       lista 'elementosAAnimar' que seleccionamos en el PASO 1.
    */
    elementosAAnimar.forEach(function (elemento) {
        /*
           'observer.observe(elemento)' le dice al IntersectionObserver:
           "Empieza a vigilar este elemento. Cuando entre o salga del
           viewport, dispara el callback."
        */
        observer.observe(elemento);
    });

    /* 
       ¡Y eso es todo! El observer ya está activo y en segundo plano.
       No necesitamos hacer nada más: el navegador se encarga
       de llamar a nuestro callback automáticamente.
    */

} /* fin de setupScrollAnimations() */



/* ================================================================
   MÓDULO: VOCABULARIO INTERACTIVO CON WEB SPEECH API
   ----------------------------------------------------------------
   ¿QUÉ ES LA WEB SPEECH API?
   Es una herramienta que viene INCLUIDA en los navegadores modernos
   (Chrome, Edge, Safari, Firefox). Permite sintetizar voz a partir
   de texto sin necesidad de servidores ni APIs externas.

   Funciona así:
   1. Creamos un objeto SpeechSynthesisUtterance (= "enunciado a hablar")
   2. Le decimos qué texto hablar, en qué idioma y a qué velocidad
   3. Llamamos a window.speechSynthesis.speak(utterance) y el navegador lo dice

   ⚠️  NOTA SOBRE BRAVE BROWSER:
   Brave bloquea la Web Speech API por defecto como medida anti-rastreo
   (la API puede usarse para fingerprinting). Para activarla en Brave:
   → Haz clic en el ícono del León (🦁) en la barra de dirección
   → Cambia "Fingerprinting blocked" a "Allow all fingerprinting"
   → Solo para este sitio (no afecta otros)
   El código detecta si Brave bloqueó las voces y muestra un aviso amigable.
   ================================================================ */


/* ----------------------------------------------------------------
   FUNCIÓN: detectarBrave()
   ----------------------------------------------------------------
   Brave no tiene una propiedad oficial que lo identifique, pero sí
   expone navigator.brave como objeto con un método isBrave().
   Usamos esto para mostrar un aviso útil al usuario.
   ---------------------------------------------------------------- */
async function detectarBrave() {
    /* navigator.brave existe SOLO en Brave Browser */
    if (navigator.brave && await navigator.brave.isBrave()) {
        return true;
    }
    return false;
}


/* ----------------------------------------------------------------
   FUNCIÓN: mostrarAvisoBrave(seccion)
   ----------------------------------------------------------------
   Inserta un banner informativo en la sección de vocabulario
   cuando detectamos que estamos en Brave con el audio bloqueado.
   ---------------------------------------------------------------- */
function mostrarAvisoBrave(seccion) {
    /* Creamos el elemento del aviso */
    const aviso = document.createElement('div');
    aviso.className = 'vocab-brave-notice';
    /* innerHTML: estructura HTML dentro del elemento creado */
    aviso.innerHTML = `
        <span class="vocab-brave-notice__icon" aria-hidden="true">🦁</span>
        <p>
            <strong>Brave Browser detectado.</strong>
            El audio puede estar bloqueado. Para activarlo:
            clic en el León → <em>Fingerprinting blocked</em> → selecciona
            <strong>"Allow all fingerprinting"</strong> para este sitio.
        </p>
        <button class="vocab-brave-notice__close" aria-label="Cerrar aviso">✕</button>
    `;

    /* Insertamos el aviso justo antes del grid de tarjetas */
    const grid = seccion.querySelector('#vocabGrid');
    if (grid) {
        seccion.insertBefore(aviso, grid);
    }

    /* Botón de cierre: cuando el usuario lo presiona, ocultamos el aviso */
    aviso.querySelector('.vocab-brave-notice__close').addEventListener('click', function () {
        aviso.remove();
    });
}


/* ----------------------------------------------------------------
   FUNCIÓN: verificarVocesDisponibles()
   ----------------------------------------------------------------
   La Web Speech API puede estar presente en el objeto window pero
   aún así no tener voces cargadas (pasa en Brave bloqueado y en
   algunos navegadores antes de que el sistema operativo las exponga).
   Esta función devuelve una promesa que resuelve con true/false.
   ---------------------------------------------------------------- */
function verificarVocesDisponibles() {
    return new Promise(function (resolve) {
        /* Caso 1: Ya hay voces cargadas inmediatamente */
        if (window.speechSynthesis.getVoices().length > 0) {
            resolve(true);
            return;
        }

        /* Caso 2: Las voces aún no cargaron, esperamos el evento onvoiceschanged.
           Si en 2 segundos no llegan, asumimos que están bloqueadas. */
        const timeout = setTimeout(function () {
            resolve(false);   /* Sin voces tras 2 seg → probablemente bloqueado */
        }, 2000);

        window.speechSynthesis.onvoiceschanged = function () {
            clearTimeout(timeout);   /* Cancelamos el timeout si llegan a tiempo */
            resolve(window.speechSynthesis.getVoices().length > 0);
        };
    });
}


/* ----------------------------------------------------------------
   FUNCIÓN: hablarPalabra(palabra)
   ----------------------------------------------------------------
   Recibe un string con la palabra en inglés y la reproduce en voz alta.
   Devuelve el utterance para manejar los estados visuales,
   o null si el audio falló.
   ---------------------------------------------------------------- */
function hablarPalabra(palabra) {
    /* Verificación de soporte básico */
    if (!('speechSynthesis' in window)) {
        console.warn('Web Speech API no disponible en este navegador.');
        return null;
    }

    /* Cancelamos cualquier reproducción previa para no superponer voces */
    window.speechSynthesis.cancel();

    /* Creamos el enunciado */
    const utterance = new SpeechSynthesisUtterance(palabra);
    utterance.lang  = 'en-US';   /* Inglés estadounidense */
    utterance.rate  = 0.85;      /* Velocidad ligeramente reducida: más clara para aprender */
    utterance.pitch = 1.0;       /* Tono neutro */

    /* Intentamos seleccionar una voz en inglés explícitamente.
       Esto mejora la consistencia entre navegadores y sistemas operativos. */
    const voces = window.speechSynthesis.getVoices();
    const vozEnIngles = voces.find(function (v) {
        /* Buscamos una voz en-US; si no hay, cualquier voz en inglés */
        return v.lang === 'en-US';
    }) || voces.find(function (v) {
        return v.lang.startsWith('en');
    });

    /* Solo asignamos la voz si encontramos una compatible */
    if (vozEnIngles) {
        utterance.voice = vozEnIngles;
    }

    /* Reproducimos */
    window.speechSynthesis.speak(utterance);
    return utterance;
}


/* ----------------------------------------------------------------
   FUNCIÓN: activarEstadoHablando(tarjeta, boton, utterance)
   ----------------------------------------------------------------
   Añade la clase CSS "is-speaking" mientras el navegador habla
   y la elimina automáticamente al terminar.
   ---------------------------------------------------------------- */
function activarEstadoHablando(tarjeta, boton, utterance) {
    tarjeta.classList.add('is-speaking');
    boton.classList.add('is-speaking');

    utterance.onend = function () {
        tarjeta.classList.remove('is-speaking');
        boton.classList.remove('is-speaking');
    };

    utterance.onerror = function (e) {
        tarjeta.classList.remove('is-speaking');
        boton.classList.remove('is-speaking');
        /* Solo logueamos el error si no fue cancelación manual */
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn('Error de voz:', e.error);
        }
    };
}


/* ----------------------------------------------------------------
   FUNCIÓN PRINCIPAL: setupVocabulario()
   ----------------------------------------------------------------
   Inicializa el módulo: detecta Brave, verifica voces disponibles
   y asigna los event listeners a todas las tarjetas.
   ---------------------------------------------------------------- */
async function setupVocabulario() {

    const seccion = document.querySelector('.vocab-test-section');
    const tarjetas = document.querySelectorAll('.vocab-card');

    /* Si la sección no existe en esta página, salimos sin error */
    if (!seccion || tarjetas.length === 0) return;

    /* ── Detección de Brave y voces ──
       Esperamos la detección antes de continuar (async/await).
       Si el audio no está disponible, mostramos el aviso. */
    const esBrave = await detectarBrave();
    const hayVoces = await verificarVocesDisponibles();

    if (esBrave && !hayVoces) {
        /* Brave con audio bloqueado: mostramos el aviso informativo */
        mostrarAvisoBrave(seccion);
    }

    /* ── Event listeners en cada tarjeta ── */
    tarjetas.forEach(function (tarjeta) {

        const palabra = tarjeta.dataset.word;
        const boton   = tarjeta.querySelector('.vocab-speak-btn');

        /* Clic en la tarjeta completa (excepto si fue en el botón) */
        tarjeta.addEventListener('click', function (evento) {
            if (evento.target === boton || boton.contains(evento.target)) return;

            const utterance = hablarPalabra(palabra);
            if (utterance) activarEstadoHablando(tarjeta, boton, utterance);
        });

        /* Clic en el botón altavoz */
        boton.addEventListener('click', function (evento) {
            evento.stopPropagation();   /* No burbujea a la tarjeta */

            const utterance = hablarPalabra(palabra);
            if (utterance) activarEstadoHablando(tarjeta, boton, utterance);
        });

        /* Teclado: Enter o Espacio activan la tarjeta (accesibilidad) */
        tarjeta.addEventListener('keydown', function (evento) {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                const utterance = hablarPalabra(palabra);
                if (utterance) activarEstadoHablando(tarjeta, boton, utterance);
            }
        });

    }); /* fin forEach */

} /* fin setupVocabulario() */


/* ── Inicialización ── */
document.addEventListener('DOMContentLoaded', function () {
    setupVocabulario();
});

/* ----------------------------------------------------------------
   FUNCIÓN: hablarPalabra(palabra)
   ----------------------------------------------------------------
   Recibe un string con la palabra en inglés y la reproduce en voz alta.
   Devuelve la promesa implícita del utterance para poder manejar
   los estados visuales (is-speaking) con los eventos onstart/onend.
   ---------------------------------------------------------------- */
function hablarPalabra(palabra) {
    /* Paso 1: Verificar que el navegador soporta Web Speech API.
       Algunos navegadores muy antiguos no la tienen. */
    if (!('speechSynthesis' in window)) {
        alert('Tu navegador no soporta la reproducción de voz. Prueba con Chrome o Edge.');
        return null;
    }

    /* Paso 2: Si ya hay algo reproduciéndose, lo cancelamos primero.
       Así evitamos que las voces se superpongan si el usuario hace
       clic en varias tarjetas rápidamente. */
    window.speechSynthesis.cancel();

    /* Paso 3: Crear el "enunciado" — el objeto que contiene todo lo
       que el navegador necesita para sintetizar la voz. */
    const utterance = new SpeechSynthesisUtterance(palabra);

    /* Configuración de voz:
       - lang: 'en-US' → inglés estadounidense (pronunciación americana)
       - rate: 0.85    → velocidad ligeramente menor a la normal (1.0)
                         Ideal para aprendizaje: se escucha clara y pausada
       - pitch: 1.0    → tono neutro (1.0 = normal) */
    utterance.lang  = 'en-US';
    utterance.rate  = 0.85;
    utterance.pitch = 1.0;

    /* Paso 4: Reproducir */
    window.speechSynthesis.speak(utterance);

    /* Devolvemos el utterance para que quien llame la función
       pueda escuchar los eventos onstart y onend */
    return utterance;
}


/* ----------------------------------------------------------------
   FUNCIÓN: activarEstadoHablando(tarjeta, boton, utterance)
   ----------------------------------------------------------------
   Añade la clase CSS "is-speaking" a la tarjeta y al botón
   mientras el navegador está reproduciendo la voz.
   La clase activa el pulso animado definido en styles.css.
   ---------------------------------------------------------------- */
function activarEstadoHablando(tarjeta, boton, utterance) {
    /* Añadimos la clase visual "is-speaking" a ambos elementos */
    tarjeta.classList.add('is-speaking');
    boton.classList.add('is-speaking');

    /* utterance.onend: evento que se dispara AUTOMÁTICAMENTE cuando
       el navegador termina de hablar. Lo usamos para limpiar las clases. */
    utterance.onend = function () {
        tarjeta.classList.remove('is-speaking');
        boton.classList.remove('is-speaking');
    };

    /* utterance.onerror: si algo falla, también limpiamos las clases
       para que la tarjeta no quede "atascada" en estado activo. */
    utterance.onerror = function () {
        tarjeta.classList.remove('is-speaking');
        boton.classList.remove('is-speaking');
    };
}


/* ----------------------------------------------------------------
   FUNCIÓN PRINCIPAL: setupVocabulario()
   ----------------------------------------------------------------
   Busca todas las tarjetas de vocabulario en el DOM y les asigna
   los manejadores de eventos (event listeners) para el clic.

   Se puede llamar en cualquier momento después de que el DOM
   haya cargado (por eso la llamamos dentro del DOMContentLoaded
   que ya existe en este archivo).
   ---------------------------------------------------------------- */
function setupVocabulario() {

    /* Seleccionamos TODAS las tarjetas del vocabulario de una vez.
       querySelectorAll devuelve una NodeList (lista de elementos). */
    const tarjetas = document.querySelectorAll('.vocab-card');

    /* Si no hay tarjetas (por ejemplo, si la sección no existe en la página),
       salimos sin hacer nada para evitar errores. */
    if (tarjetas.length === 0) return;

    /* Iteramos sobre cada tarjeta con forEach */
    tarjetas.forEach(function (tarjeta) {

        /* Leemos el atributo data-word del HTML:
           <div class="vocab-card" data-word="Reservation">
           Esto nos da el texto que vamos a hablar. */
        const palabra = tarjeta.dataset.word;

        /* Localizamos el botón altavoz DENTRO de esta tarjeta específica */
        const boton = tarjeta.querySelector('.vocab-speak-btn');

        /* ── EVENTO 1: Clic en la TARJETA COMPLETA ──
           Cuando el usuario toca o hace clic en cualquier parte de la tarjeta,
           reproducimos la palabra. Esto es especialmente útil en móviles:
           el usuario simplemente toca la tarjeta sin buscar el botón. */
        tarjeta.addEventListener('click', function (evento) {
            /* Verificamos que el clic NO vino del botón (para no duplicar).
               Si el clic fue en el botón, su propio listener lo maneja. */
            if (evento.target === boton || boton.contains(evento.target)) return;

            /* Hablamos la palabra */
            const utterance = hablarPalabra(palabra);
            if (utterance) {
                activarEstadoHablando(tarjeta, boton, utterance);
            }
        });

        /* ── EVENTO 2: Clic en el BOTÓN ALTAVOZ ──
           El botón tiene stopPropagation para que el clic no suba
           a la tarjeta y duplique la reproducción. */
        boton.addEventListener('click', function (evento) {
            /* stopPropagation: "detén este clic aquí, no lo pases a la tarjeta" */
            evento.stopPropagation();

            const utterance = hablarPalabra(palabra);
            if (utterance) {
                activarEstadoHablando(tarjeta, boton, utterance);
            }
        });

        /* ── EVENTO 3: Teclado (Accesibilidad) ──
           Si el usuario navega con Tab y presiona Enter o Espacio
           sobre la tarjeta, también se reproduce. Esto cumple con
           las pautas WCAG de accesibilidad web. */
        tarjeta.addEventListener('keydown', function (evento) {
            /* KeyCode 13 = Enter, KeyCode 32 = Espacio */
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault(); /* Evita que la barra espaciadora haga scroll */
                const utterance = hablarPalabra(palabra);
                if (utterance) {
                    activarEstadoHablando(tarjeta, boton, utterance);
                }
            }
        });

    }); /* fin del forEach */

} /* fin de setupVocabulario() */


/* ----------------------------------------------------------------
   INICIALIZACIÓN
   ----------------------------------------------------------------
   Añadimos la llamada a setupVocabulario() al DOMContentLoaded
   que ya existe más arriba en este archivo. Como JS se ejecuta
   en orden, y el DOMContentLoaded ya fue registrado antes,
   simplemente registramos otro listener (puede haber varios).
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    /* Iniciamos el módulo de vocabulario interactivo */
    setupVocabulario();
});
