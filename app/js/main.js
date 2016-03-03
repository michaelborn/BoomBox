//main.js - This file does all the app-ish stuff. Includes buttons, animations, and possibly offline functionality.

// init custom libraries
var _lib = lib();

// events
// here we set up all the button click events
var settingsBtn = document.getElementById("action.settings"),
    searchBtn = document.getElementById("action.search");


// Data
// here we set up the loading of song lists, album lists, artist lists, etc.
var dataBox = document.getElementById("app-data");


// for now, we'll use a dummy template string to generate a dummy list of songs.
var songTemplate = '<div class="list-item"><div class="media"><img src="http://placebacon.net/75/75" alt="Song image" /></div><h4>Jailhouse Rock</h4><div class="song-controls"><button class="song play"><span class="fa fa-play"></button></div></div>';
songTemplate += songTemplate + songTemplate + songTemplate;
// add dummy data to databox for now.
var songList = Array.prototype.slice.call(_lib.toDom(songTemplate));
console.log(songList);
var appendSong = function(song) {
  dataBox.appendChild(song);
};
songList.forEach(appendSong);

