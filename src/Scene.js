import { Container, Texture, TilingSprite } from 'pixi.js';
import bgImage from './BG.png';

// Helper function to programmatically blend the left and right edges of an HTMLImageElement
function makeSeamless(img, overlapPercent = 0.15, cropTopPercent = 0.3) {
  const canvas = document.createElement('canvas');
  const w = img.width;
  const h = img.height;
  const cropY = Math.floor(h * cropTopPercent);
  const newH = h - cropY;
  
  const overlap = Math.floor(w * overlapPercent);
  const newW = w - overlap;

  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext('2d');

  // Draw the main image shifted (cropped on the right and top)
  ctx.drawImage(img, 0, cropY, newW, newH, 0, 0, newW, newH);

  // Create temporary canvas to hold the blended left-edge overlap
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = overlap;
  tempCanvas.height = newH;
  const tempCtx = tempCanvas.getContext('2d');

  // 1. Draw leftmost overlap of the original image (cropped top)
  tempCtx.drawImage(img, 0, cropY, overlap, newH, 0, 0, overlap, newH);
  // Apply gradient to fade out from left to right
  tempCtx.globalCompositeOperation = 'destination-out';
  const gradOut = tempCtx.createLinearGradient(0, 0, overlap, 0);
  gradOut.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradOut.addColorStop(1, 'rgba(0, 0, 0, 1)');
  tempCtx.fillStyle = gradOut;
  tempCtx.fillRect(0, 0, overlap, newH);

  // Draw this onto the right edge of our main canvas
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(tempCanvas, newW - overlap, 0);

  // 2. Draw rightmost overlap of the original image (which was cropped out)
  tempCtx.globalCompositeOperation = 'source-over';
  tempCtx.clearRect(0, 0, overlap, newH);
  tempCtx.drawImage(img, w - overlap, cropY, overlap, newH, 0, 0, overlap, newH);
  // Apply gradient to fade out from right to left (fade in from left to right)
  tempCtx.globalCompositeOperation = 'destination-out';
  const gradIn = tempCtx.createLinearGradient(0, 0, overlap, 0);
  gradIn.addColorStop(0, 'rgba(0, 0, 0, 1)');
  gradIn.addColorStop(1, 'rgba(0, 0, 0, 0)');
  tempCtx.fillStyle = gradIn;
  tempCtx.fillRect(0, 0, overlap, newH);

  // Draw this onto the left edge of our main canvas
  ctx.drawImage(tempCanvas, 0, 0);

  return Texture.from(canvas);
}

// Class for handling the environment.
export class Scene {
  constructor(width, height) {
    // Create a main view that holds all layers.
    this.view = new Container();

    // Set a consistent scale for the scene characters based on screen height
    this.scale = height / 1080; 
    
    // Calculate the floor height for external referencing (ground level in the image).
    // The ground in the new BG is roughly the bottom 15% to 20% of the visible area.
    this.floorHeight = height * 0.15; 

    // Create the background tiling sprite with a temporary empty texture
    this.background = new TilingSprite({
      texture: Texture.EMPTY,
      width,
      height,
      anchor: { x: 0, y: 1 },
      applyAnchorToTexture: true,
    });

    // Position the backdrop layers.
    this.background.y = 0; // Entire screen height since it fills it completely

    // Add all layers to the main view.
    this.view.addChild(this.background);

    // Load the background image asynchronously using native HTMLImageElement
    const img = new Image();
    img.src = bgImage;
    img.onload = () => {
      // Crop top 35% to remove the stars and focus on the landscape/ground
      const seamlessTexture = makeSeamless(img, 0.15, 0.35);
      const bgScale = height / seamlessTexture.height;
      this.background.texture = seamlessTexture;
      this.background.tileScale.set(bgScale, bgScale);
    };
    
    this._positionX = 0;
  }

  // Use a private variable to track position since we don't have a platform sprite anymore
  get positionX() {
    return this._positionX;
  }

  // Set the horizontal position of the background layer.
  set positionX(value) {
    this._positionX = value;
    // Scroll the background at full speed since it represents the ground now
    this.background.tilePosition.x = value; 
  }
}

