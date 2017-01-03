import { TILE_SIZE } from './graphics'
import Character from './character'
import Counter from './counter'

const JUMP_DURATION_S = 0.7
const JUMP_HEIGHT = TILE_SIZE * 2.5
const SPEED = 85

export default class extends Character {
  constructor(game, group, bulletGroup, x, y) {
    super(game, group, bulletGroup, x, y, 'robut', {
      jumpHeight: JUMP_HEIGHT, jumpDurationS: JUMP_DURATION_S,
      // TODO: shooting
      //fireDuration: FIRE_DURATION,
      speed: SPEED
    })

    // animations
    // TODO

    this.sounds = {
      // TODO: alternate shoot sound
      shoot: game.add.audio('shoot')
      // TODO: death sound
    };

    this.state = 'roam'
    this.edgeBehavior = this.game.rnd.pick(['continue', 'jump', 'reverse'])
    this.reverseCounter = new Counter(100)
    this.moveX = this.game.rnd.pick([-1, 1])
  }

  update() {
    super.update()
    this.reverseCounter.update(this.game.time.physicsElapsedMS)
    switch (this.state) {
      case 'roam':
        this.move(this.moveX, 0)
        // Platform edge behaviour
        // Jump as soon as we reach the end of a platform
        if (this.body.velocity.y > 0) {
          switch (this.edgeBehavior) {
            case 'continue':
              // do nothing
              break
            case 'jump':
              this.jump()
              break
            case 'reverse':
              if (this.reverseCounter.count <= 0) {
                this.moveX = -this.moveX
                this.reverseCounter.reset()
              }
              break
          }
        }
        break
    }
  }
}
