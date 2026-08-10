export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
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

class ParticleService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private animationFrameId: number | null = null;

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
      document.body.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d');
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

  /**
   * 화면 특정 좌표 (x, y)에 픽셀 파티클 폭발 이펙트 발생
   */
  public triggerExplosion(x: number, y: number, color: string = '#38bdf8', count: number = 24) {
    this.initCanvas();
    if (!this.ctx) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 5 + 3,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.015,
      });
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

    // Render Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
      this.ctx.restore();
    }

    // Render Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.alpha);
      this.ctx.font = `900 ${ft.fontSize}px 'Pretendard', sans-serif`;
      this.ctx.fillStyle = ft.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = ft.color;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }

    if (this.particles.length > 0 || this.floatingTexts.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    } else {
      this.animationFrameId = null;
    }
  };
}

export const particleService = new ParticleService();
