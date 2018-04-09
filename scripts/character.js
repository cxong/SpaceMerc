// Base class for platformer character
import Phaser from 'phaser'

const JUMP_DOWN_DURATION = 200
const JUMP_GRACE_DURATION = 100

export default class extends Phaser.Sprite {
  constructor(game, group, bulletGroup, groups, x, y, sprite, stats) {
    super(game, x, y, sprite)
    group.add(this)
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.anchor.setTo(0.5)
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
    this.jumpDownCounter = 0
    this.onFloorCounter = 0

    this.guns = []
    this.gunIndex = 0

    this.game = game
    this.bulletGroup = bulletGroup
    this.groups = groups
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

  canFire() {
    if (!this.alive) {
      return false
    }
    const gun = this.guns[this.gunIndex]
    if (!gun || !gun.canFire()) {
      return false
    }
    return true
  }

  fire() {
    const gun = this.guns[this.gunIndex]
    gun.fire(this.getMuzzlePos(), this.getMuzzleV())
  }

  getMuzzlePos() {
    return new Phaser.Point(this.x, this.y)
  }

  getMuzzleV() {
    return this.dir
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
    if (this.guns[this.gunIndex]) {
      this.guns[this.gunIndex].update()
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

  kill() {
    super.kill()
    // Spawn an explosion sprite in the fx layer
    const fx = this.game.make.sprite(this.x, this.y, 'explosions/regular')
    fx.anchor.setTo(0.5)
    const anim = fx.animations.add('fx', [0, 1, 2, 3, 4, 5], 15, false)
    anim.killOnComplete = true
    fx.animations.play('fx')
    this.groups.fx.add(fx)
  }

  isOnFloor() {
    return this.onFloorCounter > 0
  }

  touchFloor() {
    this.onFloorCounter = JUMP_GRACE_DURATION
  }
}
