import Phaser from 'phaser'
import { TILE_SIZE } from './graphics'

const JUMP_DURATION_S = 0.4
const JUMP_HEIGHT = TILE_SIZE * 3.5
const SPEED = 80
const GRAVITY = 2 * JUMP_HEIGHT / (JUMP_DURATION_S * JUMP_DURATION_S)
const JUMP_SPEED = 2 * JUMP_HEIGHT / JUMP_DURATION_S
const BULLET_SPEED = 400
const JUMP_DOWN_DURATION = 200
const MUZZLE_OFFSET_Y = -22
const MUZZLE_OFFSET_X_UP = 3
const MUZZLE_OFFSET_Y_PRONE = -6
const MUZZLE_LENGTH = 16
const FIRE_DURATION = 150
const RECOIL = 0.05
const UPPER_RECOIL_DURATION = 30
const UPPER_Y = -24
const UPPER_PRONE_X = 6
const UPPER_PRONE_Y = -8
const LEGS_X = 0
const LEGS_Y = -8
const LEGS_PRONE_X = -6
const LEGS_PRONE_Y = -8
const JUMP_GRACE_DURATION = 100

export default class extends Phaser.Sprite {
  constructor(game, group, bulletGroup, x, y) {
    super(game, x, y)
    group.add(this)
    game.physics.enable(this, Phaser.Physics.ARCADE)

    // Add body parts
    this.upper = this.addChild(game.add.sprite(0, UPPER_Y, 'merc_upper'))
    this.upper.anchor.setTo(0.5)
    this.upper.animations.add('jump', [6, 7, 8, 9], 10, true)
    this.legs = this.addChild(game.add.sprite(LEGS_X, LEGS_Y, 'merc_legs'))
    this.legs.anchor.setTo(0.5)
    this.legs.animations.add('idle', [0], 1, false)
    this.legs.animations.add('run', [4, 5, 6, 7], 7, true)
    this.legs.animations.add('prone', [8], 1, false)
    this.legs.animations.add('jump', [1], 1, false)
    this.legs.animations.add('fall', [6], 1, false)

    this.body.collideWorldBounds = true
    this.anchor.setTo(0.5, 1)
    this.body.gravity.y = GRAVITY
    this.dir = new Phaser.Point(1, 0)
    this.moveX = 0
    this.isJumping = false
    this.isOnPlatform = false
    this.setPose(0, 0)

    this.wasOnFloor = false
    this.fireCounter = 0
    this.upperRecoilCounter = 0
    this.jumpDownCounter = 0
    this.onFloorCounter = 0

    this.invincibilityCounter = 0

    this.sounds = {
      jump: game.add.audio('jump'),
      land: game.add.audio('land'),
      shoot: game.add.audio('shoot')
    };

    this.game = game;
    this.bulletGroup = bulletGroup;
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
    const muzzlePos = new Phaser.Point(this.x, this.y)
    const isFacingUp = this.dir.x === 0 && this.dir.y === -1
    const isFalling = !this.isOnFloor() && !this.isJumping
    const isFacingDown = this.dir.x === 0 && this.dir.y === 1 && isFalling
    const isProne = this.isOnFloor() && this.dir.x === 0 && this.dir.y === 1
    muzzlePos.add(
      (isFacingUp || isFacingDown) ? MUZZLE_OFFSET_X_UP * this.scale.x : 0,
      isProne ? MUZZLE_OFFSET_Y_PRONE : MUZZLE_OFFSET_Y)
    const v = (isProne ? new Phaser.Point(this.scale.x, 0) : this.dir).clone().normalize()
    muzzlePos.add(v.x * MUZZLE_LENGTH, v.y * MUZZLE_LENGTH)
    const bullet = this.bulletGroup.create(muzzlePos.x, muzzlePos.y, 'bullet')
    this.game.physics.enable(bullet, Phaser.Physics.ARCADE)
    bullet.anchor.setTo(0.5)
    v.add(
      (this.game.rnd.frac() - 0.5) * RECOIL,
      (this.game.rnd.frac() - 0.5) * RECOIL)
    v.setMagnitude(BULLET_SPEED)
    bullet.body.velocity = v
    bullet.rotation = Math.atan2(v.y, v.x)
    bullet.outOfBoundsKill = true
    bullet.body.gravity.y = 0
    this.sounds.shoot.play()
    this.fireCounter = FIRE_DURATION
    this.upperRecoilCounter = UPPER_RECOIL_DURATION
  }

