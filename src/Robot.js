import { Container, Graphics, Sprite } from 'pixi.js';

const ART_WIDTH = 1190;
const ART_HEIGHT = 1158;

// Measured from the supplied complete left-arm image. Its shoulder is the
// lower-left socket, never the transparent image centre.
const LEFT_ARM_SOURCE_SHOULDER = { x: 822, y: 690 };
const LEFT_ARM_MUZZLE = { x: 1300, y: 80 };
const SHOULDER = { x: 800, y: 710 };
const LEFT_ARM_FORWARD_ANGLE = Math.atan2(
  LEFT_ARM_MUZZLE.y - LEFT_ARM_SOURCE_SHOULDER.y,
  LEFT_ARM_MUZZLE.x - LEFT_ARM_SOURCE_SHOULDER.x,
);

const RIGHT_ARM_PIVOT = { x: 300, y: 810 };
const HEAD_PIVOT = { x: 610, y: 455 };
const HOVER_AMPLITUDE = 48;
const HOVER_SPEED = 1.18;
const WALK_LEAN = 0.15;
const HEAD_REACTION_DURATION = 54;

// This is the sole representation of left-arm rotation. Values above +90°
// are wrapped to their equivalent negative angle and cannot accumulate spins.
const LEFT_ARM_MIN_DEGREES = -270;
const LEFT_ARM_MAX_DEGREES = 90;

// The core sits left and below this shoulder. This exterior arc means an
// impossible aim selects the closest valid pose rather than crossing the core.
const SAFE_MUZZLE_MIN_DEGREES = -150;
const SAFE_MUZZLE_MAX_DEGREES = 45;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const degreesToRadians = (degrees) => degrees * Math.PI / 180;
const radiansToDegrees = (radians) => radians * 180 / Math.PI;
const normalizeAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
const lerpAngle = (from, to, amount) => from + normalizeAngle(to - from) * amount;
const dampAmount = (rate, deltaTime) => 1 - Math.exp(-rate * deltaTime / 60);

const normalizeDegrees = (degrees) => {
  const normalized = (degrees + 180) % 360;
  return normalized < 0 ? normalized + 180 : normalized - 180;
};

const angularDistanceDegrees = (from, to) => Math.abs(normalizeDegrees(to - from));

const clampMuzzleAngle = (angle) => {
  const degrees = normalizeDegrees(radiansToDegrees(angle));
  if (degrees >= SAFE_MUZZLE_MIN_DEGREES && degrees <= SAFE_MUZZLE_MAX_DEGREES) {
    return degreesToRadians(degrees);
  }
  const closest = angularDistanceDegrees(degrees, SAFE_MUZZLE_MIN_DEGREES)
    <= angularDistanceDegrees(degrees, SAFE_MUZZLE_MAX_DEGREES)
    ? SAFE_MUZZLE_MIN_DEGREES
    : SAFE_MUZZLE_MAX_DEGREES;
  return degreesToRadians(closest);
};

const toMechanicalRotation = (angle) => {
  const normalized = normalizeDegrees(radiansToDegrees(angle));
  const mechanical = normalized > LEFT_ARM_MAX_DEGREES ? normalized - 360 : normalized;
  return degreesToRadians(clamp(mechanical, LEFT_ARM_MIN_DEGREES, LEFT_ARM_MAX_DEGREES));
};

