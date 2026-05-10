/* ══════════════════════════════════════════════════
   DIA DAS MÃES — script.js
   Módulos:
     1. Cursor customizado + rastro de corações
     2. Canvas de partículas (fundo)
     3. Reveal de elementos no scroll
     4. Fluxo: Hero → Envelope → Final
     5. Efeito typewriter na carta
     6. Chuva de corações na seção final
══════════════════════════════════════════════════ */

"use strict";

/* ─── 1. CURSOR CUSTOMIZADO ────────────────────── */
(function initCursor() {
  // Cria o ponto do cursor
  const dot = document.createElement('div');
  dot.id = 'cursorDot';
  document.body.appendChild(dot);

  const trail = document.getElementById('cursorTrail');
  let lastX = 0, lastY = 0;
  let trailCount = 0;
  const TRAIL_THROTTLE = 80; // px antes de emitir coração

  document.addEventListener('mousemove', e => {
    const x = e.clientX;
    const y = e.clientY;

    // move o ponto
    dot.style.left = x + 'px';
    dot.style.top  = y + 'px';

    // emite coração se andou o suficiente
    const dx = x - lastX;
    const dy = y - lastY;
    const dist = Math.hypot(dx, dy);
    trailCount += dist;

    if (trailCount >= TRAIL_THROTTLE) {
      trailCount = 0;
      lastX = x; lastY = y;
      spawnCursorHeart(x, y);
    }
  });

  // interação hover em botões
  const btns = document.querySelectorAll('button');
  btns.forEach(btn => {
    btn.addEventListener('mouseenter', () => dot.style.transform = 'translate(-50%,-50%) scale(2.5)');
    btn.addEventListener('mouseleave', () => dot.style.transform = 'translate(-50%,-50%) scale(1)');
  });
})();

function spawnCursorHeart(x, y) {
  const trail = document.getElementById('cursorTrail');
  const h = document.createElement('span');
  h.className = 'cursor-heart';
  h.textContent = Math.random() > 0.5 ? '♥' : '♡';
  h.style.left = x + 'px';
  h.style.top  = y + 'px';
  h.style.fontSize = (10 + Math.random() * 8) + 'px';
  h.style.color = `hsl(${340 + Math.random() * 25}, 60%, ${60 + Math.random() * 20}%)`;
  trail.appendChild(h);
  setTimeout(() => h.remove(), 850);
}


/* ─── 2. CANVAS DE PARTÍCULAS ──────────────────── */
(function initParticles() {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initParticles_(); });

  // partículas suaves
  function Particle() {
    this.reset = function() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = 1 + Math.random() * 3;
      this.vx   = (Math.random() - .5) * .4;
      this.vy   = -.3 - Math.random() * .5;
      this.life = .6 + Math.random() * .4;
      this.color= `hsl(${330 + Math.random() * 40}, 60%, ${70 + Math.random() * 20}%)`;
      this.shape= Math.random() > .6 ? 'heart' : 'circle';
    };
    this.reset();
    this.y = Math.random() * H; // distribui no início
  }

  function drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 10, size / 10);
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.bezierCurveTo( 5, -8,  10, -3,  0,  5);
    ctx.bezierCurveTo(-10, -3, -5, -8,  0, -3);
    ctx.fill();
    ctx.restore();
  }

  function initParticles_() {
    particles = [];
    const count = Math.floor((W * H) / 14000);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;

      ctx.globalAlpha = p.life * .5;
      ctx.fillStyle   = p.color;

      if (p.shape === 'heart') {
        drawHeart(ctx, p.x, p.y, p.r * 4);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // reset quando sai da tela
      if (p.y < -20 || p.x < -20 || p.x > W + 20) p.reset();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }

  initParticles_();
  loop();
})();


/* ─── 3. REVEAL NO SCROLL / ENTRADA ───────────── */
(function initReveal() {
  // Hero: anima na entrada
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal-up').forEach(el => {
      el.classList.add('is-visible');
    });
  }, 200);

  // Observer genérico para outras seções
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-visible');
    });
  }, { threshold: .15 });

  document.querySelectorAll('.reveal-up').forEach(el => obs.observe(el));
})();


/* ─── 4. FLUXO PRINCIPAL ───────────────────────── */
const heroSection   = document.getElementById('hero');
const letterSection = document.getElementById('letterSection');
const finalSection  = document.getElementById('finalSection');
const openBtn       = document.getElementById('openLetterBtn');
const toFinalBtn    = document.getElementById('toFinalBtn');
const envelope      = document.getElementById('envelope');
const letterPaper   = document.getElementById('letterPaper');

// ── 4a. Abrir carta ──
openBtn.addEventListener('click', () => {
  // scroll / fade para seção da carta
  heroSection.style.transition = 'opacity .6s, transform .6s';
  heroSection.style.opacity    = '0';
  heroSection.style.transform  = 'translateY(-30px)';
  heroSection.style.pointerEvents = 'none';

  setTimeout(() => {
    heroSection.style.display = 'none';
    letterSection.classList.remove('hidden-section');
    letterSection.style.opacity = '0';
    letterSection.style.transition = 'opacity .7s';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        letterSection.style.opacity = '1';
        window.scrollTo(0, 0);
        startEnvelopeAnimation();
      });
    });
  }, 650);
});

// ── 4b. Ir para final ──
toFinalBtn.addEventListener('click', () => {
  letterSection.style.transition = 'opacity .6s';
  letterSection.style.opacity    = '0';

  setTimeout(() => {
    letterSection.style.display = 'none';
    finalSection.classList.remove('hidden-section');
    finalSection.style.opacity    = '0';
    finalSection.style.transition = 'opacity .8s';
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        finalSection.style.opacity = '1';
        startFinalAnimation();
      });
    });
  }, 650);
});


