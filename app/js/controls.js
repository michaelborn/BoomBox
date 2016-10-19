// controls.js
// This file manages the "Now Playing" bar at the bottom of the app.
// Includes a play/pause button, a track title, album title, artist title
var controls = {
  prev: document.getElementById(".control__playprev"),
  next: document.getElementById(".control__playnext"),
  play: document.getElementById(".control__playbtn")
};
controls.prev.addEventListener("click", function(e) {
  if (app.state.playing) {
    // pause
  } else {
    // else play the current song
    // as defined in app.state.trackid
    // api.
  }
});
