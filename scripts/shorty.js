import { TILE_SIZE } from './graphics'
import Character from './character'
import Counter from './counter'

const JUMP_DURATION_S = 0.3
const JUMP_HEIGHT = TILE_SIZE * 2.1
const SPEED = 70
const IDLE_DURATION = 500

export default class extends Character {
  constructor(game, groups, x, y) {
    super(game, groups.enemies, groups.enemyBullets, groups, x, y, 'shorty', {
      jumpHeight: JUMP_HEIGHT, jumpDurationS: JUMP_DURATION_S,
      speed: SPEED
    })

    // animations
    this.animations.add('jump', [0, 1, 2, 1], 10, false)
    this.animations.add('land', [0, 1, 2, 1, 0], 15, false)

    this.sounds = {
      // TODO: death sound
    }
    
    // TODO: guns

    this.state = 'idle'
    this.idleCounter = new Counter(IDLE_DURATION)
    this.moveX = this.game.rnd.pick([-1, 1])
    this.moveXSave = this.moveX
  }

  onLand() {
    this.state = 'idle'
    this.idleCounter.reset()
    this.animations.play('land')
  }

  update() {
    super.update()
    switch (this.state) {
      case 'before_jump':
        // Wait until the jump animation finishes
        break
      case 'jump':
        this.move(this.moveXSave, 0)
        break
      case 'idle':
        this.move(0, 0)
        if (this.isOnFloor()) {
          this.idleCounter.update(this.game.time.physicsElapsedMS)
        }
        if (this.idleCounter.count <= 0) {
          this.state = 'before_jump'
          const anim = this.animations.play('jump')
          anim.onComplete.add((shorty) => {
            shorty.state = 'jump'
            shorty.frame = 0
            shorty.jump()
            shorty.move(shorty.moveXSave, 0)
          })
        }
        break
    }
  }
}
