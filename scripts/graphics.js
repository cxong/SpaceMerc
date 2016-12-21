const SCREEN_WIDTH = 400
const SCREEN_HEIGHT = 240

// http://stackoverflow.com/a/9071606/2038264
function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  choose
}
