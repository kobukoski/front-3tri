/* ============================================================
   A ÚLTIMA MEMÓRIA DE BELLY
   game.js — Parte 1: Setup, Estado e Troca de Telas
   ============================================================ */

   'use strict';

   /* ============================================================
      ESTADO GLOBAL DO JOGO
      ============================================================ */
   const GameState = {
       // Progresso
       currentRoom: 'entrada',
       memoriesCollected: [],
       memoriesTotal: 0,
       clockTime: '3:47',
       clockHour: 3,
       clockMinute: 47,
       stability: 100, // 0 a 100
       endingsUnlocked: [],
   
       // Configurações
       settings: {
           textSpeed: 5,
           sfxVolume: 70,
           textSize: 100,
           colorblind: false,
           reducedMotion: false,
           highContrast: false
       },
   
       // Controle
       isPaused: false,
       isDialogueActive: false,
       isLoading: true,
       isFullscreen: false,
       hasSave: false,
   
       // Flags narrativas
       flags: {
           readCissaLetter: false,
           enteredBellyRoom: false,
           playedPiano: false,
           fixedMirror: false,
           wateredGarden: false,
           organizedAttic: false
       }
   };
   
   /* ============================================================
      REFERÊNCIAS AOS ELEMENTOS DO DOM
      ============================================================ */
   const DOM = {
       // Telas
       loadingScreen: document.getElementById('loading-screen'),
       mainMenu: document.getElementById('main-menu'),
       gameContainer: document.getElementById('game-container'),
       pauseMenu: document.getElementById('pause-menu'),
       journal: document.getElementById('journal'),
       map: document.getElementById('map'),
       options: document.getElementById('options'),
       credits: document.getElementById('credits'),
       endingScreen: document.getElementById('ending-screen'),
       confirmModal: document.getElementById('confirm-modal'),
   
       // Loading
       loadingBar: document.getElementById('loading-bar'),
       loadingPercent: document.getElementById('loading-percent'),
       loadingPhrase: document.getElementById('loading-phrase'),
   
       // Menu
       btnNewGame: document.getElementById('btn-new-game'),
       btnContinue: document.getElementById('btn-continue'),
       btnOptions: document.getElementById('btn-options'),
       btnCredits: document.getElementById('btn-credits'),
   
       // HUD
       clockTime: document.getElementById('clock-time'),
       candleFlame: document.getElementById('candle-flame'),
       candleLabel: document.getElementById('candle-label'),
       hudCandle: document.getElementById('hud-candle'),
       memoryCount: document.getElementById('memory-count'),
       btnJournal: document.getElementById('btn-journal'),
       btnMap: document.getElementById('btn-map'),
       btnFullscreen: document.getElementById('btn-fullscreen'),
       btnPause: document.getElementById('btn-pause'),
   
       // Diálogo
       dialogueBox: document.getElementById('dialogue-box'),
       dialogueSpeaker: document.getElementById('dialogue-speaker'),
       dialogueText: document.getElementById('dialogue-text'),
       dialogueChoices: document.getElementById('dialogue-choices'),
       dialogueContinue: document.getElementById('dialogue-continue'),
   
       // Pausa
       btnResume: document.getElementById('btn-resume'),
       btnPauseJournal: document.getElementById('btn-pause-journal'),
       btnPauseMap: document.getElementById('btn-pause-map'),
       btnPauseOptions: document.getElementById('btn-pause-options'),
       btnPauseSave: document.getElementById('btn-pause-save'),
       btnQuit: document.getElementById('btn-quit'),
   
       // Diário
       btnCloseJournal: document.getElementById('btn-close-journal'),
       journalList: document.getElementById('journal-list'),
       journalDetail: document.getElementById('journal-detail'),
   
       // Mapa
       btnCloseMap: document.getElementById('btn-close-map'),
   
       // Opções
       btnCloseOptions: document.getElementById('btn-close-options'),
       optTextSpeed: document.getElementById('opt-text-speed'),
       optTextSpeedValue: document.getElementById('opt-text-speed-value'),
       optSfxVolume: document.getElementById('opt-sfx-volume'),
       optSfxVolumeValue: document.getElementById('opt-sfx-volume-value'),
       optTextSize: document.getElementById('opt-text-size'),
       optTextSizeValue: document.getElementById('opt-text-size-value'),
       optColorblind: document.getElementById('opt-colorblind'),
       optReducedMotion: document.getElementById('opt-reduced-motion'),
       optHighContrast: document.getElementById('opt-high-contrast'),
       btnResetOptions: document.getElementById('btn-reset-options'),
   
       // Créditos
       btnCloseCredits: document.getElementById('btn-close-credits'),
   
       // Final
       endingTitle: document.getElementById('ending-title'),
       endingText: document.getElementById('ending-text'),
       endingSignature: document.getElementById('ending-signature'),
       btnEndingMenu: document.getElementById('btn-ending-menu'),
       btnEndingCredits: document.getElementById('btn-ending-credits'),
   
       // Confirm
       confirmMessage: document.getElementById('confirm-message'),
       btnConfirmYes: document.getElementById('btn-confirm-yes'),
       btnConfirmNo: document.getElementById('btn-confirm-no'),
   
       // Efeitos
       dustContainer: document.getElementById('dust-container')
   };
   
   /* ============================================================
      GERENCIADOR DE TELAS
      ============================================================ */
   const ScreenManager = {
       currentScreen: 'loading-screen',
   
       /**
        * Mostra uma tela específica
        * @param {string} screenId - ID da tela a ser mostrada
        */
       show(screenId) {
           // Esconde todas as telas
           const allScreens = document.querySelectorAll('.screen');
           allScreens.forEach(screen => {
               screen.classList.remove('active');
           });
   
           // Mostra a tela alvo
           const target = document.getElementById(screenId);
           if (target) {
               target.classList.add('active');
               this.currentScreen = screenId;
           } else {
               console.warn(`Tela não encontrada: ${screenId}`);
           }
       },
   
       /**
        * Mostra um overlay (pausa, diário, mapa, etc.)
        * @param {string} overlayId - ID do overlay
        */
       showOverlay(overlayId) {
           const overlay = document.getElementById(overlayId);
           if (overlay) {
               overlay.classList.add('active');
               overlay.classList.remove('hidden');
           }
       },
   
       /**
        * Esconde um overlay
        * @param {string} overlayId - ID do overlay
        */
       hideOverlay(overlayId) {
           const overlay = document.getElementById(overlayId);
           if (overlay) {
               overlay.classList.remove('active');
           }
       },
   
       /**
        * Mostra um modal de confirmação
        * @param {string} message - Mensagem a ser exibida
        * @param {Function} onConfirm - Callback ao confirmar
        */
       confirm(message, onConfirm) {
           DOM.confirmMessage.textContent = message;
           DOM.confirmModal.classList.remove('hidden');
           DOM.confirmModal.classList.add('active');
   
           // Remove listeners antigos
           const newYes = DOM.btnConfirmYes.cloneNode(true);
           const newNo = DOM.btnConfirmNo.cloneNode(true);
           DOM.btnConfirmYes.parentNode.replaceChild(newYes, DOM.btnConfirmYes);
           DOM.btnConfirmNo.parentNode.replaceChild(newNo, DOM.btnConfirmNo);
   
           // Adiciona novos
           newYes.addEventListener('click', () => {
               DOM.confirmModal.classList.remove('active');
               DOM.confirmModal.classList.add('hidden');
               if (onConfirm) onConfirm();
           });
   
           newNo.addEventListener('click', () => {
               DOM.confirmModal.classList.remove('active');
               DOM.confirmModal.classList.add('hidden');
           });
       }
   };
   
   /* ============================================================
      TELA DE CARREGAMENTO
      ============================================================ */
   const LoadingScreen = {
       phrases: [
           "Relembrando...",
           "Organizando as caixas...",
           "Limpando a poeira...",
           "Acendendo a vela...",
           "Abrindo as cortinas...",
           "Encontrando as cartas...",
           "Preparando o piano...",
           "Reacendendo as memórias..."
       ],
   
       currentProgress: 0,
       phraseIndex: 0,
       phraseInterval: null,
   
       /**
        * Inicia a tela de carregamento
        * @param {Function} onComplete - Callback quando terminar
        */
       start(onComplete) {
           this.currentProgress = 0;
           this.phraseIndex = 0;
           DOM.loadingBar.style.width = '0%';
           DOM.loadingPercent.textContent = '0%';
           DOM.loadingPhrase.textContent = this.phrases[0];
   
           // Troca as frases a cada 2 segundos
           this.phraseInterval = setInterval(() => {
               this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
               DOM.loadingPhrase.style.opacity = '0';
               setTimeout(() => {
                   DOM.loadingPhrase.textContent = this.phrases[this.phraseIndex];
                   DOM.loadingPhrase.style.opacity = '1';
               }, 300);
           }, 2000);
   
           // Anima a barra de progresso
           const incrementInterval = setInterval(() => {
               this.currentProgress += Math.random() * 8 + 2;
               if (this.currentProgress >= 100) {
                   this.currentProgress = 100;
                   clearInterval(incrementInterval);
                   clearInterval(this.phraseInterval);
   
                   setTimeout(() => {
                       if (onComplete) onComplete();
                   }, 800);
               }
               DOM.loadingBar.style.width = this.currentProgress + '%';
               DOM.loadingPercent.textContent = Math.floor(this.currentProgress) + '%';
           }, 150);
       }
   };
   
   /* ============================================================
      POEIRA FLUTUANTE
      ============================================================ */
   const DustSystem = {
       particles: [],
       maxParticles: 60,
       animationId: null,
   
       /**
        * Inicia o sistema de poeira
        */
       start() {
           // Limpa partículas antigas
           this.particles = [];
           DOM.dustContainer.innerHTML = '';
   
           // Cria partículas
           for (let i = 0; i < this.maxParticles; i++) {
               this.createParticle();
           }
   
           // Inicia animação
           this.animate();
       },
   
       /**
        * Cria uma partícula de poeira
        */
       createParticle() {
           const particle = document.createElement('div');
           particle.className = 'dust-particle';
   
           const startX = Math.random() * 100;
           const duration = Math.random() * 20 + 15; // 15 a 35 segundos
           const delay = Math.random() * 20;
           const size = Math.random() * 2 + 1;
           const opacity = Math.random() * 0.4 + 0.2;
   
           particle.style.left = startX + '%';
           particle.style.width = size + 'px';
           particle.style.height = size + 'px';
           particle.style.opacity = opacity;
           particle.style.animationDuration = duration + 's';
           particle.style.animationDelay = delay + 's';
   
           DOM.dustContainer.appendChild(particle);
           this.particles.push(particle);
       },
   
       /**
        * Loop de animação (não usado se for CSS puro, mas útil para controle)
        */
       animate() {
           // A animação é feita via CSS, então só precisamos reiniciar periodicamente
           this.animationId = setInterval(() => {
               // Remove partículas que já saíram
               this.particles = this.particles.filter(p => p.parentNode);
               // Cria novas se necessário
               while (this.particles.length < this.maxParticles) {
                   this.createParticle();
               }
           }, 5000);
       },
   
       /**
        * Para o sistema
        */
       stop() {
           if (this.animationId) {
               clearInterval(this.animationId);
               this.animationId = null;
           }
           DOM.dustContainer.innerHTML = '';
           this.particles = [];
       }
   };
   
   /* ============================================================
      INICIALIZAÇÃO
      ============================================================ */
   window.addEventListener('DOMContentLoaded', () => {
       console.log('%c✦ A Última Memória de Belly', 'color: #A88B4A; font-size: 20px; font-family: serif;');
       console.log('%cUma história sobre memória, luto e o que resta.', 'color: #8A8278; font-style: italic;');
   
       // Inicia poeira
       DustSystem.start();
   
       // Verifica se há save
       if (SaveSystem.hasSave()) {
           GameState.hasSave = true;
           DOM.btnContinue.disabled = false;
       }
   
       // Inicia tela de carregamento
       LoadingScreen.start(() => {
           // Configura listeners de menu
           MenuManager.init();
           // Vai para o menu
           ScreenManager.show('main-menu');
           GameState.isLoading = false;
       });
   });
   /* ============================================================
   game.js — Parte 2: Sistema de Diálogo
   ============================================================ */

