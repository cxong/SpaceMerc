import Phaser from 'phaser'

const stats = {
  'rifle': {
    sprite: 'bullet',
    speed: 400,
    recoil: 0.05
  },
  'rocket': {
    sprite: 'rocket',
    speed: 300,
    recoil: 0.1,
    emitter: {
      sprite: 'smoke',
      alpha: [1, 0.1, 500],
      scale: [0.2, 1, 500],
      lifespan: 200,
      frequency: 15
    }
  }
}

export default class extends Phaser.Sprite {
  constructor(game, x, y, key, velocity) {
    super(game, x, y, stats[key].sprite)
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.anchor.setTo(0.5)
    const v = velocity
    v.add(
      (this.game.rnd.frac() - 0.5) * stats[key].recoil,
      (this.game.rnd.frac() - 0.5) * stats[key].recoil)
    v.setMagnitude(stats[key].speed)
    this.body.velocity = v
    this.rotation = Math.atan2(v.y, v.x)
    this.outOfBoundsKill = true
    this.body.gravity.y = 0

    if (stats[key].emitter) {
      this.emitter = game.add.emitter(0, 0, 0)
      const e = stats[key].emitter
      this.emitter.setXSpeed(0, 0)
      this.emitter.setYSpeed(0, 0)
      this.emitter.makeParticles(e.sprite)
      this.emitter.setAlpha(e.alpha[0], e.alpha[1], e.alpha[2])
      this.emitter.gravity = 0
      this.emitter.setScale(
        e.scale[0], e.scale[1], e.scale[0], e.scale[1],
        e.scale[2], Phaser.Easing.Quintic.Out)
      this.emitter.start(false, e.lifespan, e.frequency)
    }
  }

  update() {
    if (this.emitter) {
      this.emitter.x = this.x
      this.emitter.y = this.y
    }
  }

  kill() {
    super.kill()
    if (this.emitter) {
      this.emitter.on = false
    }
  }

  destroy() {
    super.destroy()
    if (this.emitter) {
      this.emitter.on = false
    }
  }
}
