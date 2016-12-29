const SCREEN_WIDTH = 400
const SCREEN_HEIGHT = 240
const WORLD_WIDTH = SCREEN_WIDTH * 20
const TILE_SIZE = 16

// http://stackoverflow.com/a/9071606/2038264
function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  WORLD_WIDTH,
  TILE_SIZE,
  choose
}
