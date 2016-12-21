import Phaser from 'phaser'

const GRAVITY = 400
const SPEED = 130
const JUMP_SPEED = 350

export default class extends Phaser.Sprite {
  constructor(game, group, bulletGroup, x, y) {
    super(game, x, y, 'robut')
    group.add(this)
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.gravity.y = GRAVITY
    this.speed = SPEED

    this.wasOnFloor = false
    // animations
    // TODO

    this.sounds = {
      // TODO: alternate shoot sound
      shoot: game.add.audio('shoot')
      // TODO: death sound
    };

    this.game = game;
    this.bulletGroup = bulletGroup;
  }

  move(dx) {
    if (!this.alive) {
      return;
    }
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
    /*const bullet = this.bulletGroup.create(
      this.x, this.y + MUZZLE_OFFSET_Y, 'bullet')
    this.game.physics.enable(bullet, Phaser.Physics.ARCADE)
    bullet.anchor.setTo(0.5)
    const v = new Phaser.Point(this.scale.x, 0)
    v.add(
      (this.game.rnd.frac() - 0.5) * RECOIL,
      (this.game.rnd.frac() - 0.5) * RECOIL)
    v.setMagnitude(BULLET_SPEED)
    bullet.body.velocity = v
    bullet.rotation = Math.atan2(v.y, v.x)
    bullet.outOfBoundsKill = true
    bullet.body.gravity.y = 0
    this.sounds.shoot.play()
    this.fireCounter = FIRE_DURATION*/
  }

  jump() {
    if (!this.alive) {
      return;
    }
    // TODO: jumping
    /*this.animations.play('jump');
    this.body.velocity.setTo(0);
    this.sounds.jump.play();*/
    if (this.body.onFloor()) {
      this.body.velocity.y = -JUMP_SPEED
    }
  }

  update() {
    const onFloor = this.body.onFloor()
    if (onFloor && !this.wasOnFloor) {
      //this.sounds.land.play()
    }
    this.wasOnFloor = onFloor
    if (this.fireCounter > 0) {
      this.fireCounter -= this.game.time.physicsElapsedMS
    }
    // TODO: kill if too far to the left of screen
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