export class Robot {
  constructor() {
    this.state = { walk: false, run: false, hover: false, jump: false, shoot: false };
    this.view = new Container();
    this.directionalView = new Container();
    this.glow = this.createGroundGlow();
    this.view.addChild(this.glow, this.directionalView);

    this.rig = new Container();
    this.rig.pivot.set(ART_WIDTH / 2, ART_HEIGHT);
    this.core = this.createPart('hakim-core');
    this.leftArm = this.createPart('hakim-left-arm');
    this.rightArm = this.createPart('hakim-right-arm');
    this.head = this.createPart('hakim-head');

    this.leftArm.pivot.copyFrom(LEFT_ARM_SOURCE_SHOULDER);
    this.leftArm.position.copyFrom(SHOULDER);
    this.leftArm.rotation = toMechanicalRotation(-LEFT_ARM_FORWARD_ANGLE);
    this.rightArm.pivot.copyFrom(RIGHT_ARM_PIVOT);
    this.rightArm.position.copyFrom(RIGHT_ARM_PIVOT);
    this.head.pivot.copyFrom(HEAD_PIVOT);
    this.head.position.copyFrom(HEAD_PIVOT);

    // The left arm is behind the core, so the core masks the fixed socket.
    this.rig.addChild(this.leftArm, this.head, this.core, this.rightArm);
    this.directionalView.addChild(this.rig);

    this.headFrames = { normal: this.head.texture };
    this.headReaction = null;
    this.time = 0;
    this.spawning = false;
    this.spawnTimer = 0;
    this.vy = 0;
    this.isJumping = false;
    this.groundY = null;
    this.airRings = [];
  }

  createPart(alias) {
    const sprite = Sprite.from(alias);
    sprite.anchor.set(0, 0);
    return sprite;
  }

  createGroundGlow() {
    const glow = new Graphics();
    glow.ellipse(0, 0, 255, 38).fill({ color: 0xc8fcfd, alpha: 0.12 });
    glow.ellipse(0, 0, 180, 24).fill({ color: 0xc8fcfd, alpha: 0.23 });
    glow.ellipse(0, 0, 102, 11).fill({ color: 0xf5ffff, alpha: 0.46 });
    glow.alpha = 0.78;
    return glow;
  }

  setHeadFrames(frames) {
    this.headFrames = { ...this.headFrames, ...frames };
    this.setHeadFrame('normal');
  }

  setHeadFrame(name) {
    this.head.texture = this.headFrames[name] || this.headFrames.normal;
  }

  triggerHeadAnimation(kind) {
    if (kind !== 'correct' && kind !== 'wrong') return;
    this.headReaction = {
      frame: kind === 'correct' ? 'happy' : 'sad',
      remaining: HEAD_REACTION_DURATION,
    };
    this.setHeadFrame(this.headReaction.frame);
  }

  updateHeadReaction(deltaTime) {
    if (!this.headReaction) return;
    this.headReaction.remaining -= deltaTime;
    if (this.headReaction.remaining <= 0) {
      this.headReaction = null;
      this.setHeadFrame('normal');
    }
  }

  spawnTakeoffRings() {
    for (let index = 0; index < 3; index += 1) {
      const view = new Graphics();
      view.ellipse(0, 0, 72, 10).stroke({ color: 0xc8fcfd, alpha: 0.72, width: 3 });
      view.alpha = 0;
      this.view.addChild(view);
      this.airRings.push({ view, age: -index * 5.5 });
    }
  }

  updateAirRings(deltaTime) {
    for (let index = this.airRings.length - 1; index >= 0; index -= 1) {
      const ring = this.airRings[index];
      ring.age += deltaTime;
      if (ring.age < 0) continue;
      const progress = ring.age / 24;
      if (progress >= 1) {
        ring.view.destroy();
        this.airRings.splice(index, 1);
        continue;
      }
      const eased = 1 - (1 - progress) ** 2;
      ring.view.position.set(0, (this.groundY ?? this.view.y) - this.view.y + 8);
      ring.view.scale.set(0.72 + eased * 1.25, 0.72 + eased * 1.25);
      ring.view.alpha = (1 - eased) * 0.7;
    }
  }

  spawn() {
    this.spawning = true;
    this.spawnTimer = 0;
    this.rig.scale.set(0);
    this.rig.alpha = 0;
    this.vy = 0;
    this.isJumping = false;
  }

