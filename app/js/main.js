//main.js - This file does all the app-ish stuff. Includes buttons, animations, and possibly offline functionality.
// Templates
templates = {};
templates.song = '<div class="list-item" id="{_id}"><div class="media"><img src="{imgsrc}" alt="{title}" /></div><h4 class="title">{title}</h4><div class="song-controls"><button class="song play"><span class="fa fa-play"></button></div></div>';

// Buttons!
var settingsBtn = document.getElementById("btnSettings"),
    searchBtn = document.getElementById("btnSearch"),
    lSongsBtn = document.getElementById("list-songs-btn"),
    lArtistsBtn = document.getElementById("list-artists-btn"),
    lAlbumsBtn = document.getElementById("list-albums-btn");


// the "Songs" tab in the app nav
lSongsBtn.addEventListener("click",function(e) {
  e.preventDefault();

  // get all songs
  api.songs.get({},loadList);

  // load data into page
  lSongsBtn.classList.add("active");
});

// the "Albums" tab in the app nav
lAlbumsBtn.addEventListener("click",function(e) {
  e.preventDefault();

  // get all songs
  api.albums.get({},loadList);

  // load data into page
  lAlbumsBtn.classList.add("active");
});

// the "Artists" tab in the app nav
lArtistsBtn.addEventListener("click",function(e) {
  e.preventDefault();

  // get all songs
  api.artists.get({},loadList);

  // load data into page
  lArtistsBtn.classList.add("active");
});

// Data
// here we set up the loading of song lists, album lists, artist lists, etc.
var dataBox = document.getElementById("app-data");


var openSettings = function() {
  document.getElementById("app-settings").classList.toggle("open");
};


// events
// here we set up all the button click events
settingsBtn.addEventListener("click",openSettings);

// Get songs
var loadList = function(json) {
  var allsongs = '';
  console.log("Ajax response:",json);

  // insert into page
  for (var i=0;i<json.length;i++) {
    // use our new template function in the library
    var song = lib.toDom(lib.template(templates.song,json[i]));
    //console.log("song:",song);
    dataBox.appendChild(song[0]);
    
    var curSong = new Song(document.getElementById(json[i]._id));
  }
};

//This object does all the stuff with the song divs.
var Song = function(song) {
  var self = this,
      playbutton = song.querySelector(".fa");

  this.play = function(e) {
    song.classList.add("active");
    playbutton.classList.remove("fa-play");
    playbutton.classList.add("fa-pause");
    api.stream.track.play(song.id, function() {
      console.log("Whoa... it's playing?!",arguments);
    });
  };
  
  this.pause = function(e) {//console.log("pause!",e,song);
    song.classList.remove("active");
    playbutton.classList.add("fa-play");
    playbutton.classList.remove("fa-pause");
    api.pause(song.id, function() {
      console.log("Whoa... it's paused!?",arguments);
    });
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
};

lSongsBtn.click();
