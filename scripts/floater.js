import Phaser from 'phaser'
import Counter from './counter'

const MOVE_DURATION = 2000
const MAX_SPEED = 120

export default class extends Phaser.Sprite {
  constructor(game, groups, x, y) {
    super(game, x, y, 'floater')
    groups.enemies.add(this)
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.anchor.setTo(0.5)

    this.dir = new Phaser.Point(1, 0)
    this.moveCounter = new Counter(MOVE_DURATION)

    this.game = game
    this.bulletGroup = groups.enemyBullets
    this.groups = groups

    this.state = 'roam'
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

  update() {
    // Update counters
    this.moveCounter.update(this.game.time.physicsElapsedMS)

    // Pose
    this.frame = Math.abs(this.body.velocity.x) > MAX_SPEED / 4 ? 0 : 1
    this.scale.x = this.body.velocity.x > 0 ? 1 : -1

    switch (this.state) {
      case 'roam': {
        if (this.moveCounter.count <= 0) {
          // TODO: stop and go/fire
          this.dir = this.game.rnd.pick([
            new Phaser.Point(0, -1),
            new Phaser.Point(1, -1),
            new Phaser.Point(1, 0),
            new Phaser.Point(1, 1),
            new Phaser.Point(0, 1),
            new Phaser.Point(-1, 1),
            new Phaser.Point(-1, 0),
            new Phaser.Point(-1, -1)
          ]).normalize()
          this.moveCounter.reset()
        }
        const v = this.dir.clone()
        const half = MOVE_DURATION / 2
        if (this.moveCounter.count > half) {
          this.body.velocity = v.setMagnitude(
            (MOVE_DURATION - this.moveCounter.count) / half * MAX_SPEED)
        } else {
          this.body.velocity = v.setMagnitude(
            this.moveCounter.count/ half * MAX_SPEED)
        }
        break
      }
    }
  }

  kill() {
    super.kill()
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