/* ============================================================
   SISTEMA DE DIÁLOGO
   ============================================================ */
const DialogueSystem = {
    // Fila de diálogos
    queue: [],
    currentLine: null,
    currentChoice: null,
    isTyping: false,
    typeInterval: null,
    onComplete: null,
    onChoice: null,

    /**
     * Inicia uma sequência de diálogo
     * @param {Array} lines - Array de objetos {speaker, text, choices, onChoice}
     * @param {Function} onComplete - Callback ao terminar
     */
    start(lines, onComplete = null) {
        this.queue = [...lines];
        this.onComplete = onComplete;
        this.show();
        this.nextLine();
    },

    /**
     * Mostra a caixa de diálogo
     */
    show() {
        DOM.dialogueBox.classList.remove('hidden');
        GameState.isDialogueActive = true;
    },

    /**
     * Esconde a caixa de diálogo
     */
    hide() {
        DOM.dialogueBox.classList.add('hidden');
        GameState.isDialogueActive = false;
        DOM.dialogueChoices.innerHTML = '';
        DOM.dialogueContinue.style.display = 'none';
    },

    /**
     * Avança para a próxima linha
     */
    nextLine() {
        // Se ainda está digitando, pula para o fim
        if (this.isTyping) {
            this.skipTyping();
            return;
        }

        // Se não há mais linhas, termina
        if (this.queue.length === 0) {
            this.hide();
            if (this.onComplete) this.onComplete();
            return;
        }

        // Pega a próxima linha
        this.currentLine = this.queue.shift();
        this.displayLine(this.currentLine);
    },

    /**
     * Exibe uma linha de diálogo
     * @param {Object} line - {speaker, text, choices, onChoice}
     */
    displayLine(line) {
        // Define o speaker
        DOM.dialogueSpeaker.textContent = line.speaker || 'Belly';

        // Limpa escolhas anteriores
        DOM.dialogueChoices.innerHTML = '';
        DOM.dialogueContinue.style.display = 'none';

        // Verifica se tem escolhas
        if (line.choices && line.choices.length > 0) {
            this.currentChoice = line;
            this.typeText(line.text, () => {
                this.showChoices(line.choices, line.onChoice);
            });
        } else {
            this.currentChoice = null;
            this.typeText(line.text, () => {
                DOM.dialogueContinue.style.display = 'block';
            });
        }
    },

    /**
     * Efeito máquina de escrever
     * @param {string} text - Texto a ser digitado
     * @param {Function} onComplete - Callback ao terminar
     */
    typeText(text, onComplete) {
        this.isTyping = true;
        DOM.dialogueText.textContent = '';
        let index = 0;

        // Velocidade baseada na configuração
        const speed = Math.max(10, 60 - (GameState.settings.textSpeed * 5));

        this.typeInterval = setInterval(() => {
            if (index < text.length) {
                DOM.dialogueText.textContent += text[index];
                index++;
            } else {
                clearInterval(this.typeInterval);
                this.isTyping = false;
                if (onComplete) onComplete();
            }
        }, speed);
    },

    /**
     * Pula a digitação e mostra o texto completo
     */
    skipTyping() {
        if (this.typeInterval) {
            clearInterval(this.typeInterval);
            this.typeInterval = null;
        }
        if (this.currentLine) {
            DOM.dialogueText.textContent = this.currentLine.text;
        }
        this.isTyping = false;

        // Mostra escolhas se houver
        if (this.currentChoice && this.currentChoice.choices) {
            this.showChoices(this.currentChoice.choices, this.currentChoice.onChoice);
        } else {
            DOM.dialogueContinue.style.display = 'block';
        }
    },

    /**
     * Mostra as escolhas
     * @param {Array} choices - Array de {text, action}
     * @param {Function} onChoice - Callback ao escolher
     */
    showChoices(choices, onChoice) {
        DOM.dialogueChoices.innerHTML = '';
        DOM.dialogueContinue.style.display = 'none';

        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'dialogue-choice';
            btn.textContent = choice.text;
            btn.addEventListener('click', () => {
                DOM.dialogueChoices.innerHTML = '';
                if (choice.action) choice.action();
                if (onChoice) onChoice(index, choice);
                // Avança para a próxima linha
                setTimeout(() => this.nextLine(), 100);
            });
            DOM.dialogueChoices.appendChild(btn);
        });
    },

    /**
     * Avança ao clicar na caixa de diálogo
     */
    advance() {
        if (this.isTyping) {
            this.skipTyping();
        } else if (!this.currentChoice) {
            this.nextLine();
        }
    }
};

