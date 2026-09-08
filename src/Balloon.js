import { Container, Sprite, Texture, Text, TextStyle } from 'pixi.js';

let cachedBalloonTexture = null;

/**
 * Generates an ultra high-definition cached texture for the glassy balloon
 * based directly on the exact Figma CSS properties:
 * - Ellipse 251: Base #5439C6
 * - Ellipse 247: rgba(217, 217, 217, 0.55) + 2 inset shadows rgba(6, 49, 46, ...)
 * - Ellipse 249: rgba(0, 4, 4, 0.34)
 * - Ellipse 250: rgba(229, 167, 255, 0.32)
 * - Ellipse 248: rgba(255, 255, 255, 0.67) rotated -35.06deg
 */
function getBalloonTexture() {
  if (cachedBalloonTexture) return cachedBalloonTexture;

  const size = 312; // 3x of 104px for ultra crisp rendering
  const s = size / 104; // scale factor = 3
  const r = 52 * s; // 156px radius
  const cx = r;
  const cy = r;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Clip everything to the circular balloon body
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // 1. Ellipse 251: Base #5439C6
  ctx.fillStyle = '#5439C6';
  ctx.fillRect(0, 0, size, size);

  // 2. Ellipse 247: rgba(217, 217, 217, 0.55)
  ctx.fillStyle = 'rgba(217, 217, 217, 0.55)';
  ctx.fillRect(0, 0, size, size);

  // 3. Ellipse 247 Inset Shadows:
  // box-shadow: inset 0px -5px 7.7px rgba(6, 49, 46, 0.77), inset 0px 4px 28.2px rgba(6, 49, 46, 0.81)
  const drawInsetShadow = (offsetX, offsetY, blur, color) => {
    ctx.save();
    const margin = blur * 2 + Math.max(Math.abs(offsetX), Math.abs(offsetY)) + 40;
    ctx.beginPath();
    ctx.rect(cx - r - margin, cy - r - margin, (r + margin) * 2, (r + margin) * 2);
    ctx.arc(cx, cy, r, 0, Math.PI * 2, true); // cutout circular hole
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;
    ctx.fillStyle = color;
    ctx.fill('evenodd');
    ctx.restore();
  };

  // Top inset shadow: 0px 4px 28.2px rgba(6, 49, 46, 0.81)
  drawInsetShadow(0, 4 * s, 28.2 * s, 'rgba(6, 49, 46, 0.81)');

  // Bottom inset shadow: 0px -5px 7.7px rgba(6, 49, 46, 0.77)
  drawInsetShadow(0, -5 * s, 7.7 * s, 'rgba(6, 49, 46, 0.77)');

  // 4. Ellipse 249: rgba(0, 4, 4, 0.34)
  // width: 82px, height: 82px, left: 6131px, top: 797px (relative: left 3, top 20)
  // center: (3 + 41, 20 + 41) = (44, 61), radius: 41
  ctx.beginPath();
  ctx.arc(44 * s, 61 * s, 41 * s, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 4, 4, 0.34)';
  ctx.fill();

  // 5. Ellipse 250: rgba(229, 167, 255, 0.32)
  // width: 52px, height: 52px, left: 6180px, top: 797px (relative: left 52, top 20)
  // center: (52 + 26, 20 + 26) = (78, 46), radius: 26
  ctx.beginPath();
  ctx.arc(78 * s, 46 * s, 26 * s, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(229, 167, 255, 0.32)';
  ctx.fill();

  // 6. Ellipse 248: rgba(255, 255, 255, 0.67), rotate(-35.06deg)
  // width: 10.31px, height: 11.45px, left: 6195px, top: 785px (relative: left 67, top 8)
  // center: (67 + 5.155, 8 + 5.725) = (72.155, 13.725)
  // radiusX: 5.155, radiusY: 5.725
  ctx.save();
  ctx.translate(72.155 * s, 13.725 * s);
  ctx.rotate((-35.06 * Math.PI) / 180);
  ctx.beginPath();
  ctx.ellipse(0, 0, 5.155 * s, 5.725 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.67)';
  ctx.fill();
  ctx.restore();

  // Restore clip
  ctx.restore();

  // Edge antialiasing rim
  ctx.beginPath();
  ctx.arc(cx, cy, r - 0.5 * s, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(6, 49, 46, 0.5)';
  ctx.lineWidth = 1 * s;
  ctx.stroke();

  cachedBalloonTexture = Texture.from(canvas);
  return cachedBalloonTexture;
}

export class Balloon {
  constructor(x, y, type = 'normal', letter = 'A') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.letter = letter;
    this.active = true;

    // Balloon types configuration matching Figma proportions
    const types = {
      small: { radius: 34, speed: 3.2, points: 25, scoreColor: '#c084fc' }, 
      normal: { radius: 44, speed: 2.0, points: 10, scoreColor: '#c084fc' }, 
      large: { radius: 52, speed: 1.4, points: 5, scoreColor: '#c084fc' },  
      special: { radius: 40, speed: 3.8, points: 50, scoreColor: '#e879f9' }
    };

    const config = types[type] || types.normal;
    this.radius = config.radius;
    this.speed = config.speed;
    this.points = config.points;
    this.scoreColor = config.scoreColor;

    // Horizontal sway config (sine wave simulation)
    this.swaySpeed = 0.02 + Math.random() * 0.02;
    this.swayAmount = 10 + Math.random() * 10;
    this.swayOffset = Math.random() * Math.PI * 2;
    this.time = 0;

    // Container
    this.view = new Container();
    this.view.x = x;
    this.view.y = y;

    // Balloon body sprite using the Figma-exact generated texture
    this.sprite = new Sprite(getBalloonTexture());
    this.sprite.anchor.set(0.5);
    this.sprite.width = this.radius * 2;
    this.sprite.height = this.radius * 2;
    this.view.addChild(this.sprite);

    // Letter Text: Inter 700, #FFFFFF
    const textStyle = new TextStyle({
      fontFamily: '"Inter", sans-serif',
      fontSize: Math.round(this.radius * 1.23), // 64px on 104px balloon
      fontWeight: '700',
      fill: '#ffffff',
      align: 'center'
    });
    this.letterText = new Text({ text: this.letter, style: textStyle });
    this.letterText.anchor.set(0.5);
    this.letterText.x = 0;
    this.letterText.y = -this.radius * 0.04; // optical center for Arabic glyphs
    this.view.addChild(this.letterText);
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
    // Destroy display objects without destroying shared texture
    this.view.destroy({ children: true, texture: false });
  }
}
