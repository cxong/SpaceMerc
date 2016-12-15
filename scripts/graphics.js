const TILE_SIZE = 8;
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 480;

// http://stackoverflow.com/a/9071606/2038264
function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export {
  TILE_SIZE,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  choose
}
