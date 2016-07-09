//main.js - This file does all the app-ish stuff. Includes buttons, animations, and possibly offline functionality.

// Buttons!
var settingsBtn = document.getElementById("btnSettings"),
    searchBtn = document.getElementById("btnSearch");

// Data
// here we set up the loading of song lists, album lists, artist lists, etc.
var dataBox = document.getElementById("app-data");


// for now, we'll use a dummy template string to generate a dummy list of songs.
var songTemplate = '<div class="list-item"><div class="media"><img src="http://placebacon.net/75/75" alt="Song image" /></div><h4 class="title">Jailhouse Rock</h4><div class="song-controls"><button class="song play"><span class="fa fa-play"></button></div></div>';
songTemplate += songTemplate + songTemplate + songTemplate;
// add dummy data to databox for now.
var songList = Array.prototype.slice.call(lib.toDom(songTemplate));
var appendSong = function(song) {
  dataBox.appendChild(song);
};
songList.forEach(appendSong);


var openSettings = function() {
  document.getElementById("app-settings").classList.toggle("open");
};


// events
// here we set up all the button click events
settingsBtn.addEventListener("click",openSettings);


//songs play/pause events
var songList = dataBox.querySelectorAll(".song");

for (var i=0;i<songList.length;i++) {
  var curSong = new Song(songList[i]);
  songList[i].addEventListener("click",curSong.toggle);
  //console.log(curSong);
}

console.log("This should be an API() object, with a songs.get() method.",api);

//This object does all the stuff with the song divs.
function Song(song) {
  var self = this,
      playbutton = song.querySelector(".fa");

  this.play = function(e) {//console.log("play!",e,song);
    song.classList.add("active");
    playbutton.classList.remove("fa-play");
    playbutton.classList.add("fa-pause");
  };
  
  this.pause = function(e) {//console.log("pause!",e,song);
    song.classList.remove("active");
    playbutton.classList.add("fa-play");
    playbutton.classList.remove("fa-pause");
  };

  this.toggle = function(e) {//console.log("toggle!",e,song);
    if (song.classList.contains("active")) {//then song is being played right now.
      self.pause(e);
    } else {//else song is currently paused. play it!
      self.play(e);
    }
  };

  return this;
}
