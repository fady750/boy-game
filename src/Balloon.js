import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class Balloon {
  constructor(x, y, type = 'normal', letter = 'A') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.letter = letter;
    this.active = true;

    // Different balloon types config (all using the glassy #5439C6 style)
    const types = {
      small: { radius: 18, speed: 3.2, points: 25, color: 0x5439C6, scoreColor: '#c084fc' }, 
      normal: { radius: 26, speed: 2.0, points: 10, color: 0x5439C6, scoreColor: '#c084fc' }, 
      large: { radius: 34, speed: 1.4, points: 5, color: 0x5439C6, scoreColor: '#c084fc' },  
      special: { radius: 22, speed: 4.0, points: 50, color: 0x5439C6, scoreColor: '#e879f9' }
    };

    const config = types[type] || types.normal;
    this.radius = config.radius * 1.35; // Size mapped to match game proportions comfortably
    this.speed = config.speed;
    this.points = config.points;
    this.color = config.color;
    this.scoreColor = config.scoreColor;

    // Horizontal sway config (sine wave simulation)
    this.swaySpeed = 0.02 + Math.random() * 0.02;
    this.swayAmount = 10 + Math.random() * 10;
    this.swayOffset = Math.random() * Math.PI * 2;
    this.time = 0;

    // Create the container and graphics
    this.view = new Container();
    this.view.x = x;
    this.view.y = y;

    this.baseGraphics = new Graphics();
    this.overlayGraphics = new Graphics();
    this.maskGraphics = new Graphics();

    this.view.addChild(this.baseGraphics);
    this.view.addChild(this.overlayGraphics);
    this.view.addChild(this.maskGraphics);
    
    // Mask the overlays to stay inside the balloon bounds
    this.overlayGraphics.mask = this.maskGraphics;

    this.drawBalloon();

    // Draw the letter on the balloon center using Inter 700
    const textStyle = new TextStyle({
      fontFamily: '"Inter", sans-serif',
      fontSize: Math.round(this.radius * 1.2),
      fontWeight: '700',
      fill: '#ffffff',
      dropShadow: {
        alpha: 0.15,
        angle: Math.PI / 2,
        blur: 3,
        color: 0x000000,
        distance: 1
      },
      align: 'center'
    });
    this.letterText = new Text({ text: this.letter, style: textStyle });
    this.letterText.anchor.set(0.5);
    this.letterText.x = 0;
    this.letterText.y = 0; // centered perfectly
    this.view.addChild(this.letterText);
  }

  drawBalloon() {
    const r = this.radius;
    
    // Base circle: #5439C6 with glassy outer border effect
    this.baseGraphics.clear();
    this.baseGraphics.circle(0, 0, r);
    this.baseGraphics.fill({ color: this.color }); 
    // Inset border simulation
    this.baseGraphics.stroke({ width: 2, color: 0x06312e, alpha: 0.75 });

    // Overlays (Glass effects from provided CSS)
    this.overlayGraphics.clear();
    
    // Top & Bottom teal ambient inset shadows (rgba(6, 49, 46, 0.77))
    this.overlayGraphics.ellipse(0, r * 0.7, r * 0.9, r * 0.45);
    this.overlayGraphics.fill({ color: 0x06312e, alpha: 0.55 });

    this.overlayGraphics.ellipse(0, -r * 0.7, r * 0.9, r * 0.45);
    this.overlayGraphics.fill({ color: 0x06312e, alpha: 0.45 });

    // Dark translucent inner circle (.balloon-dark: rgba(0, 4, 4, 0.34))
    this.overlayGraphics.circle(-0.307 * r, 0.173 * r, 0.788 * r);
    this.overlayGraphics.fill({ color: 0x000404, alpha: 0.34 });

    // Purple / pink glass reflection (.balloon-purple: rgba(229, 167, 255, 0.32))
    this.overlayGraphics.circle(0.519 * r, -0.115 * r, 0.5 * r);
    this.overlayGraphics.fill({ color: 0xE5A7FF, alpha: 0.32 });

    // Main glass highlight overlay (.balloon-highlight)
    this.overlayGraphics.circle(-0.15 * r, -0.15 * r, 0.75 * r);
    this.overlayGraphics.fill({ color: 0xffffff, alpha: 0.15 });

    // Small white glass reflection / shine (.balloon-shine: rgba(255, 255, 255, 0.67))
    this.overlayGraphics.ellipse(0.426 * r, -0.698 * r, 0.099 * r, 0.110 * r);
    this.overlayGraphics.fill({ color: 0xffffff, alpha: 0.67 });

    // Mask circle to clip everything to the balloon perimeter
    this.maskGraphics.clear();
    this.maskGraphics.circle(0, 0, r);
    this.maskGraphics.fill({ color: 0xffffff });
  }

  update(ticker, scrollX) {
    this.time += ticker.deltaTime;
    
    // Float upwards
    this.y -= this.speed * ticker.deltaTime;

    // Horizontal sway (sine wave)
    const sway = Math.sin(this.time * this.swaySpeed + this.swayOffset) * this.swayAmount * 0.05;
    this.view.x += sway;

    // Apply scene scrolling speed (if any)
    this.view.x -= scrollX;
    
    // Update internal positions
    this.x = this.view.x;
    this.view.y = this.y;

    // Deactivate if balloon floats out of top screen boundary
    if (this.y < -this.radius * 2) {
      this.active = false;
    }
  }

  destroy() {
    this.view.destroy({ children: true });
  }
}

