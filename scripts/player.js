import Phaser from 'phaser'

const GRAVITY = 400
const SPEED = 100
const JUMP_SPEED = 210
const BULLET_SPEED = 400
const MUZZLE_OFFSET_Y = -22
const MUZZLE_OFFSET_X_UP = 3
const MUZZLE_LENGTH = 16
const FIRE_DURATION = 150
const RECOIL = 0.05
const UPPER_RECOIL_DURATION = 30
const UPPER_Y = -24

export default class extends Phaser.Sprite {
  constructor(game, group, bulletGroup, x, y) {
    super(game, x, y)
    group.add(this)
    game.physics.enable(this, Phaser.Physics.ARCADE)

    // Add body parts
    this.upper = this.addChild(game.add.sprite(0, UPPER_Y, 'merc_upper'))
    this.upper.anchor.setTo(0.5)
    this.legs = this.addChild(game.add.sprite(0, -8, 'merc_legs'))
    this.legs.anchor.setTo(0.5)
    this.legs.animations.add('idle', [0], 1, false)
    this.legs.animations.add('run', [4, 5, 6, 7], 7, true)

    this.body.collideWorldBounds = true
    // Slightly smaller body
    this.body.setSize(10, 24, (32 - 10) / 2, 32 - 24);
    this.anchor.setTo(0.5, 1)
    this.body.gravity.y = GRAVITY
    this.speed = SPEED
    this.dir = new Phaser.Point(1, 0)
    this.onFloor = false

    this.wasOnFloor = false
    this.fireCounter = 0
    this.upperRecoilCounter = 0

    this.invincibilityCounter = 0;

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
    const dir = new Phaser.Point(dx, dy).normalize()
    if (dir.isZero()) {
      this.dir = new Phaser.Point(this.scale.x, 0)
    } else {
      this.dir = dir
    }
    // Direction pose
    if (dx === 0) {
      if (dy === -1) {
        this.upper.frame = 3
      } else {
        // TODO: crouching dy === 1
        this.upper.frame = 0
      }
    } else {
      if (dy === -1) {
        this.upper.frame = 1
      } else if (dy === 1) {
        this.upper.frame = 2
      } else {
        this.upper.frame = 0
      }
    }
    // Running
    if (dx === 0) {
      this.legs.animations.play('idle')
      this.body.velocity.x = 0;
    } else {
      this.body.velocity.x = dx * this.speed
      this.scale.x = dx > 0 ? 1 : -1
      this.legs.animations.play('run')
    }
  }

  fire() {
    if (!this.alive || this.fireCounter > 0) {
      return;
    }
    const muzzlePos = new Phaser.Point(this.x, this.y)
    const isFacingUp = this.dir.x === 0 && this.dir.y === -1
    muzzlePos.add(
      isFacingUp ? MUZZLE_OFFSET_X_UP * this.scale.x : 0, MUZZLE_OFFSET_Y)
    const v = this.dir.clone()
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
    // TODO: animation
    /*this.animations.play('jump');
    this.body.velocity.setTo(0);
    this.sounds.jump.play();*/
    if (this.body.onFloor() || this.onFloor) {
      this.body.velocity.y = -JUMP_SPEED
      this.sounds.jump.play()
    }
  }

  update() {
    const onFloor = this.body.onFloor() || this.onFloor
    if (onFloor && !this.wasOnFloor) {
      this.sounds.land.play()
    }
    this.wasOnFloor = onFloor
    if (this.fireCounter > 0) {
      this.fireCounter -= this.game.time.physicsElapsedMS
    }
    if (this.upperRecoilCounter > 0) {
      this.upperRecoilCounter -= this.game.time.physicsElapsedMS
    }
    this.upper.x = 0
    this.upper.y = UPPER_Y
    if (this.upperRecoilCounter > 0) {
      // TODO: jumping
      if (this.dir.x === 0) {
        if (this.dir.y === -1) {
          this.upper.y += 2
        }
        // TODO: crouching
      } else {
        this.upper.x += 2 * this.scale.x
      }
    }
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
}