  jump() {
    if (!this.alive) {
      return;
    }
    if (this.body.onFloor() || this.isOnFloor()) {
      this.sounds.jump.play()
      this.onFloorCounter = 0
      if (this.dir.y === 1 && this.isOnPlatform) {
        // Jump below platform
        this.jumpDownCounter = JUMP_DOWN_DURATION
      } else {
        this.body.velocity.y = -JUMP_SPEED
        this.upper.animations.play('jump')
        this.legs.animations.play('jump')
        this.isJumping = true
      }
    }
  }

  update() {
    const onFloor = this.body.onFloor() || this.isOnFloor()
    if (onFloor && !this.wasOnFloor) {
      this.sounds.land.play()
      this.isJumping = false
    }
    this.wasOnFloor = onFloor

    // Update counters
    if (this.fireCounter > 0) {
      this.fireCounter -= this.game.time.physicsElapsedMS
    }
    if (this.upperRecoilCounter > 0) {
      this.upperRecoilCounter -= this.game.time.physicsElapsedMS
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
      this.body.velocity.x = this.moveX * SPEED
      this.scale.x = this.moveX > 0 ? 1 : -1
    }
    this.setPose()
    if (this.invincibilityCounter > 0) {
      this.invincibilityCounter -= this.game.time.physicsElapsedMS
      // Blink when invincible
      this.visible = this.invincibilityCounter / 4 % 4 > 1;
    } else {
      this.visible = this.alive;
    }
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

  setPose() {
    this.upper.x = 0
    this.upper.y = UPPER_Y
    this.legs.x = LEGS_X
    this.legs.y = LEGS_Y

    // Upper body
    if (!this.isJumping) {
      this.upper.animations.stop()
      if (this.dir.x === 0) {
        if (this.dir.y === -1) {
          this.upper.frame = 3
        } else if (this.dir.y === 1) {
          if (this.isOnFloor()) {
            this.upper.frame = 4
            this.upper.x = UPPER_PRONE_X
            this.upper.y = UPPER_PRONE_Y
          } else {
            this.upper.frame = 5
          }
        } else {
          this.upper.frame = 0
        }
      } else {
        if (this.dir.y === -1) {
          this.upper.frame = 1
        } else if (this.dir.y === 1) {
          this.upper.frame = 2
        } else {
          this.upper.frame = 0
        }
      }

      // Recoil
      if (this.upperRecoilCounter > 0) {
        if (this.dir.x === 0 && this.dir.y === -1) {
          // Firing up, recoil down
          this.upper.y += 2
        } else if (this.dir.x === 0 && this.dir.y === 1 &&
          !this.isOnFloor() && !this.isJumping){
          // Firing down, falling
          this.upper.y -= 2
        } else {
          this.upper.x += 2 * this.scale.x
        }
      }
    }

    // Legs
    if (this.isOnFloor()) {
      if (this.moveX === 0) {
        if (this.dir.y === 1) {
          this.legs.animations.play('prone')
          this.legs.x = LEGS_PRONE_X
          this.legs.y = LEGS_PRONE_Y
        } else {
          this.legs.animations.play('idle')
        }
      } else {
        this.legs.animations.play('run')
      }
    } else if (!this.isJumping) {
      this.legs.animations.play('fall')
    }

    // Body size
    if (this.isOnFloor() && this.dir.x === 0 && this.dir.y === 1) {
      // Prone size
      this.body.setSize(10, 14, (32 - 10) / 2, 32 - 14)
    } else {
      // Normal size
      this.body.setSize(10, 28, (32 - 10) / 2, 32 - 28)
    }
  }

  isOnFloor() {
    return this.onFloorCounter > 0
  }

  touchFloor() {
    this.onFloorCounter = JUMP_GRACE_DURATION
  }
}