/* ─── 5. ENVELOPE → CARTA ──────────────────────── */
function startEnvelopeAnimation() {
  // pequena pausa de suspense
  setTimeout(() => {
    envelope.classList.add('open');

    // carta sobe após aba abrir
    setTimeout(() => {
      letterPaper.classList.add('revealed');

      // Em dispositivos móveis, garante que a carta fique visível no centro da tela
      setTimeout(() => {
        try {
          letterPaper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {
          window.scrollTo({ top: letterPaper.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
        }
      }, 120);

      // paragrafos aparecem em cascata
      const paras = letterPaper.querySelectorAll('.fade-para');
      paras.forEach((p, i) => {
        setTimeout(() => {
          p.classList.add('visible');
          if (i === paras.length - 1) {
            // revela botão de continuar
            toFinalBtn.classList.add('visible');
          }
        }, i * 400 + 600);
      });

      // typewriter no greeting
      typewrite(
        document.getElementById('letterText'),
        'Minha querida Mãe,',
        80,
        300
      );

    }, 900); // espera aba abrir
  }, 600);
}


/* ─── 6. TYPEWRITER ─────────────────────────────── */
function typewrite(el, text, speed, delay) {
  let i = 0;
  setTimeout(() => {
    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
  }, delay);
}


/* ─── 7. SEÇÃO FINAL & CHUVA DE CORAÇÕES ──────── */
function startFinalAnimation() {
  // anima elementos
  setTimeout(() => document.querySelector('.final-title')?.classList.add('visible'), 200);
  setTimeout(() => document.querySelector('.final-sub')?.classList.add('visible'), 600);
  setTimeout(() => document.querySelector('.final-divider')?.classList.add('visible'), 900);
  setTimeout(() => document.querySelector('.final-quote')?.classList.add('visible'), 1100);

  // inicia chuva
  setTimeout(() => startHeartRain(), 800);
}

function startHeartRain() {
  const container = document.getElementById('heartRain');
  const CHARS = ['♥', '♡', '❤', '💕', '❁'];
  const COLORS = [
    'var(--blush)', 'var(--blush-deep)', 'var(--rose)',
    'var(--gold-light)', '#f8b4b4', '#fcd5d5'
  ];

  let count = 0;
  const maxHearts = 80;

  function drop() {
    if (count >= maxHearts) return;
    count++;

    const h = document.createElement('span');
    h.className  = 'rain-heart';
    h.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];

    const size     = 12 + Math.random() * 22;
    const leftPct  = Math.random() * 100;
    const duration = 3 + Math.random() * 4;
    const delay    = Math.random() * 2;

    h.style.cssText = `
      left: ${leftPct}%;
      font-size: ${size}px;
      color: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;

    container.appendChild(h);

    // remove após animação
    h.addEventListener('animationend', () => h.remove());

    // próximo coração
    const nextDelay = 40 + Math.random() * 80;
    setTimeout(drop, nextDelay);
  }

  // dispara vários iniciais
  for (let i = 0; i < 5; i++) {
    setTimeout(drop, i * 100);
  }

  // chuva contínua (infinita com intervalo)
  setInterval(() => {
    if (finalSection.style.display !== 'none') {
      count = 0;
      for (let i = 0; i < 3; i++) {
        setTimeout(drop, i * 120);
      }
    }
  }, 5000);
}


/* ─── 8. PARALLAX SUAVE NO HERO ────────────────── */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  if (heroContent && scrollY < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrollY * .18}px)`;
    heroContent.style.opacity   = 1 - scrollY / (window.innerHeight * .7);
  }
});


/* ─── 9. EFEITO HOVER no envelope ──────────────── */
envelope.addEventListener('mouseenter', () => {
  envelope.style.transform = 'translateY(-8px) scale(1.02)';
  envelope.style.filter    = 'drop-shadow(0 28px 60px rgba(180,90,90,.28))';
});
envelope.addEventListener('mouseleave', () => {
  if (!envelope.classList.contains('open')) {
    envelope.style.transform = '';
    envelope.style.filter    = '';
  }
});


/* ─── 10. MICRO-INTERAÇÃO: click no envelope ──── */
envelope.addEventListener('click', () => {
  if (!envelope.classList.contains('open')) {
    startEnvelopeAnimation();
  }
});


/* ─── 11. BOTÕES GANHAM CURSOR INTERATIVO ──────── */
// Re-bind para novos botões que aparecem dinamicamente
function rebindCursorButtons() {
  const dot = document.getElementById('cursorDot');
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (dot) dot.style.transform = 'translate(-50%,-50%) scale(2.5)';
    });
    btn.addEventListener('mouseleave', () => {
      if (dot) dot.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
}
setTimeout(rebindCursorButtons, 1500);


/* ─── 12. TOUCH: corações no toque (mobile) ────── */
document.addEventListener('touchstart', e => {
  const touch = e.touches[0];
  spawnCursorHeart(touch.clientX, touch.clientY);
}, { passive: true });

document.addEventListener('touchmove', e => {
  const touch = e.touches[0];
  // emite de forma espaçada
  if (Math.random() > .6) {
    spawnCursorHeart(touch.clientX, touch.clientY);
  }
}, { passive: true });


/* ─── 13. MOBILE: mostra cursor normal ─────────── */
(function fixMobileCursor() {
  if ('ontouchstart' in window) {
    document.body.style.cursor = 'auto';
    const dot = document.getElementById('cursorDot');
    if (dot) dot.style.display = 'none';
  }
})();
