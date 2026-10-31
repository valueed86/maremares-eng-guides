/* ================================================================
   MAREMARES ENGLISH GUIDE — welcome.js
   Módulo 1: Welcome & Seating
   
   FUNCIONES:
   - setupTabs()            → Pestañas internas
   - setupAudio()           → Web Speech API (pronunciación real)
   - setupFillExercise()    → Completar oraciones + word bank clicable
   - setupMCExercise()      → Selección múltiple
   - setupFlashcards()      → Tarjetas giratorias 3D
   - playFeedbackSound()    → Sonido de acierto / error (Web Audio API)
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {
    setupTabs();
    setupAudio();
    setupVocabFilter();
    setupPillsScroll();
    setupFillExercise();
    setupMCExercise();
    setupFlashcards();
});


/* ================================================================
   MÓDULO 1: SISTEMA DE PESTAÑAS
   ================================================================ */
function setupTabs() {
    const botones = document.querySelectorAll('.tab-btn');
    const paneles = document.querySelectorAll('.tab-panel');

    botones.forEach(function (boton) {
        boton.addEventListener('click', function () {
            botones.forEach(function (btn) {
                btn.classList.remove('tab-btn--active');
                btn.setAttribute('aria-selected', 'false');
            });
            paneles.forEach(function (panel) {
                panel.classList.remove('tab-panel--active');
            });

            boton.classList.add('tab-btn--active');
            boton.setAttribute('aria-selected', 'true');

            const panelActivo = document.getElementById('panel-' + boton.dataset.tab);
            if (panelActivo) panelActivo.classList.add('tab-panel--active');

            const tabBar = document.querySelector('.tab-bar');
            if (tabBar) {
                const headerH = window.innerWidth <= 600 ? 60 : 72;
                const tabTop = tabBar.getBoundingClientRect().top + window.pageYOffset;
                if (window.pageYOffset > tabTop - headerH) {
                    window.scrollTo({
                        top: tabTop - headerH,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}


/* ================================================================
   MÓDULO 2: WEB SPEECH API — PRONUNCIACIÓN REAL
   ================================================================
   
   Igual que en main.js del index: hablarPalabra() usa la API nativa
   del navegador sin ningún servidor externo.

   Los botones de audio (.audio-btn) están junto a un elemento con
   la clase .vocab-card__en o .bubble__text que contiene el texto
   en inglés. El JS lo lee automáticamente al hacer clic.
   ================================================================ */

/* Verificamos si el navegador soporta Web Speech */
var speechSoportado = 'speechSynthesis' in window;

function hablarTexto(texto) {
    if (!speechSoportado) {
        console.warn('Web Speech API no disponible en este navegador.');
        return null;
    }

    /* Cancelar cualquier pronunciación anterior */
    window.speechSynthesis.cancel();

    var utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang  = 'en-US';
    utterance.rate  = 0.85;
    utterance.pitch = 1.0;

    /* Intentamos seleccionar una voz en-US explícitamente */
    var voces = window.speechSynthesis.getVoices();
    var vozEnUS = voces.find(function (v) { return v.lang === 'en-US'; })
               || voces.find(function (v) { return v.lang.startsWith('en'); });

    if (vozEnUS) utterance.voice = vozEnUS;

    window.speechSynthesis.speak(utterance);
    return utterance;
}

/* Las voces pueden no estar listas inmediatamente al cargar.
   Este evento asegura que se carguen antes de que el usuario haga clic. */
if (speechSoportado && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function () {};
}

function setupAudio() {
    /* 1. Botones de audio individuales */
    var botonesAudio = document.querySelectorAll('.audio-btn');
    botonesAudio.forEach(function (boton) {
        boton.addEventListener('click', function (evento) {
            evento.stopPropagation();

            var textoEN = obtenerTextoEN(boton);
            if (!textoEN) return;

            var utterance = hablarTexto(textoEN);
            if (utterance) {
                activarEstadoAudio(boton, utterance);
            }
        });
    });

    /* 2. Clic en toda la tarjeta de vocabulario para reproducción instantánea */
    var tarjetasVocab = document.querySelectorAll('.vocab-card');
    tarjetasVocab.forEach(function (tarjeta) {
        tarjeta.addEventListener('click', function () {
            var enEl = tarjeta.querySelector('.vocab-card__en');
            if (!enEl) return;
            var texto = enEl.textContent.trim();
            var boton = tarjeta.querySelector('.audio-btn');

            var utterance = hablarTexto(texto);
            if (utterance) {
                tarjeta.classList.add('is-speaking');
                if (boton) boton.classList.add('is-playing');

                utterance.onend = function () {
                    tarjeta.classList.remove('is-speaking');
                    if (boton) boton.classList.remove('is-playing');
                };
                utterance.onerror = function () {
                    tarjeta.classList.remove('is-speaking');
                    if (boton) boton.classList.remove('is-playing');
                };
            }
        });
    });

    /* 3. Clic en alergias interactivas para escuchar pronunciación */
    var itemsAlergia = document.querySelectorAll('.allergy-item');
    itemsAlergia.forEach(function (item) {
        function reproducirAlergia() {
            var enEl = item.querySelector('.allergy-en');
            if (!enEl) return;
            var texto = enEl.textContent.trim();

            var utterance = hablarTexto(texto);
            if (utterance) {
                item.classList.add('is-speaking');
                utterance.onend = function () { item.classList.remove('is-speaking'); };
                utterance.onerror = function () { item.classList.remove('is-speaking'); };
            }
        }

        item.addEventListener('click', reproducirAlergia);
        item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                reproducirAlergia();
            }
        });
    });

    /* 4. Clic en utensilios para escuchar pronunciación */
    var itemsUtensilio = document.querySelectorAll('.utensil-item');
    itemsUtensilio.forEach(function (item) {
        function reproducirUtensilio() {
            var enEl = item.querySelector('.utensil-en');
            if (!enEl) return;
            var texto = enEl.textContent.trim();

            var utterance = hablarTexto(texto);
            if (utterance) {
                item.classList.add('is-speaking');
                utterance.onend = function () { item.classList.remove('is-speaking'); };
                utterance.onerror = function () { item.classList.remove('is-speaking'); };
            }
        }

        item.addEventListener('click', reproducirUtensilio);
        item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                reproducirUtensilio();
            }
        });
    });
}

/*
   FUNCIÓN: obtenerTextoEN(boton)
   -----------------------------------------------
   Busca el texto en inglés más cercano al botón de audio.
   Soporta tres contextos distintos del HTML:
   1. Tarjeta de vocabulario (.vocab-card__en)
   2. Burbuja de diálogo del mesero (.bubble__text)
*/
function obtenerTextoEN(boton) {
    /* Contexto 1: tarjeta de vocabulario */
    var tarjeta = boton.closest('.vocab-card');
    if (tarjeta) {
        var enEl = tarjeta.querySelector('.vocab-card__en');
        return enEl ? enEl.textContent.trim() : null;
    }

    /* Contexto 2: burbuja de diálogo (servidor/mesero) */
    var burbuja = boton.closest('.bubble');
    if (burbuja) {
        var textoEl = burbuja.querySelector('.bubble__text');
        return textoEl ? textoEl.textContent.trim().replace(/["""]/g, '') : null;
    }

    return null;
}

function activarEstadoAudio(boton, utterance) {
    boton.classList.add('is-playing');

    utterance.onend = function () {
        boton.classList.remove('is-playing');
    };
    utterance.onerror = function (e) {
        boton.classList.remove('is-playing');
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn('Error de voz:', e.error);
        }
    };
}


/* ================================================================
   MÓDULO 2.1: BUSCADOR EN TIEMPO REAL Y FILTRADO POR CATEGORÍAS
   ================================================================
   Permite al personal del hotel encontrar rápidamente cualquier
   frase o palabra escribiendo en español o en inglés, o filtrando
   por píldoras de área (Mesa, Pedido, Bebidas, Carne, etc.).
   ================================================================ */
function setupVocabFilter() {
    var searchInput = document.getElementById('vocabSearch');
    var clearBtn = document.getElementById('vocabSearchClear');
    var pills = document.querySelectorAll('.vocab-pill');
    var countEl = document.getElementById('vocabCount');
    var emptyState = document.getElementById('vocabEmptyState');
    var emptyQuerySpan = document.getElementById('vocabEmptyQuery');
    var resetBtn = document.getElementById('vocabResetSearch');

    var sections = document.querySelectorAll('.vocab-section');
    var allergyList = document.querySelector('.allergy-list');

    var currentCategory = 'all';
    var currentSearch = '';

    function aplicarFiltros() {
        var totalVisibles = 0;
        var term = currentSearch.trim().toLowerCase();

        sections.forEach(function (sec) {
            var secCat = sec.dataset.category || '';
            var matchCategory = (currentCategory === 'all' || currentCategory === secCat);

            var cards = sec.querySelectorAll('.vocab-card');
            var secCardsVisibles = 0;

            cards.forEach(function (card) {
                if (!matchCategory) {
                    card.classList.add('is-hidden');
                    return;
                }

                if (!term) {
                    card.classList.remove('is-hidden');
                    secCardsVisibles++;
                    totalVisibles++;
                    return;
                }

                var esEl = card.querySelector('.vocab-card__es');
                var enEl = card.querySelector('.vocab-card__en');
                var esText = esEl ? esEl.textContent.toLowerCase() : '';
                var enText = enEl ? enEl.textContent.toLowerCase() : '';

                if (esText.indexOf(term) !== -1 || enText.indexOf(term) !== -1) {
                    card.classList.remove('is-hidden');
                    secCardsVisibles++;
                    totalVisibles++;
                } else {
                    card.classList.add('is-hidden');
                }
            });

            /* Manejo de utensilios */
            var utensils = sec.querySelectorAll('.utensil-item');
            var secUtensilsVisibles = 0;
            if (utensils.length > 0) {
                var matchUtensilsCat = (currentCategory === 'all' || currentCategory === 'utensils');
                utensils.forEach(function (u) {
                    if (!matchUtensilsCat) {
                        u.classList.add('is-hidden');
                        return;
                    }
                    if (!term) {
                        u.classList.remove('is-hidden');
                        secUtensilsVisibles++;
                        totalVisibles++;
                        return;
                    }
                    var esEl = u.querySelector('.utensil-es');
                    var enEl = u.querySelector('.utensil-en');
                    var es = esEl ? esEl.textContent.toLowerCase() : '';
                    var en = enEl ? enEl.textContent.toLowerCase() : '';
                    if (es.indexOf(term) !== -1 || en.indexOf(term) !== -1) {
                        u.classList.remove('is-hidden');
                        secUtensilsVisibles++;
                        totalVisibles++;
                    } else {
                        u.classList.add('is-hidden');
                    }
                });
            }

            /* Ocultar sección si no tiene items coincidentes */
            var totalSecVisibles = secCardsVisibles + secUtensilsVisibles;
            if (totalSecVisibles === 0 && (currentCategory !== 'all' || term !== '')) {
                sec.classList.add('is-hidden');
            } else {
                sec.classList.remove('is-hidden');
            }
        });

        /* Manejo de lista de alergias */
        if (allergyList) {
            var matchAllergiesCat = (currentCategory === 'all' || currentCategory === 'allergies');
            var allergyItems = allergyList.querySelectorAll('.allergy-item');
            var allergiesVisibles = 0;

            allergyItems.forEach(function (item) {
                if (!matchAllergiesCat) {
                    item.classList.add('is-hidden');
                    return;
                }
                if (!term) {
                    item.classList.remove('is-hidden');
                    allergiesVisibles++;
                    totalVisibles++;
                    return;
                }
                var esEl = item.querySelector('.allergy-es');
                var enEl = item.querySelector('.allergy-en');
                var es = esEl ? esEl.textContent.toLowerCase() : '';
                var en = enEl ? enEl.textContent.toLowerCase() : '';
                if (es.indexOf(term) !== -1 || en.indexOf(term) !== -1) {
                    item.classList.remove('is-hidden');
                    allergiesVisibles++;
                    totalVisibles++;
                } else {
                    item.classList.add('is-hidden');
                }
            });

            if (allergiesVisibles === 0 && (currentCategory !== 'all' || term !== '')) {
                allergyList.classList.add('is-hidden');
            } else {
                allergyList.classList.remove('is-hidden');
            }
        }

        /* Actualizar contador */
        if (countEl) countEl.textContent = totalVisibles;

        /* Estado vacío */
        if (emptyState) {
            if (totalVisibles === 0) {
                emptyState.style.display = 'block';
                if (emptyQuerySpan) emptyQuerySpan.textContent = currentSearch || currentCategory;
            } else {
                emptyState.style.display = 'none';
            }
        }

        /* Botón de limpiar búsqueda */
        if (clearBtn) {
            clearBtn.style.display = (searchInput && searchInput.value.length > 0) ? 'flex' : 'none';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentSearch = searchInput.value;
            aplicarFiltros();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (searchInput) {
                searchInput.value = '';
                currentSearch = '';
                searchInput.focus();
                aplicarFiltros();
            }
        });
    }

    pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            pills.forEach(function (p) { p.classList.remove('vocab-pill--active'); });
            pill.classList.add('vocab-pill--active');
            currentCategory = pill.dataset.filter || 'all';
            aplicarFiltros();
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (searchInput) {
                searchInput.value = '';
                currentSearch = '';
            }
            currentCategory = 'all';
            pills.forEach(function (p) {
                if (p.dataset.filter === 'all') p.classList.add('vocab-pill--active');
                else p.classList.remove('vocab-pill--active');
            });
            aplicarFiltros();
        });
    }

    /* Inicializar conteo exacto y visualización en la primera carga */
    aplicarFiltros();
}


/* ================================================================
   MÓDULO 2.2: DESPLAZAMIENTO HORIZONTAL FLUIDO DE PÍLDORAS
   ================================================================
   Permite al usuario deslizar los filtros rápidamente con:
   - Rueda del ratón (scroll vertical convertido a horizontal)
   - Arrastre con clic sostenido (drag to scroll con cursor)
   - Deslizamiento táctil natural en móviles
   ================================================================ */
function setupPillsScroll() {
    var scrollContainer = document.querySelector('.vocab-pills-scroll');
    if (!scrollContainer) return;

    /* 1. Desplazamiento con la rueda del ratón (mouse wheel) */
    scrollContainer.addEventListener('wheel', function (e) {
        if (e.deltaY !== 0) {
            e.preventDefault();
            scrollContainer.scrollLeft += (e.deltaY * 0.9);
        }
    }, { passive: false });

    /* 2. Arrastre con clic sostenido (Drag to scroll) */
    var isDown = false;
    var startX = 0;
    var scrollLeft = 0;
    var hasMoved = false;

    scrollContainer.addEventListener('mousedown', function (e) {
        isDown = true;
        hasMoved = false;
        scrollContainer.classList.add('is-dragging');
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
    });

    scrollContainer.addEventListener('mouseleave', function () {
        if (!isDown) return;
        isDown = false;
        scrollContainer.classList.remove('is-dragging');
    });

    scrollContainer.addEventListener('mouseup', function () {
        if (!isDown) return;
        isDown = false;
        scrollContainer.classList.remove('is-dragging');
    });

    scrollContainer.addEventListener('mousemove', function (e) {
        if (!isDown) return;
        e.preventDefault();
        var x = e.pageX - scrollContainer.offsetLeft;
        var walk = (x - startX) * 1.4;
        if (Math.abs(walk) > 4) {
            hasMoved = true;
        }
        scrollContainer.scrollLeft = scrollLeft - walk;
    });

    /* Evitar que se active el filtro accidentalmente si el usuario estaba arrastrando */
    var pills = scrollContainer.querySelectorAll('.vocab-pill');
    pills.forEach(function (pill) {
        pill.addEventListener('click', function (e) {
            if (hasMoved) {
                e.stopPropagation();
                e.preventDefault();
                hasMoved = false;
            }
        }, true);
    });
}


/* ================================================================
   MÓDULO 3: SONIDOS DE FEEDBACK (Web Audio API sintetizada)
   ================================================================
   
   No usamos archivos .mp3 externos: generamos los tonos en tiempo
   real con la API de Audio del navegador (OscillatorNode).
   
   playFeedbackSound('correct') → tono ascendente agradable (acierto)
   playFeedbackSound('wrong')   → tono grave disonante (error)
   ================================================================ */

function playFeedbackSound(tipo) {
    try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        var ctx = new AudioCtx();

        if (tipo === 'correct') {
            /* Dos tonos ascendentes en secuencia: sol → do */
            tocarNota(ctx, 523, 0,    0.15); /* Do5 */
            tocarNota(ctx, 659, 0.15, 0.15); /* Mi5 */
            tocarNota(ctx, 784, 0.30, 0.25); /* Sol5 */
        } else {
            /* Tono grave y corto: buzz de error */
            tocarNota(ctx, 220, 0,    0.12, 'sawtooth');
            tocarNota(ctx, 180, 0.12, 0.18, 'sawtooth');
        }

        /* Cerramos el contexto después de 1s para liberar memoria */
        setTimeout(function () { ctx.close(); }, 1000);

    } catch (e) {
        /* Si el navegador bloquea el audio por política de autoplay, lo ignoramos */
        console.warn('Audio de feedback no disponible:', e.message);
    }
}

function tocarNota(ctx, frecuencia, inicio, duracion, forma) {
    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type      = forma || 'sine';
    osc.frequency.setValueAtTime(frecuencia, ctx.currentTime + inicio);

    gain.gain.setValueAtTime(0.25, ctx.currentTime + inicio);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicio + duracion);

    osc.start(ctx.currentTime + inicio);
    osc.stop(ctx.currentTime + inicio + duracion);
}


/* ================================================================
   MÓDULO 4: EJERCICIO COMPLETAR ESPACIOS + WORD BANK CLICABLE
   ================================================================
   
   WORD BANK CLICABLE:
   Cada botón .wordbank__word tiene data-word="welcome" etc.
   Al hacer clic, la palabra se inserta en el primer input vacío
   que esté sin responder (buscamos de izquierda a derecha).
   
   Si todos los inputs ya tienen texto, no hace nada.
   ================================================================ */

function setupFillExercise() {
    var btnCheck  = document.getElementById('checkFill');
    var btnReset  = document.getElementById('resetFill');
    var feedback  = document.getElementById('fillFeedback');
    var wordBtns  = document.querySelectorAll('.wordbank__word');
    var inputs    = document.querySelectorAll('#fillForm .fill-input');

    if (!btnCheck) return;

    /* ── Word bank: insertar palabra en el primer input vacío ── */
    wordBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var palabra = btn.dataset.word;

            /* Buscamos el primer input que esté vacío */
            var inputVacio = null;
            inputs.forEach(function (inp) {
                if (!inputVacio && inp.value.trim() === '') {
                    inputVacio = inp;
                }
            });

            if (inputVacio) {
                inputVacio.value = palabra;
                /* Pronunciamos la palabra al insertarla */
                hablarTexto(palabra);
                /* Efecto visual en el botón de la word bank */
                btn.classList.add('wordbank__word--used');
                setTimeout(function () {
                    btn.classList.remove('wordbank__word--used');
                }, 600);
            }
        });
    });

    /* ── Comprobar respuestas ── */
    btnCheck.addEventListener('click', function () {
        var correctas = 0;
        var total     = inputs.length;

        inputs.forEach(function (input) {
            var respuesta = input.value.trim().toLowerCase();
            var correcta  = input.dataset.answer.toLowerCase();

            input.classList.remove('correct', 'wrong');

            if (respuesta === correcta) {
                input.classList.add('correct');
                correctas++;
            } else {
                input.classList.add('wrong');
            }
        });

        var todasCorrectas = correctas === total;
        playFeedbackSound(todasCorrectas ? 'correct' : 'wrong');

        feedback.textContent = correctas + ' de ' + total + ' correctas' + (todasCorrectas ? '. ¡Excelente!' : '. Revisa los marcados en rojo.');
        feedback.className   = 'exercise-feedback ' + (todasCorrectas ? 'correct' : 'wrong');
    });

    /* ── Reiniciar ── */
    btnReset.addEventListener('click', function () {
        inputs.forEach(function (input) {
            input.value = '';
            input.classList.remove('correct', 'wrong');
        });
        feedback.textContent = '';
        feedback.className   = 'exercise-feedback';
    });
}


/* ================================================================
   MÓDULO 5: SELECCIÓN MÚLTIPLE
   ================================================================ */
function setupMCExercise() {
    var btnCheck = document.getElementById('checkMC');
    var btnReset = document.getElementById('resetMC');
    var feedback = document.getElementById('mcFeedback');

    if (!btnCheck) return;

    var respuestasCorrectas = { q1: 'a', q2: 'a', q3: 'b' };

    btnCheck.addEventListener('click', function () {
        var correctas = 0;
        var total     = Object.keys(respuestasCorrectas).length;

        Object.entries(respuestasCorrectas).forEach(function (par) {
            var pregunta = par[0];
            var correcta = par[1];

            var opciones = document.querySelectorAll('[name="' + pregunta + '"]');
            opciones.forEach(function (r) {
                var label = r.closest('.mc-option');
                if (label) label.classList.remove('correct', 'wrong');
            });

            var seleccionado = document.querySelector('[name="' + pregunta + '"]:checked');
            if (!seleccionado) return;

            var labelSel = seleccionado.closest('.mc-option');
            if (seleccionado.value === correcta) {
                if (labelSel) labelSel.classList.add('correct');
                correctas++;
            } else {
                if (labelSel) labelSel.classList.add('wrong');
                var radioCorr = document.querySelector('[name="' + pregunta + '"][value="' + correcta + '"]');
                if (radioCorr) {
                    var labelCorr = radioCorr.closest('.mc-option');
                    if (labelCorr) labelCorr.classList.add('correct');
                }
            }
        });

        var todasCorrectas = correctas === total;
        playFeedbackSound(todasCorrectas ? 'correct' : 'wrong');

        feedback.textContent = correctas + ' de ' + total + ' correctas' + (todasCorrectas ? '. ¡Perfecto!' : '.');
        feedback.className   = 'exercise-feedback ' + (todasCorrectas ? 'correct' : 'wrong');
    });

    btnReset.addEventListener('click', function () {
        document.querySelectorAll('#mcForm input[type="radio"]').forEach(function (r) { r.checked = false; });
        document.querySelectorAll('#mcForm .mc-option').forEach(function (l) { l.classList.remove('correct', 'wrong'); });
        feedback.textContent = '';
        feedback.className   = 'exercise-feedback';
    });
}


/* ================================================================
   MÓDULO 6: FLASHCARDS — TARJETAS GIRATORIAS 3D
   ================================================================ */
function setupFlashcards() {
    var tarjetas = document.querySelectorAll('.flashcard');

    tarjetas.forEach(function (tarjeta) {
        tarjeta.addEventListener('click', function () { voltear(tarjeta); });

        tarjeta.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                voltear(tarjeta);
            }
        });
    });
}

function voltear(tarjeta) {
    tarjeta.classList.toggle('flipped');

    var estaVolteada = tarjeta.classList.contains('flipped');
    var textoActual = estaVolteada
        ? tarjeta.querySelector('.flashcard__back p').textContent
        : tarjeta.querySelector('.flashcard__front p').textContent;

    tarjeta.setAttribute('aria-label', textoActual + ' — clic para voltear');

    /* Al voltear al inglés, lo pronunciamos automáticamente */
    if (estaVolteada) {
        var textoIngles = tarjeta.querySelector('.flashcard__back p').textContent;
        hablarTexto(textoIngles);
    }
}
