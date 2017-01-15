import Counter from './counter'
import { SCREEN_WIDTH, SCREEN_HEIGHT, TILE_SIZE } from './graphics'
import Robut from './robut'

const SPAWN_DURATION_LOW = 2000
const SPAWN_DURATION_HIGH = 4000

// Constantly spawn enemies from off screen towards the players
export default class {
  constructor(game, groups) {
    this.game = game
    this.groups = groups
    this.nextSpawnCounter = new Counter(SPAWN_DURATION_HIGH)
  }

  update(cameraX) {
    this.nextSpawnCounter.update(this.game.time.physicsElapsedMS)
    if (this.nextSpawnCounter.count <= 0) {
      // Only spawn robuts
      // TODO: other enemy types?

      // Spawn from left (and walk to right), or from right (and walk to left)
      const spawn = this.game.rnd.pick([
        { x: cameraX, moveX: 1 },
        { x: cameraX + SCREEN_WIDTH, moveX: -1 }
      ])
      const enemy = new Robut(
        this.game, this.groups, spawn.x,
        this.game.rnd.integerInRange(
          TILE_SIZE * 2, SCREEN_HEIGHT - TILE_SIZE * 2))
      enemy.moveX = spawn.moveX
      this.nextSpawnCounter.reset(
        this.game.rnd.realInRange(SPAWN_DURATION_LOW, SPAWN_DURATION_HIGH))
    }
  }
}
