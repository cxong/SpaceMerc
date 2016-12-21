import Phaser from 'phaser'

const GRAVITY = 400
const SPEED = 100
const JUMP_SPEED = 210
const BULLET_SPEED = 400
const MUZZLE_OFFSET_Y = -22
const FIRE_DURATION = 150
const RECOIL = 0.05

export default class extends Phaser.Sprite {
  constructor(game, group, bulletGroup, x, y) {
    super(game, x, y)
    group.add(this)
    game.physics.enable(this, Phaser.Physics.ARCADE)
    // Add body parts
    const upper = this.addChild(game.add.sprite(0, -24, 'merc_upper'))
    upper.anchor.setTo(0.5)
    const legs = this.addChild(game.add.sprite(0, -8, 'merc_legs'))
    legs.anchor.setTo(0.5)
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
    // animations
    // TODO:
    //this.animations.add('lasso', [0, 1, 2, 3], 20, false);
    //this.animations.add('fire', [4, 5, 6, 7], 20, false);
    /*this.animations.add(
      'run_left', [8, 9, 10, 11], 20, true
    );
    this.animations.add(
      'run_right', [12, 13, 14, 15], 20, true
    );
    this.animations.add('run', [16, 17, 18, 19], 10, true);
    this.animations.add('idle', [24], 1, true);
    this.animations.play('idle');*/

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
    // TODO: pose/animation
    if (dx === 0) {
      //this.animations.play('idle');
      this.body.velocity.x = 0;
    } else {
      this.body.velocity.x = dx * this.speed
      this.scale.x = dx > 0 ? 1 : -1
      /*if (dx > 0) {
        this.animations.play('run_right');
      } else if (dx < 0) {
        this.animations.play('run_left');
      } else {
        this.animations.play('run');
      }*/
    }
  }

  fire() {
    if (!this.alive || this.fireCounter > 0) {
      return;
    }
    const bullet = this.bulletGroup.create(
      this.x, this.y + MUZZLE_OFFSET_Y, 'bullet')
    this.game.physics.enable(bullet, Phaser.Physics.ARCADE)
    bullet.anchor.setTo(0.5)
    const v = this.dir.clone()
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
