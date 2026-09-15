import { Assets, Container, Sprite } from 'pixi.js';
import bgImage from './BG.png';

// Class for handling the environment.
export class Scene {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    // Create a main view that holds all layers.
    this.view = new Container();

    // Set a consistent scale for the scene characters based on screen height
    this.scale = height / 1080; 
    
    // Calculate the floor height for external referencing (ground level in the image).
    // The ground in the new BG is roughly the bottom 15% to 20% of the visible area.
    this.floorHeight = height * 0.15; 

    // Background sections live in world space. They are real adjacent sprites,
    // rather than one screen-sized sprite whose texture is repeatedly shifted.
    this.background = new Container();
    this.backgroundSections = [];
    this.backgroundTexture = null;
    this.backgroundScale = 1;
    this.backgroundWidth = 0;

    // Add all layers to the main view.
    this.view.addChild(this.background);

    this._positionX = 0;

    // Use the supplied background texture unchanged. Its scale is uniform, so
    // its aspect ratio and ground level are identical in every world tile.
    Assets.load(bgImage).then((texture) => {
      const bgScale = this.height / texture.height;
      this.backgroundTexture = texture;
      this.backgroundScale = bgScale;
      this.backgroundWidth = texture.width * bgScale;
      this.createBackgroundSections();
      this.layoutBackgroundSections();
    });
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.scale = height / 1080;
    this.floorHeight = height * 0.15;
    if (this.backgroundTexture) {
      this.backgroundScale = height / this.backgroundTexture.height;
      this.backgroundWidth = this.backgroundTexture.width * this.backgroundScale;
      this.createBackgroundSections();
      this.layoutBackgroundSections();
    }
  }

  // Use a private variable to track position
  get positionX() {
    return this._positionX;
  }

  createBackgroundSections() {
    if (!this.backgroundTexture || this.backgroundWidth <= 0) return;

    // Cover the viewport plus one section on each side for left/right travel.
    const sectionCount = Math.ceil(this.width / this.backgroundWidth) + 2;
    while (this.backgroundSections.length < sectionCount) {
      const section = new Sprite(this.backgroundTexture);
      this.background.addChild(section);
      this.backgroundSections.push(section);
    }
    while (this.backgroundSections.length > sectionCount) {
      const section = this.backgroundSections.pop();
      this.background.removeChild(section);
      section.destroy();
    }
  }

  layoutBackgroundSections() {
    if (!this.backgroundTexture || this.backgroundWidth <= 0) return;

    // positionX is the camera's world-to-screen offset. The section at
    // `worldLeft` begins at screen x = 0; neighbours are placed exactly one
    // background width before and after it, with no centering or overlap.
    const worldLeft = -this._positionX;
    const currentSection = Math.floor(worldLeft / this.backgroundWidth);
    const firstSection = currentSection - 1;

    this.backgroundSections.forEach((section, offset) => {
      const sectionIndex = firstSection + offset;
      section.scale.set(this.backgroundScale);
      section.x = sectionIndex * this.backgroundWidth + this._positionX;
      section.y = -this.height;
    });
  }

  // Set the horizontal camera/world offset for the background sections.
  set positionX(value) {
    this._positionX = value;
    this.layoutBackgroundSections();
  }
}