// Clique na caixa de diálogo avança
DOM.dialogueBox.addEventListener('click', (e) => {
    // Ignora cliques nos botões de escolha
    if (e.target.classList.contains('dialogue-choice')) return;
    DialogueSystem.advance();
});

// Tecla Espaço ou Enter avança
document.addEventListener('keydown', (e) => {
    if (GameState.isDialogueActive) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            DialogueSystem.advance();
        }
    }
});

/* ============================================================
   DIÁLOGOS PRÉ-ESCRITOS
   ============================================================ */
const Dialogues = {
    // Introdução do jogo
    intro: [
        {
            speaker: 'Belly',
            text: 'Três anos. Três anos desde que a Cissa se foi.'
        },
        {
            speaker: 'Belly',
            text: 'A casa está do jeito que ela deixou. Só que... mais quieta.'
        },
        {
            speaker: 'Belly',
            text: 'Eu vim para vender. É o certo a fazer. Não posso ficar presa ao passado.'
        },
        {
            speaker: 'Belly',
            text: 'Mas tem algo estranho aqui. Como se a casa... esperasse por mim.'
        },
        {
            speaker: 'Belly',
            text: 'Vou dar uma olhada. Só uma olhada. Depois eu chamo o corretor.'
        }
    ],

    // Primeira entrada na sala
    sala: [
        {
            speaker: 'Belly',
            text: 'O piano da vó. Ela tocava todas as manhãs.'
        },
        {
            speaker: 'Belly',
            text: 'Eu odiava acordar com aquilo. Agora... eu daria tudo para ouvir de novo.'
        },
        {
            speaker: 'Eco de Cissa',
            text: 'Você desafinou, Belly. Precisa praticar.'
        },
        {
            speaker: 'Belly',
            text: 'Vó? Não... eu só... eu lembro dessa voz.'
        }
    ],

    // Entrada no quarto de Belly
    quartoBelly: [
        {
            speaker: 'Belly',
            text: 'Esse quarto... eu não entrava aqui desde os 15 anos.'
        },
        {
            speaker: 'Belly',
            text: 'Está tudo igual. Minhas coisas, meus diários, meus brinquedos.'
        },
        {
            speaker: 'Belly',
            text: 'Como se o tempo não tivesse passado. Como se eu ainda fosse aquela menina.'
        },
        {
            speaker: 'Eco de Cissa',
            text: 'Belly, minha boneca. Você cresceu tanto.'
        },
        {
            speaker: 'Belly',
            text: 'Vó... eu sinto muito. Eu sinto muito por não ter voltado antes.'
        }
    ],

    // Escolha importante no espelho
    espelho: [
        {
            speaker: 'Belly',
            text: 'O espelho está quebrado. Mas o reflexo... não é o meu.'
        },
        {
            speaker: 'Belly',
            text: 'É uma versão de mim. Mais velha. Mais cansada. Mais... sozinha.'
        },
        {
            speaker: 'Belly',
            text: 'O que eu faço?',
            choices: [
                {
                    text: 'Aceitar o reflexo como ele é',
                    action: () => {
                        GameState.flags.fixedMirror = true;
                        GameState.stability = Math.min(100, GameState.stability + 20);
                    }
                },
                {
                    text: 'Quebrar o espelho de vez',
                    action: () => {
                        GameState.stability = Math.max(0, GameState.stability - 20);
                    }
                },
                {
                    text: 'Ignorar e sair do banheiro',
                    action: () => {
                        // Não muda nada
                    }
                }
            ]
        }
    ],

    // Final — Aceitação
    finalAceitacao: [
        {
            speaker: 'Belly',
            text: 'Eu não esqueci. Eu só aprendi a carregar.'
        },
        {
            speaker: 'Belly',
            text: 'A casa não precisa de mim para existir. E eu não preciso dela para lembrar.'
        },
        {
            speaker: 'Eco de Cissa',
            text: 'Vá, minha boneca. Viva. Eu estarei aqui quando você voltar.'
        },
        {
            speaker: 'Belly',
            text: 'Eu volto, vó. Eu prometo. Mas não hoje.'
        }
    ]
};
/* ============================================================
   game.js — Parte 3: HUD
   ============================================================ */

