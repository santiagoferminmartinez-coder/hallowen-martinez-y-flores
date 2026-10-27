
const ambientBtn = document.getElementById('ambientBtn');
const sweetBtn = document.getElementById('sweetBtn');
const trickBtn = document.getElementById('trickBtn');
const screamer = document.getElementById('screamer');
const closeScreamer = document.getElementById('closeScreamer');
const choiceHint = document.getElementById('choiceHint');

const ambiente = document.getElementById('sonidoAmbiente');
const susurros = document.getElementById('sonidoSusurros');
const sonidoTruco = document.getElementById('sonidoTruco');

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;

    if (!AudioCtx) return null;

    audioContext = new AudioCtx();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

// Sonido de susto alternativo si falla el archivo de audio.
function playScreamSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.04);
  master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
  master.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(700, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.6);
  osc.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 1.15);
}

// ===== AMBIENTE Y SUSURROS =====

if (ambiente) {
  ambiente.volume = 0.25;
  ambiente.loop = true;
}

if (susurros) {
  susurros.volume = 0.35;
}

if (ambientBtn && ambiente) {
  ambientBtn.addEventListener('click', async () => {
    if (ambiente.paused) {
      try {
        await ambiente.play();

        ambientBtn.textContent = '🔊 SILENCIAR AMBIENTE';
        ambientBtn.setAttribute('aria-pressed', 'true');

        if (susurros) {
          susurros.currentTime = 0;
          susurros.play().catch(error => {
            console.log('Error al reproducir los susurros:', error);
          });
        }
      } catch (error) {
        ambientBtn.textContent = '⚠️ VOLVER A INTENTAR';
        console.log('Error al reproducir el ambiente:', error);
      }
    } else {
      ambiente.pause();
      ambiente.currentTime = 0;

      if (susurros) {
        susurros.pause();
        susurros.currentTime = 0;
      }

      ambientBtn.textContent = '♫ ACTIVAR AMBIENTE';
      ambientBtn.setAttribute('aria-pressed', 'false');
    }
  });
}

// ===== BOTÓN DULCE =====


 // ===== BOTÓN DULCE: ACTIVA EL SCREAMER =====

if (sweetBtn) {
  sweetBtn.addEventListener('click', async () => {
    if (choiceHint) {
      choiceHint.textContent = 'Elegiste dulce… pero algo te estaba esperando.';
    }

    if (screamer) {
      screamer.classList.add('active');
      screamer.setAttribute('aria-hidden', 'false');
    }

    if (sonidoTruco) {
      sonidoTruco.currentTime = 0;

      try {
        await sonidoTruco.play();
      } catch (error) {
        console.log('No se pudo reproducir grito.mp4:', error);
        playScreamSound();
      }
    } else {
      playScreamSound();
    }
  });
}


// ===== BOTÓN TRUCO =====

 // ===== BOTÓN TRUCO: ACTIVA LOS DULCES =====

if (trickBtn) {
  trickBtn.addEventListener('click', () => {
    if (choiceHint) {
      choiceHint.textContent = '🎃 ¡Elegiste truco y recibiste una sorpresa!';
    }

    if (document.querySelector('.dulce-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'dulce-overlay';

    const mensaje = document.createElement('div');
    mensaje.className = 'dulce-mensaje';
    mensaje.innerHTML = `
      🍬 ¡TRUCO O MAGIA! 🎃
      <small>¡La noche te regala una sorpresa!</small>
    `;

    overlay.appendChild(mensaje);
    document.body.appendChild(overlay);

    const emojis = ['🍬', '🍭', '🎃', '👻', '🍫', '🦇', '✨'];

    for (let i = 0; i < 35; i++) {
      const caramelo = document.createElement('span');
      caramelo.className = 'dulce-caramelo';
      caramelo.textContent =
        emojis[Math.floor(Math.random() * emojis.length)];

      caramelo.style.left = Math.random() * 100 + '%';
      caramelo.style.animationDuration =
        (2 + Math.random() * 3) + 's';
      caramelo.style.animationDelay =
        Math.random() * 1.5 + 's';

      overlay.appendChild(caramelo);
    }

    setTimeout(() => overlay.remove(), 5500);
  });
}


// ===== CERRAR EL SUSTO =====

function dismissScreamer() {
  if (screamer) {
    screamer.classList.remove('active');
    screamer.setAttribute('aria-hidden', 'true');
  }

  if (sonidoTruco) {
    sonidoTruco.pause();
    sonidoTruco.currentTime = 0;
  }

  if (choiceHint) {
    choiceHint.textContent =
      'Ahora sí… volvé cuando tengas más valor.';
  }
}

if (closeScreamer) {
  closeScreamer.addEventListener('click', dismissScreamer);
}

document.addEventListener('keydown', event => {
  if (
    event.key === 'Escape' &&
    screamer &&
    screamer.classList.contains('active')
  ) {
    dismissScreamer();
  }
});

