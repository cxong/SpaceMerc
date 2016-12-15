import { choose } from './graphics'

// Controls difficulty and enemy spawning
export default class {
  constructor(game, groups) {
    this.wave = 0;
    this.game = game;
    this.groups = groups;
  }

  waveTotal() {
    return 4 + Math.floor(Math.sqrt(this.wave)*2);
  }

  spawn() {
    var total = 4 + Math.floor(Math.sqrt(this.wave)*2);
    let choices = ['robut', 'shorty', 'floater'];
    if (this.wave === 1) {
      // Always start with robuts
      choices = ['robut'];
    } else if (this.wave === 2) {
      choices = ['robut', 'shorty'];
    }
    for (var i = 0; i < total; i++) {
      this.spawnOne(choose(choices))
    }
  }

  spawnOne(key) {
    // TODO: Spawn
    /*new Enemy(
      this.game,
      this.groups.enemies, this.groups.enemyBullets,
      this.groups.players,
      Math.random() * SCREEN_WIDTH, 0,
      EnemyTypes[key], true, this);*/
  }
}