/* ============================================================
   HUD — RELÓGIO
   ============================================================ */
   const ClockSystem = {
    /**
     * Atualiza o relógio na tela
     */
    update() {
        const hour = GameState.clockHour;
        const minute = GameState.clockMinute;

        // Formata como H:MM
        const formattedMinute = minute.toString().padStart(2, '0');
        DOM.clockTime.textContent = `${hour}:${formattedMinute}`;
    },

    /**
     * Define a hora do relógio
     * @param {number} hour
     * @param {number} minute
     */
    set(hour, minute) {
        GameState.clockHour = hour;
        GameState.clockMinute = minute;

        // Atualiza AM/PM
        const label = DOM.clockTime.nextElementSibling;
        if (label) {
            label.textContent = hour >= 12 ? 'PM' : 'AM';
        }

        this.update();
    },

    /**
     * Avança o tempo baseado nas escolhas
     * @param {number} hours - Horas a avançar (pode ser negativo)
     */
    advance(hours) {
        let totalMinutes = GameState.clockHour * 60 + GameState.clockMinute + (hours * 60);
        totalMinutes = ((totalMinutes % 1440) + 1440) % 1440; // 0-1440
        const newHour = Math.floor(totalMinutes / 60);
        const newMinute = totalMinutes % 60;
        this.set(newHour, newMinute);
    },

    /**
     * Retorna o estado do tempo baseado no relógio
     * @returns {string}
     */
    getPhase() {
        const hour = GameState.clockHour;
        if (hour >= 0 && hour < 5) return 'madrugada';
        if (hour >= 5 && hour < 12) return 'manha';
        if (hour >= 12 && hour < 18) return 'tarde';
        return 'noite';
    }
};

/* ============================================================
   HUD — VELA DE ESTABILIDADE
   ============================================================ */
