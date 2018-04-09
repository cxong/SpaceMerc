import Phaser from 'phaser'
import { MAX_HEALTH, TILE_SIZE } from './graphics'
import Character from './character'
import Gun from './gun'

const JUMP_DURATION_S = 0.4
const JUMP_HEIGHT = TILE_SIZE * 3.5
const SPEED = 80
const MUZZLE_OFFSET_Y = -22
const MUZZLE_OFFSET_X_UP = 3
const MUZZLE_OFFSET_Y_PRONE = -6
const MUZZLE_LENGTH = 16
const UPPER_RECOIL_DURATION = 30
const UPPER_Y = -24
const UPPER_PRONE_X = 6
const UPPER_PRONE_Y = -8
const LEGS_X = 0
const LEGS_Y = -8
const LEGS_PRONE_X = -6
const LEGS_PRONE_Y = -8

const RIFLE_FIRE_DURATION = 150
const ROCKET_FIRE_DURATION = 250

export default class extends Character {
  constructor(game, groups, x, y) {
    super(game, groups.players, groups.playerBullets, groups, x, y, undefined, {
      jumpHeight: JUMP_HEIGHT, jumpDurationS: JUMP_DURATION_S, speed: SPEED
    })

    this.health = MAX_HEALTH

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
    this.setPose(0, 0)

    this.upperRecoilCounter = 0

    this.sounds = {
      jump: game.add.audio('jump'),
      land: game.add.audio('land')
    }

    this.guns = [
      new Gun(game, this.bulletGroup, 'rifle', 'shoot', {
        fireDuration: RIFLE_FIRE_DURATION
      }),
      new Gun(game, this.bulletGroup, 'rocket', 'rocket', {
        fireDuration: ROCKET_FIRE_DURATION
      })
    ]
    this.gunIndex = 0
  }

  fire() {
    super.fire()
    this.upperRecoilCounter = UPPER_RECOIL_DURATION
  }

  getMuzzlePos() {
    const muzzlePos = new Phaser.Point(this.x, this.y)
    const isFacingUp = this.dir.x === 0 && this.dir.y === -1
    const isFalling = !this.isOnFloor() && !this.isJumping
    const isFacingDown = this.dir.x === 0 && this.dir.y === 1 && isFalling
    const isProne = this.isOnFloor() && this.dir.x === 0 && this.dir.y === 1
    muzzlePos.add(
      (isFacingUp || isFacingDown) ? MUZZLE_OFFSET_X_UP * this.scale.x : 0,
      isProne ? MUZZLE_OFFSET_Y_PRONE : MUZZLE_OFFSET_Y)
    const v = this.getMuzzleV()
    muzzlePos.add(v.x * MUZZLE_LENGTH, v.y * MUZZLE_LENGTH)
    return muzzlePos
  }

  getMuzzleV() {
    const isProne = this.isOnFloor() && this.dir.x === 0 && this.dir.y === 1
    return (isProne ? new Phaser.Point(this.scale.x, 0) : this.dir).clone().normalize()
  }

  onJump() {
    this.sounds.jump.play()
  }

  onJumpUp() {
    this.upper.animations.play('jump')
    this.legs.animations.play('jump')
  }

  onLand() {
    this.sounds.land.play()
  }

  switchWeapon() {
    this.gunIndex = (this.gunIndex + 1) % this.guns.length
  }

  update() {
    super.update()
    // Update counters
    if (this.upperRecoilCounter > 0) {
      this.upperRecoilCounter -= this.game.time.physicsElapsedMS
    }

    // Slow health regen
    this.health = Math.min(
      MAX_HEALTH, this.health + this.game.time.physicsElapsedMS * 0.0003)

    this.setPose()
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
}