  update(deltaTime = 1) {
    this.time += 0.05 * deltaTime;
    if (this.spawning) {
      this.spawnTimer += 0.05;
      const progress = Math.min(1, this.spawnTimer);
      const scale = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      this.rig.scale.set(scale);
      this.rig.alpha = progress;
      if (progress >= 1) {
        this.spawning = false;
        this.rig.scale.set(1);
      }
      return;
    }

    if (this.groundY === null) this.groundY = this.view.y;
    if (this.state.jump && !this.isJumping) {
      this.vy = -9.5;
      this.isJumping = true;
      this.spawnTakeoffRings();
    }
    if (this.isJumping) {
      this.vy += 0.38;
      this.view.y += this.vy;
      if (this.view.y >= this.groundY) {
        this.view.y = this.groundY;
        this.vy = 0;
        this.isJumping = false;
      }
    }

    const moving = this.state.walk || this.state.run;
    const hoverAmount = this.isJumping || this.state.hover ? HOVER_AMPLITUDE + 5 : HOVER_AMPLITUDE;
    const hoverY = -5 - Math.sin(this.time * HOVER_SPEED) * hoverAmount;
    const movementLean = moving ? this.direction * WALK_LEAN : 0;
    this.rig.y += (hoverY - this.rig.y) * dampAmount(11, deltaTime);
    this.rig.rotation = lerpAngle(this.rig.rotation, movementLean, dampAmount(8, deltaTime));
    this.rig.scale.set(1);

    // One damped right-arm target combines idle motion and movement/jump lag.
    const idleRotation = Math.sin(this.time * 1.65) * 0.045;
    const idleY = Math.sin(this.time * 1.28 + 0.7) * 7;
    const horizontalLag = moving ? -this.direction * 0.125 : 0;
    const verticalLag = clamp(this.vy * -0.009, -0.065, 0.065);
    const rightArmTargetRotation = idleRotation + horizontalLag + verticalLag;
    const rightArmTargetY = RIGHT_ARM_PIVOT.y + idleY + clamp(this.vy * 0.7, -10, 10);
    this.rightArm.rotation = lerpAngle(
      this.rightArm.rotation,
      rightArmTargetRotation,
      dampAmount(6.5, deltaTime),
    );
    this.rightArm.y += (rightArmTargetY - this.rightArm.y) * dampAmount(6.5, deltaTime);

    const hoverNormalized = (Math.sin(this.time * HOVER_SPEED) + 1) * 0.5;
    const nearGround = 1 - hoverNormalized;
    this.glow.position.set(0, (this.groundY ?? this.view.y) - this.view.y + 12);
    this.glow.alpha += ((0.38 + nearGround * 0.5) - this.glow.alpha) * dampAmount(8, deltaTime);
    const glowScale = 0.86 + nearGround * 0.22;
    this.glow.scale.set(glowScale, 0.91 + nearGround * 0.1);

    this.updateHeadReaction(deltaTime);
    this.updateAirRings(deltaTime);
  }

  aimAt(targetX, targetY) {
    if (this.isSpawning()) return;
    const target = this.rig.toLocal({ x: targetX, y: targetY });
    const requestedMuzzleAngle = Math.atan2(target.y - SHOULDER.y, target.x - SHOULDER.x);
    const safeMuzzleAngle = clampMuzzleAngle(requestedMuzzleAngle);
    const targetRotation = toMechanicalRotation(safeMuzzleAngle - LEFT_ARM_FORWARD_ANGLE);

    // This is the fixed shoulder source of truth. Pointer input can alter only
    // the rotation; the core stays above the socket in the render order.
    this.leftArm.position.copyFrom(SHOULDER);
    this.leftArm.rotation = toMechanicalRotation(lerpAngle(
      this.leftArm.rotation,
      targetRotation,
      0.26,
    ));
  }

  getMuzzlePosition() {
    return this.leftArm.toGlobal(LEFT_ARM_MUZZLE);
  }

  getGunAngle() {
    const muzzle = this.getMuzzlePosition();
    const forward = this.leftArm.toGlobal({
      x: LEFT_ARM_MUZZLE.x + Math.cos(LEFT_ARM_FORWARD_ANGLE) * 100,
      y: LEFT_ARM_MUZZLE.y + Math.sin(LEFT_ARM_FORWARD_ANGLE) * 100,
    });
    return Math.atan2(forward.y - muzzle.y, forward.x - muzzle.x);
  }

  isSpawning() { return this.spawning; }
  get direction() { return this.directionalView.scale.x > 0 ? 1 : -1; }
  set direction(value) { this.directionalView.scale.x = value; }
}
