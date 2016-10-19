//main.js - This file does all the app-ish stuff. Includes buttons, animations, and possibly offline functionality.

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
  api.songs.get({},loadSongs);

  // load data into page
  lAlbumsBtn.classList.remove("active");
  lArtistsBtn.classList.remove("active");
  lSongsBtn.classList.add("active");
});

// the "Albums" tab in the app nav
lAlbumsBtn.addEventListener("click",function(e) {
  e.preventDefault();

  // get all songs
  api.albums.get({},loadAlbums);

  // load data into page
  lSongsBtn.classList.remove("active");
  lArtistsBtn.classList.remove("active");
  lAlbumsBtn.classList.add("active");
});

// the "Artists" tab in the app nav
lArtistsBtn.addEventListener("click",function(e) {
  e.preventDefault();

  // get all songs
  api.artists.get({},loadArtists);

  // load data into page
  lSongsBtn.classList.remove("active");
  lAlbumsBtn.classList.remove("active");
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
var loadSongs = function(json) {
  var songTemplate = '<div class="list-item" id="{_id}" data-type="song"><div class="media"><img src="{imgsrc}" alt="{title}" /></div><h4 class="title">{title}</h4><div class="song-controls"><button class="playBtn"><span class="fa fa-play"></button></div></div>';
  return loadItems(json,songTemplate);
};
var loadArtists = function(json) {
  var songTemplate = '<div class="list-item" id="{_id}" data-type="artist"><div class="media"><img src="{imgsrc}" alt="{name}" /></div><h4 class="title">{name}</h4><div class="song-controls"><button class="playBtn"><span class="fa fa-play"></button></div></div>';
  return loadItems(json,songTemplate);
};
var loadAlbums = function(json) {
  var songTemplate = '<div class="list-item" id="{_id}" data-type="album"><div class="media"><img src="{albumart}" alt="{title}" /></div><h4 class="title">{title}</h4><div class="song-controls"><button class="playBtn"><span class="fa fa-play"></button></div></div>';
  return loadItems(json,songTemplate);
};
var loadItems = function(json, mediaTemplate) {
  console.log("Ajax response:",json);
  dataBox.innerHTML = '';

  // insert into page
  for (var i=0;i<json.length;i++) {
    // use our new template function in the library
    var song = lib.toDom(lib.template(mediaTemplate,json[i]));
    //console.log("song:",song);
    dataBox.appendChild(song[0]);
    
    var curSong = new mediaItem(document.getElementById(json[i]._id));
  }
};

//This object does all the stuff with the song divs.
var mediaItem = function(item) {
  var self = this,
      playbutton = item.querySelector(".fa");

  this.clearBtns = function() {
    var curPlayingSongBtn = document.querySelector(".fa.fa-pause");
    if (curPlayingSongBtn) {
      curPlayingSongBtn.classList.remove("fa-pause");
      curPlayingSongBtn.classList.add("fa-play");
    }
  };
  this.play = function(e) {
    console.log("playing something!");
    self.clearBtns();
    item.classList.add("active");
    playbutton.classList.remove("fa-play");
    playbutton.classList.add("fa-pause");

    // play the particular type of media
    switch(item.dataset.type) {
      case "album":
        // play all the songs in the album
        api.stream.album.play(item.id, self.playResponse);
        break;
      case "artist":
        // play all the songs for the particular artist
        api.stream.artist.play(item.id, self.playResponse);
        break;
      case "track":
        // play this particular song
        api.stream.track.play(item.id, self.playResponse);
        break;
    }
  };
  this.playResponse = function(req) {
      if (req.response.error) {
        console.warn("Error, couldn't find item!",req.response);
        alert("Error! Could not find item");
      } else {
        console.log("Whoa... it's playing?!",req.response);
      }
  };
  
  this.pause = function(e) {//console.log("pause!",e,item);
    item.classList.remove("active");
    playbutton.classList.add("fa-play");
    playbutton.classList.remove("fa-pause");
    api.pause(item.id, function() {
      console.log("Whoa... it's paused!?",arguments);
    });
  };

  this.toggle = function(e) {//console.log("toggle!",e,item);
    if (item.classList.contains("active")) {//then song is being played right now.
      self.pause(e);
    } else {//else song is currently paused. play it!
      self.play(e);
    }
  };

  // setup the play/pause button event listener
  item.querySelector(".playBtn").addEventListener("click",self.toggle);

  return this;
};

lSongsBtn.click();