const CandleSystem = {
    /**
     * Atualiza a vela baseado na estabilidade
     */
    update() {
        const stability = GameState.stability;

        // Remove classes antigas
        DOM.hudCandle.classList.remove('unstable', 'critical');

        let label = 'Estável';

        if (stability < 25) {
            DOM.hudCandle.classList.add('critical');
            label = 'Apagando';
        } else if (stability < 60) {
            DOM.hudCandle.classList.add('unstable');
            label = 'Instável';
        }

        DOM.candleLabel.textContent = label;

        // Ajusta a altura da chama baseado na estabilidade
        const flameHeight = 8 + (stability / 100) * 12;
        DOM.candleFlame.style.height = flameHeight + 'px';

        // Ajusta o brilho
        const glowIntensity = 10 + (stability / 100) * 20;
        DOM.candleFlame.style.boxShadow = `0 0 ${glowIntensity}px rgba(255, 200, 80, ${0.3 + stability / 200})`;
    },

    /**
     * Modifica a estabilidade
     * @param {number} amount - Quantidade a adicionar/subtrair
     */
    change(amount) {
        GameState.stability = Math.max(0, Math.min(100, GameState.stability + amount));
        this.update();

        // Se chegou a 0, o cômodo desaparece
        if (GameState.stability === 0) {
            this.onRoomForgotten();
        }
    },

    /**
     * Callback quando a estabilidade chega a 0
     */
    onRoomForgotten() {
        console.warn('Cômodo esquecido!');
        DialogueSystem.start([
            {
                speaker: 'Belly',
                text: 'Não... não consigo lembrar desse lugar. Ele está... sumindo.'
            }
        ]);
    }
};

/* ============================================================
   HUD — CONTADOR DE MEMÓRIAS
   ============================================================ */
const MemorySystem = {
    /**
     * Adiciona uma memória
     * @param {Object} memory - {id, title, text, type}
     */
    add(memory) {
        // Verifica se já existe
        if (GameState.memoriesCollected.find(m => m.id === memory.id)) {
            return;
        }

        GameState.memoriesCollected.push(memory);
        this.updateHUD();
        this.updateJournal();

        // Feedback visual
        this.flashMemory(memory.type);
    },

    /**
     * Atualiza o contador no HUD
     */
    updateHUD() {
        DOM.memoryCount.textContent = GameState.memoriesCollected.length;
    },

    /**
     * Atualiza o diário
     */
    updateJournal() {
        if (GameState.memoriesCollected.length === 0) {
            DOM.journalList.innerHTML = '<p class="journal-empty">Nenhuma memória registrada ainda.</p>';
            return;
        }

        DOM.journalList.innerHTML = '';
        GameState.memoriesCollected.forEach(memory => {
            const item = document.createElement('div');
            item.className = 'journal-item';
            item.dataset.memoryId = memory.id;

            // Cor baseada no tipo
            const color = this.getMemoryColor(memory.type);

            item.innerHTML = `
                <span class="journal-item-dot" style="background: ${color}"></span>
                <span class="journal-item-title">${memory.title}</span>
            `;

            item.addEventListener('click', () => {
                this.showMemoryDetail(memory);
            });

            DOM.journalList.appendChild(item);
        });
    },

    /**
     * Mostra o detalhe de uma memória
     * @param {Object} memory
     */
    showMemoryDetail(memory) {
        const color = this.getMemoryColor(memory.type);

        DOM.journalDetail.innerHTML = `
            <h3 style="color: ${color}; margin-bottom: 1rem; font-family: 'Cinzel', serif; letter-spacing: 0.15em;">
                ${memory.title}
            </h3>
            <p style="font-style: italic; line-height: 1.9; color: var(--text-primary);">
                ${memory.text}
            </p>
            <p style="margin-top: 2rem; font-size: 0.85rem; color: var(--text-dim); letter-spacing: 0.1em;">
                Tipo: ${this.getMemoryTypeName(memory.type)}
            </p>
        `;
    },

    /**
     * Retorna a cor da memória
     */
    getMemoryColor(type) {
        const colors = {
            blue: '#4A6B8A',
            yellow: '#A8904A',
            red: '#8A3A3A',
            purple: '#6B4A8A',
            green: '#4A8A5A'
        };
        return colors[type] || colors.blue;
    },

    /**
     * Retorna o nome do tipo de memória
     */
    getMemoryTypeName(type) {
        const names = {
            blue: 'Memória Estável',
            yellow: 'Memória Fragmentada',
            red: 'Memória Distorcida',
            purple: 'Memória Falsa',
            green: 'Memória de Cissa'
        };
        return names[type] || 'Memória';
    },

    /**
     * Efeito visual ao coletar uma memória
     */
    flashMemory(type) {
        const flash = document.createElement('div');
        flash.className = `memory-flash ${type}`;
        flash.classList.add('active');
        document.body.appendChild(flash);

        setTimeout(() => {
            flash.classList.remove('active');
            setTimeout(() => flash.remove(), 400);
        }, 300);
    }
};

/* ============================================================
   HUD — BOTÕES
   ============================================================ */
