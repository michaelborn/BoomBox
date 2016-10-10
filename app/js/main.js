//main.js - This file does all the app-ish stuff. Includes buttons, animations, and possibly offline functionality.
// Templates
templates = {};
templates.song = '<div class="list-item" id="{_id}"><div class="media"><img src="{imgsrc}" alt="{title}" /></div><h4 class="title">{title}</h4><div class="song-controls"><button class="song play"><span class="fa fa-play"></button></div></div>';

// Buttons!
var settingsBtn = document.getElementById("btnSettings"),
    searchBtn = document.getElementById("btnSearch");

// Data
// here we set up the loading of song lists, album lists, artist lists, etc.
var dataBox = document.getElementById("app-data");


/*
// for now, we'll generate a dummy list of songs.

songTemplate += songTemplate + songTemplate + songTemplate;
// add dummy data to databox for now.
var songList = Array.prototype.slice.call(lib.toDom(songTemplate));
var appendSong = function(song) {
  dataBox.appendChild(song);
};
songList.forEach(appendSong);
*/

var openSettings = function() {
  document.getElementById("app-settings").classList.toggle("open");
};


// events
// here we set up all the button click events
settingsBtn.addEventListener("click",openSettings);

// Get songs
api.songs.get({},function(json) {
  var allsongs = '';
  //console.log("Ajax response:",json);

  // insert into page
  for (var i=0;i<json.length;i++) {
    // use our new template function in the library
    var song = lib.toDom(lib.template(templates.song,json[i]));
    //console.log("song:",song);
    dataBox.appendChild(song[0]);
    
    var curSong = new Song(document.getElementById(json[i]._id));
    
  }
});

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

  // setup the play/pause button event listener
  song.querySelector(".song.play").addEventListener("click",self.toggle);

  return this;
}
