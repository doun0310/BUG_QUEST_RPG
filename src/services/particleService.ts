export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'pixel' | 'spark';
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  alpha: number;
  vy: number;
}

interface ImpactWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
  pixelated: boolean;
}

export interface ImpactOptions {
  critical?: boolean;
  color?: string;
  accentColor?: string;
}

class ParticleService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private impactWaves: ImpactWave[] = [];
  private animationFrameId: number | null = null;
  // A bounded pool keeps combat feedback predictable even during rapid attacks.
  private readonly maxParticles = 72;
  private readonly maxWaves = 3;

  constructor() {
    // Lazy canvas creation
  }

  private initCanvas() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'fx-particle-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999';
      this.canvas.style.imageRendering = 'pixelated';
      document.body.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  private resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  private canRender(): boolean {
    return typeof document === 'undefined' || document.visibilityState !== 'hidden';
  }

  /**
   * 화면 특정 좌표 (x, y)에 픽셀 파티클 폭발 이펙트 발생
   */
  public triggerExplosion(x: number, y: number, color: string = '#38bdf8', count: number = 20) {
    this.initCanvas();
    if (!this.ctx || !this.canRender()) return;

    const availableSlots = this.maxParticles - this.particles.length;
    const actualCount = Math.max(0, Math.min(this.prefersReducedMotion() ? 8 : count, availableSlots));

    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.round((Math.random() * 4.4 + 2.2) * 2) / 2;
      const size = Math.random() > 0.72 ? 5 : (Math.random() > 0.45 ? 3 : 2);
      this.particles.push({
        x,
        y,
        vx: Math.round(Math.cos(angle) * speed),
        vy: Math.round(Math.sin(angle) * speed - 1),
        size,
        color,
        alpha: 1,
        decay: Math.random() * 0.035 + 0.02,
        shape: i % 6 === 0 ? 'spark' : 'pixel',
      });
    }

    this.startLoop();
  }

  /** Layered burst used for an intentional, high-feedback combat impact. */
  public triggerImpact(x: number, y: number, options: boolean | ImpactOptions = false) {
    const config = typeof options === 'boolean' ? { critical: options } : options;
    const critical = config.critical ?? false;
    const color = config.color ?? (critical ? '#fbbf24' : '#38bdf8');
    const accent = config.accentColor ?? (critical ? '#f43f5e' : '#a5b4fc');
    this.triggerExplosion(x, y, color, critical ? 34 : 20);
    this.triggerExplosion(x, y, accent, critical ? 16 : 9);
    this.triggerExplosion(x, y, '#ffffff', critical ? 8 : 4);

    if (!this.prefersReducedMotion()) {
      this.impactWaves.splice(0, Math.max(0, this.impactWaves.length - (this.maxWaves - 2)));
      this.impactWaves.push(
        { x, y, radius: 8, maxRadius: critical ? 126 : 78, color, alpha: 0.9, lineWidth: critical ? 4 : 3, pixelated: true },
        { x, y, radius: critical ? 18 : 12, maxRadius: critical ? 168 : 104, color: accent, alpha: 0.6, lineWidth: 2, pixelated: true }
      );
    }
    this.startLoop();
  }

  /**
   * 화면 좌표 (x, y)에 3D 부유 텍스트 (예: CRITICAL! -250 HP) 생성
   */
  public spawnFloatingText(x: number, y: number, text: string, color: string = '#f87171', fontSize: number = 18) {
    this.initCanvas();
    if (!this.ctx) return;

    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      fontSize,
      alpha: 1,
      vy: -2,
    });

    this.startLoop();
  }

  private startLoop() {
    if (this.animationFrameId === null) {
      this.loop();
    }
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Render Particles (Opt: O(1) swap-pop removal & no heavy shadowBlur)
    const pLen = this.particles.length;
    for (let i = pLen - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x = Math.round(p.x + p.vx);
      p.y = Math.round(p.y + p.vy);
      p.vy = Math.round((p.vy + 0.2) * 2) / 2; // Quantized gravity for pixel movement
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        // Swap-pop to avoid splice overhead
        this.particles[i] = this.particles[this.particles.length - 1];
        this.particles.pop();
        continue;
      }

      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      if (p.shape === 'spark') {
        this.ctx.fillRect(px - p.size, py, p.size * 3, p.size);
        this.ctx.fillRect(px, py - p.size, p.size, p.size * 3);
      } else {
        this.ctx.fillRect(px, py, p.size, p.size);
      }
    }

    // 2. Render Expanding Impact Waves
    const wLen = this.impactWaves.length;
    for (let i = wLen - 1; i >= 0; i--) {
      const wave = this.impactWaves[i];
      wave.radius = Math.round((wave.radius + (wave.maxRadius - wave.radius) * 0.18 + 2) / 2) * 2;
      wave.alpha -= 0.06;

      if (wave.alpha <= 0 || wave.radius >= wave.maxRadius - 2) {
        this.impactWaves[i] = this.impactWaves[this.impactWaves.length - 1];
        this.impactWaves.pop();
        continue;
      }

      this.ctx.globalAlpha = wave.alpha;
      this.ctx.strokeStyle = wave.color;
      this.ctx.lineWidth = wave.lineWidth;
      if (wave.pixelated) {
        const r = Math.round(wave.radius / 6) * 6;
        const corner = Math.round(r * 0.42);
        this.ctx.strokeRect(Math.round(wave.x - r), Math.round(wave.y - corner), r * 2, corner * 2);
        this.ctx.strokeRect(Math.round(wave.x - corner), Math.round(wave.y - r), corner * 2, r * 2);
      }
    }

    // 3. Render Floating Text
    const tLen = this.floatingTexts.length;
    if (tLen > 0) {
      this.ctx.textAlign = 'center';
      for (let i = tLen - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y = Math.round(ft.y + ft.vy);
        ft.alpha -= 0.025;

        if (ft.alpha <= 0) {
          this.floatingTexts[i] = this.floatingTexts[this.floatingTexts.length - 1];
          this.floatingTexts.pop();
          continue;
        }

        this.ctx.globalAlpha = ft.alpha < 0 ? 0 : ft.alpha;
        this.ctx.font = `900 ${ft.fontSize}px ui-monospace, monospace`;
        this.ctx.fillStyle = 'rgba(3, 7, 18, .8)';
        this.ctx.fillText(ft.text, ft.x + 2, ft.y + 2);
        this.ctx.fillStyle = ft.color;
        this.ctx.fillText(ft.text, ft.x, ft.y);
      }
    }

    // Reset globalAlpha
    this.ctx.globalAlpha = 1;

    if (this.particles.length > 0 || this.floatingTexts.length > 0 || this.impactWaves.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    } else {
      this.animationFrameId = null;
    }
  };
}

export const particleService = new ParticleService();
