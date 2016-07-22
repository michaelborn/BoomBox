//main.js - This file does all the app-ish stuff. Includes buttons, animations, and possibly offline functionality.
// Templates
templates = {};
templates.song = '<div class="list-item" id="{_id}"><div class="media"><img src="{imgsrc}" alt="{name}" /></div><h4 class="title">{name}</h4><div class="song-controls"><button class="song play"><span class="fa fa-play"></button></div></div>';

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
    allsongs += lib.template(templates.song,json[i]);

    /*
    var curSong = new Song(dataBox.getElementById(json[i]._id));
    songList[i].addEventListener("click",curSong.toggle);
    console.log(curSong);
    */
  }
  //console.log(allsongs);
  //console.log(lib.toDom(allsongs));
  //dataBox.innerHTML += allsongs;
  document.getElementById("app-data").appendChild(lib.toDom(allsongs)[0].parentNode);
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

  return this;
}
