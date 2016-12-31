import { SCREEN_WIDTH } from './graphics'
import Robut from './robut'
import Shorty from './shorty'

const MIN_INTERVAL = 100
const Y = 100

// Spawn enemies by location, randomly across the map
export default class {
  constructor(game, groups) {
    this.game = game
    this.groups = groups
    this.nextSpawnX = 0
  }

  update(cameraX) {
    if (this.nextSpawnX < cameraX + SCREEN_WIDTH) {
      // Generate new positions for enemies
      const positions = []
      const minX = this.nextSpawnX + MIN_INTERVAL
      const maxX = this.nextSpawnX + SCREEN_WIDTH - MIN_INTERVAL
      for (let i = 0; i < 3; i++) {
        positions.push(minX + this.game.rnd.frac() * (maxX - minX))
      }
      // Leave minimal gaps between random positions
      for (let j = 0; j < 100; j++) {
        let tooClose = false
        for (let i = 0; i < 3; i++) {
          if (i > 0 && positions[i] - positions[i-1] < MIN_INTERVAL) {
            if (positions[i] < maxX) {
              positions[i]++
            }
            tooClose = true
          } else if (i < 3 && positions[i+1] - positions[i] < MIN_INTERVAL) {
            if (positions[i] > minX) {
              positions[i]--
            }
            tooClose = true
          }
        }
        if (!tooClose) {
          break
        }
      }
      // Spawn the enemies
      for (let position of positions) {
        switch (this.game.rnd.pick([0, 1])) {
          case 0:
            new Robut(
              this.game, this.groups.enemies, this.groups.enemyBullets,
              position, Y)
            break
          case 1:
            new Shorty(
              this.game, this.groups.enemies, this.groups.enemyBullets,
              position, Y)
            break
        }
      }
      this.nextSpawnX += SCREEN_WIDTH
    }
  }
}
