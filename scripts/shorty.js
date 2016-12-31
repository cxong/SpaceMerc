import { TILE_SIZE } from './graphics'
import Character from './character'

const JUMP_DURATION_S = 0.5
const JUMP_HEIGHT = TILE_SIZE * 2.1
const SPEED = 40

export default class extends Character {
  constructor(game, group, bulletGroup, x, y) {
    super(game, group, bulletGroup, x, y, 'shorty', {
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
    this.moveX = this.game.rnd.pick([-1, 1])
  }

  update() {
    super.update()
    switch (this.state) {
      case 'roam':
        this.move(this.moveX, 0)
        this.jump()
        break
    }
  }
}