const HUDButtons = {
    init() {
        DOM.btnJournal.addEventListener('click', () => {
            ScreenManager.showOverlay('journal');
        });

        DOM.btnMap.addEventListener('click', () => {
            ScreenManager.showOverlay('map');
        });

        DOM.btnFullscreen.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        DOM.btnPause.addEventListener('click', () => {
            this.pause();
        });
    },

    /**
     * Alterna tela cheia
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            DOM.gameContainer.requestFullscreen().then(() => {
                GameState.isFullscreen = true;
                DOM.gameContainer.classList.add('fullscreen');
            }).catch(err => {
                console.warn('Erro ao entrar em tela cheia:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                GameState.isFullscreen = false;
                DOM.gameContainer.classList.remove('fullscreen');
            });
        }
        /* ============================================================
   game.js — Parte 4: Save/Load, Opções e Menu
   ============================================================ */

/* ============================================================
   SISTEMA DE SAVE
   ============================================================ */
const SaveSystem = {
    SAVE_KEY: 'ultima_memoria_belly_save',
    SETTINGS_KEY: 'ultima_memoria_belly_settings',

    /**
     * Verifica se existe save
     */
    hasSave() {
        try {
            return !!localStorage.getItem(this.SAVE_KEY);
        } catch (e) {
            return false;
        }
    },

    /**
     * Salva o progresso
     */
    save() {
        try {
            const saveData = {
                currentRoom: GameState.currentRoom,
                memoriesCollected: GameState.memoriesCollected,
                clockHour: GameState.clockHour,
                clockMinute: GameState.clockMinute,
                stability: GameState.stability,
                endingsUnlocked: GameState.endingsUnlocked,
                flags: GameState.flags,
                timestamp: Date.now()
            };

            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            console.log('✓ Jogo salvo');

            // Feedback visual
            this.showSaveFeedback();
            return true;
        } catch (e) {
            console.error('Erro ao salvar:', e);
            return false;
        }
    },

    /**
     * Carrega o progresso
     */
    load() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return false;

            const saveData = JSON.parse(raw);

            GameState.currentRoom = saveData.currentRoom || 'entrada';
            GameState.memoriesCollected = saveData.memoriesCollected || [];
            GameState.clockHour = saveData.clockHour || 3;
            GameState.clockMinute = saveData.clockMinute || 47;
            GameState.stability = saveData.stability !== undefined ? saveData.stability : 100;
            GameState.endingsUnlocked = saveData.endingsUnlocked || [];
            GameState.flags = saveData.flags || GameState.flags;

            // Atualiza UI
            ClockSystem.update();
            CandleSystem.update();
            MemorySystem.updateHUD();
            MemorySystem.updateJournal();

            console.log('✓ Jogo carregado');
            return true;
        } catch (e) {
            console.error('Erro ao carregar:', e);
            return false;
        }
    },

    /**
     * Deleta o save
     */
    delete() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            GameState.hasSave = false;
            DOM.btnContinue.disabled = true;
            console.log('✓ Save deletado');
            return true;
        } catch (e) {
            console.error('Erro ao deletar save:', e);
            return false;
        }
    },

    /**
     * Salva as configurações
     */
    saveSettings() {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(GameState.settings));
        } catch (e) {
            console.error('Erro ao salvar configurações:', e);
        }
    },

    /**
     * Carrega as configurações
     */
    loadSettings() {
        try {
            const raw = localStorage.getItem(this.SETTINGS_KEY);
            if (!raw) return;
            const settings = JSON.parse(raw);
            Object.assign(GameState.settings, settings);
            this.applySettings();
        } catch (e) {
            console.error('Erro ao carregar configurações:', e);
        }
    },

    /**
     * Mostra feedback visual de save
     */
    showSaveFeedback() {
        const feedback = document.createElement('div');
        feedback.textContent = '✓ Salvo';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(13, 13, 13, 0.95);
            border: 1px solid #A88B4A;
            color: #A88B4A;
            padding: 1rem 2rem;
            font-family: 'Cinzel', serif;
            letter-spacing: 0.2em;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
            pointer-events: none;
        `;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transition = 'opacity 0.5s ease';
            setTimeout(() => feedback.remove(), 500);
        }, 1200);
    },

    /**
     * Aplica as configurações ao body
     */
    applySettings() {
        const s = GameState.settings;
        const body = document.body;

        // Tamanho do texto
        body.classList.remove('text-small', 'text-large', 'text-huge');
        if (s.textSize < 90) body.classList.add('text-small');
        else if (s.textSize > 110 && s.textSize <= 130) body.classList.add('text-large');
        else if (s.textSize > 130) body.classList.add('text-huge');

        // Alto contraste
        body.classList.toggle('high-contrast', s.highContrast);

        // Reduzir animações
        body.classList.toggle('reduced-motion', s.reducedMotion);

        // Modo daltônico (aplica filtro)
        if (s.colorblind) {
            body.style.filter = 'hue-rotate(20deg) saturate(1.2)';
        } else {
            body.style.filter = '';
        }
    }
};

/* ============================================================
   SISTEMA DE OPÇÕES
   ============================================================ */
const OptionsSystem = {
    init() {
        // Carrega valores atuais
        DOM.optTextSpeed.value = GameState.settings.textSpeed;
        DOM.optTextSpeedValue.textContent = GameState.settings.textSpeed;

        DOM.optSfxVolume.value = GameState.settings.sfxVolume;
        DOM.optSfxVolumeValue.textContent = GameState.settings.sfxVolume + '%';

        DOM.optTextSize.value = GameState.settings.textSize;
        DOM.optTextSizeValue.textContent = GameState.settings.textSize + '%';

        DOM.optColorblind.checked = GameState.settings.colorblind;
        DOM.optReducedMotion.checked = GameState.settings.reducedMotion;
        DOM.optHighContrast.checked = GameState.settings.highContrast;

        // Listeners
        DOM.optTextSpeed.addEventListener('input', (e) => {
            GameState.settings.textSpeed = parseInt(e.target.value);
            DOM.optTextSpeedValue.textContent = e.target.value;
            SaveSystem.saveSettings();
        });

        DOM.optSfxVolume.addEventListener('input', (e) => {
            GameState.settings.sfxVolume = parseInt(e.target.value);
            DOM.optSfxVolumeValue.textContent = e.target.value + '%';
            SaveSystem.saveSettings();
        });

        DOM.optTextSize.addEventListener('input', (e) => {
            GameState.settings.textSize = parseInt(e.target.value);
            DOM.optTextSizeValue.textContent = e.target.value + '%';
            SaveSystem.applySettings();
            SaveSystem.saveSettings();
        });

        DOM.optColorblind.addEventListener('change', (e) => {
            GameState.settings.colorblind = e.target.checked;
            SaveSystem.applySettings();
            SaveSystem.saveSettings();
        });

        DOM.optReducedMotion.addEventListener('change', (e) => {
            GameState.settings.reducedMotion = e.target.checked;
            SaveSystem.applySettings();
            SaveSystem.saveSettings();
        });

        DOM.optHighContrast.addEventListener('change', (e) => {
            GameState.settings.highContrast = e.target.checked;
            SaveSystem.applySettings();
            SaveSystem.saveSettings();
        });

        DOM.btnResetOptions.addEventListener('click', () => {
            ScreenManager.confirm('Restaurar todas as configurações padrão?', () => {
                GameState.settings = {
                    textSpeed: 5,
                    sfxVolume: 70,
                    textSize: 100,
                    colorblind: false,
                    reducedMotion: false,
                    highContrast: false
                };
                this.init(); // Recarrega valores
                SaveSystem.applySettings();
                SaveSystem.saveSettings();
            });
        });
    }
};

/* ============================================================
   GERENCIADOR DE MENU
   ============================================================ */
const MenuManager = {
    init() {
        // Novo Jogo
        DOM.btnNewGame.addEventListener('click', () => {
            if (GameState.hasSave) {
                ScreenManager.confirm('Iniciar um novo jogo? O progresso atual será perdido.', () => {
                    SaveSystem.delete();
                    this.startNewGame();
                });
            } else {
                this.startNewGame();
            }
        });

        // Continuar
        DOM.btnContinue.addEventListener('click', () => {
            if (SaveSystem.load()) {
                ScreenManager.show('game-container');
                GameEngine.start();
            }
        });

        // Opções
        DOM.btnOptions.addEventListener('click', () => {
            ScreenManager.showOverlay('options');
        });

        // Créditos
        DOM.btnCredits.addEventListener('click', () => {
            ScreenManager.showOverlay('credits');
        });

        // Fechar overlays
        DOM.btnCloseJournal.addEventListener('click', () => ScreenManager.hideOverlay('journal'));
        DOM.btnCloseMap.addEventListener('click', () => ScreenManager.hideOverlay('map'));
        DOM.btnCloseOptions.addEventListener('click', () => ScreenManager.hideOverlay('options'));
        DOM.btnCloseCredits.addEventListener('click', () => ScreenManager.hideOverlay('credits'));

        // Pausa
        DOM.btnResume.addEventListener('click', () => {
            GameState.isPaused = false;
            ScreenManager.hideOverlay('pause-menu');
        });

        DOM.btnPauseJournal.addEventListener('click', () => {
            ScreenManager.hideOverlay('pause-menu');
            ScreenManager.showOverlay('journal');
        });

        DOM.btnPauseMap.addEventListener('click', () => {
            ScreenManager.hideOverlay('pause-menu');
            ScreenManager.showOverlay('map');
        });

        DOM.btnPauseOptions.addEventListener('click', () => {
            ScreenManager.hideOverlay('pause-menu');
            ScreenManager.showOverlay('options');
        });

        DOM.btnPauseSave.addEventListener('click', () => {
            SaveSystem.save();
            GameState.hasSave = true;
            DOM.btnContinue.disabled = false;
        });

        DOM.btnQuit.addEventListener('click', () => {
            ScreenManager.confirm('Sair para o menu? O progresso não salvo será perdido.', () => {
                GameState.isPaused = false;
                ScreenManager.hideOverlay('pause-menu');
                ScreenManager.show('main-menu');
            });
        });

        // Final
        DOM.btnEndingMenu.addEventListener('click', () => {
            ScreenManager.show('main-menu');
        });

        DOM.btnEndingCredits.addEventListener('click', () => {
            ScreenManager.showOverlay('credits');
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Fecha overlays
                const openOverlay = document.querySelector('.overlay-screen.active');
                if (openOverlay && openOverlay.id !== 'pause-menu') {
                    openOverlay.classList.remove('active');
                } else if (GameState.isPaused) {
                    GameState.isPaused = false;
                    ScreenManager.hideOverlay('pause-menu');
                } else if (ScreenManager.currentScreen === 'game-container') {
                    HUDButtons.pause();
                }
            }

            // F para fullscreen
            if (e.key === 'f' || e.key === 'F') {
                if (ScreenManager.currentScreen === 'game-container') {
                    HUDButtons.toggleFullscreen();
                }
            }

            // J para diário
            if (e.key === 'j' || e.key === 'J') {
                if (ScreenManager.currentScreen === 'game-container') {
                    ScreenManager.showOverlay('journal');
                }
            }

            // M para mapa
            if (e.key === 'm' || e.key === 'M') {
                if (ScreenManager.currentScreen === 'game-container') {
                    ScreenManager.showOverlay('map');
                }
            }
        });
    },

    /**
     * Inicia um novo jogo
     */
    startNewGame() {
        // Reseta o estado
        GameState.currentRoom = 'entrada';
        GameState.memoriesCollected = [];
        GameState.clockHour = 3;
        GameState.clockMinute = 47;
        GameState.stability = 100;
        GameState.endingsUnlocked = [];
        GameState.flags = {
            readCissaLetter: false,
            enteredBellyRoom: false,
            playedPiano: false,
            fixedMirror: false,
            wateredGarden: false,
            organizedAttic: false
        };

        // Atualiza UI
        ClockSystem.update();
        CandleSystem.update();
        MemorySystem.updateHUD();
        MemorySystem.updateJournal();

        // Vai para o jogo
        ScreenManager.show('game-container');
        GameEngine.start();
    }
};
/* ============================================================
   game.js — Parte 5: Motor do Jogo
   ============================================================ */

/* ============================================================
   MOTOR DO JOGO
   ============================================================ */
   const GameEngine = {
    canvas: null,
    ctx: null,
    lastTime: 0,
    deltaTime: 0,
    animationId: null,
    isRunning: false,

    /**
     * Inicia o motor
     */
    start() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            console.error('Canvas 2D não suportado');
            return;
        }

        this.isRunning = true;
        this.lastTime = performance.now();

        // Inicia diálogo de introdução se for o primeiro jogo
        if (GameState.memoriesCollected.length === 0 && !GameState.flags.readCissaLetter) {
            setTimeout(() => {
                DialogueSystem.start(Dialogues.intro, () => {
                    console.log('Introdução concluída');
                });
            }, 500);
        }

        // Inicia loop
        this.loop();
    },

    /**
     * Loop principal
     */
    loop() {
        if (!this.isRunning) return;

        const now = performance.now();
        this.deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // Só atualiza se não estiver pausado
        if (!GameState.isPaused) {
            this.update(this.deltaTime);
        }

        this.render();

        this.animationId = requestAnimationFrame(() => this.loop());
    },

    /**
     * Atualiza a lógica
     * @param {number} dt - Delta time
     */
    update(dt) {
        // Atualiza poeira (se necessário)
        // Atualiza animações do canvas
        // Aqui vai a lógica principal do jogo
    },

    /**
     * Renderiza o canvas
     */
    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Limpa
        ctx.fillStyle = '#0D0D0D';
        ctx.fillRect(0, 0, w, h);

        // Desenha o quarto atual
        this.renderRoom(ctx, w, h);

        // Desenha efeitos
        this.renderVignette(ctx, w, h);
    },

    /**
     * Renderiza o cômodo atual
     */
    renderRoom(ctx, w, h) {
        const room = GameState.currentRoom;
        const stability = GameState.stability;

        // Cor de fundo baseada na estabilidade
        const baseAlpha = stability / 100;
        ctx.fillStyle = `rgba(26, 26, 26, ${baseAlpha})`;
        ctx.fillRect(0, 0, w, h);

        // Texto temporário (placeholder)
        ctx.fillStyle = '#C9C0B0';
        ctx.font = '32px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const roomNames = {
            'entrada': 'Entrada',
            'sala': 'Sala de Estar',
            'cozinha': 'Cozinha',
            'quarto-cissa': 'Quarto de Cissa',
            'quarto-belly': 'Quarto de Belly',
            'banheiro': 'Banheiro',
            'sotao': 'Sótão',
            'jardim': 'Jardim'
        };

        ctx.fillText(roomNames[room] || 'Cômodo', w / 2, h / 2 - 40);

        // Instrução
        ctx.fillStyle = '#8A8278';
        ctx.font = '16px Lora, serif';
        ctx.fillText('[ Clique para interagir ]', w / 2, h / 2 + 40);

        // Desenha indicador de estabilidade no canvas
        ctx.fillStyle = '#5A544C';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Estabilidade: ${Math.round(stability)}%`, 20, h - 20);
    },

    /**
     * Renderiza vinheta
     */
    renderVignette(ctx, w, h) {
        const gradient = ctx.createRadialGradient(
            w / 2, h / 2, Math.min(w, h) * 0.3,
            w / 2, h / 2, Math.max(w, h) * 0.7
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    },

    /**
     * Para o motor
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },

    /**
     * Muda para outro cômodo
     * @param {string} roomId
     */
    goToRoom(roomId) {
        GameState.currentRoom = roomId;

        // Dispara diálogo baseado no cômodo
        const roomDialogues = {
            'sala': Dialogues.sala,
            'quarto-belly': Dialogues.quartoBelly,
            'banheiro': Dialogues.espelho
        };

        if (roomDialogues[roomId]) {
            DialogueSystem.start(roomDialogues[roomId]);
        }

        // Salva automaticamente
        SaveSystem.save();
    },

    /**
     * Finaliza o jogo com um final específico
     * @param {string} endingId
     */
    triggerEnding(endingId) {
        const endings = {
            'esquecimento': {
                title: 'O Esquecimento',
                text: 'Eu não lembro mais. E isso... não dói mais. Mas também não é mais eu.',
                signature: '— Belly'
            },
            'aceitacao': {
                title: 'A Aceitação',
                text: 'Eu não esqueci. Eu só aprendi a carregar.',
                signature: '— Belly'
            },
            'heranca': {
                title: 'A Herança',
                text: 'Eu cuidei tão bem do passado que esqueci de viver o presente.',
                signature: '— Belly'
            },
            'mudanca': {
                title: 'A Mudança',
                text: 'Não precisei esquecer para seguir em frente. Precisei lembrar do que importava.',
                signature: '— Belly'
            },
            'ultima-memoria': {
                title: 'A Última Memória',
                text: 'A última memória de Belly não é sobre esquecer. É sobre ser lembrada.',
                signature: '— Belly'
            }
        };

        const ending = endings[endingId] || endings.aceitacao;

        // Registra o final desbloqueado
        if (!GameState.endingsUnlocked.includes(endingId)) {
            GameState.endingsUnlocked.push(endingId);
        }

        // Atualiza a tela
        DOM.endingTitle.textContent = ending.title;
        DOM.endingText.textContent = ending.text;
        DOM.endingSignature.textContent = ending.signature;

        // Para o motor
        this.stop();

        // Mostra a tela de final
        setTimeout(() => {
            ScreenManager.show('ending-screen');
        }, 1500);
    }
};

/* ============================================================
   INTERAÇÕES COM O CANVAS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Clique no canvas
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        canvas.addEventListener('click', (e) => {
            if (GameState.isPaused || GameState.isDialogueActive) return;

            // Aqui você implementa a lógica de clique
            // Por enquanto, só um log
            console.log('Clique no canvas:', e.offsetX, e.offsetY);
        });

        // Hover no canvas
        canvas.addEventListener('mousemove', (e) => {
            if (GameState.isPaused || GameState.isDialogueActive) return;

            // Muda o cursor se estiver sobre algo interativo
            // (implementar depois)
        });
    }
});

/* ============================================================
   INICIALIZAÇÃO FINAL
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
    // Carrega configurações
    SaveSystem.loadSettings();

    // Inicializa sistemas
    OptionsSystem.init();
    HUDButtons.init();

    console.log('%c✦ Sistemas inicializados', 'color: #4A8A5A;');
});

/* ============================================================
   CLEANUP
   ============================================================ */
window.addEventListener('beforeunload', () => {
    // Salva automaticamente ao sair
    if (ScreenManager.currentScreen === 'game-container' && !GameState.isPaused) {
        SaveSystem.save();
    }

    // Para o motor
    GameEngine.stop();
    DustSystem.stop();
});