import Phaser from 'phaser'
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './graphics'
import LocationSpawner from './location_spawner'
import MapGen from './mapgen'
import Music from './music'
import Player from './player'
import Wave from './wave'

export default class extends Phaser.State {
  preload() {
    this.resetKeys();
  }

  create() {
    this.game.stage.backgroundColor = 0x4f3458;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.sounds = {
      catch: this.game.add.audio('catch'),
      die: this.game.add.audio('die'),
      hit: this.game.add.audio('hit'),
      nospawn: this.game.add.audio('nospawn'),
      respawn: this.game.add.audio('respawn'),
      spawn: this.game.add.audio('spawn')
    }
    this.music = new Music(this.game)

    this.groups = {
      ground: this.game.add.group(),
      bg: this.game.add.group(),
      platforms: this.game.add.group(),
      enemies: this.game.add.group(),
      players: this.game.add.group(),
      enemyBullets: this.game.add.group(),
      playerBullets: this.game.add.group(),
      ui: this.game.add.group()
    };

    /*const ground = this.game.add.tileSprite(
      0, SCREEN_HEIGHT - 43, SCREEN_WIDTH, 43, 'ground');
    this.groups.ground.add(ground);*/

    this.text = this.game.add.text(
      SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, '', {
        font: '36px VT323', fill: '#fff', align: 'center'
      }
    );
    this.text.anchor.set(0.5);
    this.groups.ui.add(this.text);

    // States: title, play, over
    this.restart();
  }

  restart() {
    this.state = 'title';
    //this.groups.dialogs.alpha = 1;
    this.game.input.keyboard.addKey(Phaser.Keyboard.X).onDown.add(function() {
      this.start();
    }, this);
    this.music.play('title')
  }

  start() {
    // Hide dialog
    //this.groups.dialogs.alpha = 0;

    // Spawn player and enemies

    this.groups.bg.destroy(true, true);

    this.groups.players.destroy(true, true);
    this.spawnPlayer();

    this.groups.enemies.destroy(true, true);
    this.wave = new Wave(this.game, this.groups)
    // Enemies will be spawned automatically by wave
    this.locationSpawner = new LocationSpawner(this.game, this.groups)
    this.mapgen = new MapGen(this.game, this.groups.platforms)

    // Initialise controls
    this.resetKeys();
    this.keys = this.game.input.keyboard.addKeys({
      up: Phaser.Keyboard.UP,
      down: Phaser.Keyboard.DOWN,
      left: Phaser.Keyboard.LEFT,
      right: Phaser.Keyboard.RIGHT,
      fire: Phaser.Keyboard.X,
      jump: Phaser.Keyboard.Z
    });

    this.state = 'play';
    this.music.play('l1')
  }

  spawnPlayer() {
    this.player = new Player(
      this.game,
      this.groups.players, this.groups.playerBullets,
      SCREEN_WIDTH / 2, SCREEN_HEIGHT - 50, []);
    this.sounds.respawn.play();
  }

  gameEnd() {
    this.state = 'over';
    this.resetKeys();
    this.game.input.keyboard.addKey(Phaser.Keyboard.X).onDown.add(function() {
      this.restart();
    }, this);
    this.setText('Game Over');
    // TODO: sad game over music
  }

  update() {
    if (this.state === 'play') {
      this.textCounter -= this.game.time.elapsed;
      if (this.textCounter <= 0) {
        this.text.alpha = 0;
      }

      // TODO: camera and update
      this.locationSpawner.update(0)
      this.mapgen.update(0)

      // Move using arrow keys
      let dx = 0
      if (this.keys.left.isDown) {
        dx = -1
      } else if (this.keys.right.isDown) {
        dx = 1
      }
      let dy = 0
      if (this.keys.up.isDown) {
        dy = -1
      } else if (this.keys.down.isDown) {
        dy = 1
      }
      this.player.move(dx, dy);

      // firing
      if (this.keys.fire.isDown) {
        this.player.fire();
      }

      // Jumping
      if (this.keys.jump.isDown) {
        this.player.jump();
      }

      // End game
      if (!this.player.alive) {
        this.gameEnd();
      }
    }

    // Depth sort
    this.groups.enemies.sort(
      'y', Phaser.Group.SORT_ASCENDING);
    this.groups.players.sort(
      'y', Phaser.Group.SORT_ASCENDING);

    // Platforming
    this.groups.players.forEach((player) => {
      player.onFloor = false
    })
    this.game.physics.arcade.collide(
      this.groups.players, this.groups.platforms, (player, platform) => {
        player.onFloor = player.body.touching.down
      }, (player, platform) => {
        // Don't collide if jumping
        return player.body.velocity.y >= 0
      })
    this.game.physics.arcade.collide(this.groups.enemies, this.groups.platforms)

    // Player bullets to enemy
    this.game.physics.arcade.overlap(
      this.groups.playerBullets, this.groups.enemies,
      function(bullet, enemy) {
        // TODO: enemy kill effects
        bullet.kill();
        enemy.killAndLeaveCorpse();
        this.sounds.hit.play();
      }, null, this
    );

    // Enemy bullets to players
    this.game.physics.arcade.overlap(
      this.groups.enemyBullets, this.groups.players,
      function(bullet, player) {
        if (player.invincibilityCounter > 0) {
          // Can't kill when invincible
          return;
        }
        player.damage(10);
        this.sounds.hit.play();
      }, null, this
    );

    // Enemy spawning
    // Note: spawn next wave if less than half wave
    // remaining
    if (this.wave &&
      this.groups.enemies.countLiving() < this.wave.waveTotal() / 2) {
      this.wave.wave++;
      this.wave.spawn();
      this.setText('Wave ' + this.wave.wave);
      // TODO: some sort of incidental music
    }
  }

  setText(text) {
    this.text.text = text;
    this.textCounter = 3000;
    this.text.alpha = 1;
  }

  resetKeys() {
    this.game.input.keyboard.reset(true);
    // Always allow F for fullscreen toggle
    this.game.input.keyboard.addKey(Phaser.Keyboard.F).onDown.add(function() {
      if (this.game.scale.isFullScreen) {
        this.game.scale.stopFullScreen();
      } else {
        this.game.scale.startFullScreen(false);
      }
    }, this);
  }

  render() {
    if (this.player) {
      this.game.debug.body(this.player);
    }
  }
}
