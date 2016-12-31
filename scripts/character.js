// Base class for platformer character
import Phaser from 'phaser'

const JUMP_DOWN_DURATION = 200
const JUMP_GRACE_DURATION = 100

export default class extends Phaser.Sprite {
  constructor(game, group, bulletGroup, x, y, sprite, stats) {
    super(game, x, y, sprite)
    group.add(this)
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.stats = stats
    this.stats.jumpSpeed = 2 * stats.jumpHeight / stats.jumpDurationS
    this.stats.gravity = 2 * stats.jumpHeight / (stats.jumpDurationS * stats.jumpDurationS)

    this.dir = new Phaser.Point(1, 0)
    this.body.gravity.y = this.stats.gravity
    this.moveX = 0
    this.isJumping = false
    this.isOnPlatform = false

    this.wasOnFloor = false
    // TODO: refactor counters
    this.fireCounter = 0
    this.jumpDownCounter = 0
    this.onFloorCounter = 0

    this.game = game
    this.bulletGroup = bulletGroup
  }

  move(dx, dy) {
    if (!this.alive) {
      return;
    }
    const dir = new Phaser.Point(dx, dy)
    if (dir.isZero()) {
      this.dir = new Phaser.Point(this.scale.x, 0)
    } else {
      this.dir = dir
    }
    if (this.isOnFloor() || dx !== 0) {
      this.moveX = dx
    }
  }

  fire() {
    if (!this.alive || this.fireCounter > 0) {
      return;
    }
    this.addBullet()
    this.fireCounter = this.stats.fireDuration
  }

  addBullet() {
    // override
  }

  jump() {
    if (!this.alive) {
      return;
    }
    if (this.body.onFloor() || this.isOnFloor()) {
      this.onJump()
      this.onFloorCounter = 0
      if (this.dir.y === 1 && this.isOnPlatform) {
        // Jump below platform
        this.jumpDownCounter = JUMP_DOWN_DURATION
      } else {
        this.onJumpUp()
        this.body.velocity.y = -this.stats.jumpSpeed
        this.isJumping = true
      }
    }
  }

  onJump() {
    // override
  }

  onJumpUp() {
    // override
  }

  update() {
    const onFloor = this.body.onFloor() || this.isOnFloor()
    if (onFloor && !this.wasOnFloor) {
      this.onLand()
      this.isJumping = false
    }
    this.wasOnFloor = onFloor

    // Update counters
    if (this.fireCounter > 0) {
      this.fireCounter -= this.game.time.physicsElapsedMS
    }
    if (this.jumpDownCounter > 0) {
      this.jumpDownCounter -= this.game.time.physicsElapsedMS
    }
    if (this.onFloorCounter > 0) {
      this.onFloorCounter -= this.game.time.physicsElapsedMS
    }

    // Running
    if (this.moveX === 0) {
      this.body.velocity.x = 0
    } else {
      this.body.velocity.x = this.moveX * this.stats.speed
      this.scale.x = this.moveX > 0 ? 1 : -1
    }
    if (this.invincibilityCounter > 0) {
      this.invincibilityCounter -= this.game.time.physicsElapsedMS
      // Blink when invincible
      this.visible = this.invincibilityCounter / 4 % 4 > 1;
    } else {
      this.visible = this.alive;
    }
  }

  onLand() {
    // override
  }

  killAndLeaveCorpse() {
    this.kill();
    // Leave a limited corpse on the background layer
    /*var corpse = this.game.make.sprite(
      this.x, this.y, this.key);
    corpse.anchor.setTo(0.5);
    corpse.animations.add(
      'die', [20, 21, 22, 23], 4, false
    );
    corpse.animations.play('die');
    corpse.lifespan = 1000;
    this.bgGroup.add(corpse);*/
  }

  isOnFloor() {
    return this.onFloorCounter > 0
  }

  touchFloor() {
    this.onFloorCounter = JUMP_GRACE_DURATION
  }
}
