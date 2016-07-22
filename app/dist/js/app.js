// api.js - this file does all the data interaction with the BoomBox API
var Api = function() {
  this.songs = {};
  this.albums = {};
  this.artists = {};

  this.songs.get = function(opts,callback) {
    var data = opts;
    lib.ajax("/api/v1/track",data,callback,"GET");
  };
  this.songs.insert = function(opts) {
    // we may not need to insert tracks through the frontend.
  };

};
var api = new Api();

// lib.js - this is a short library of useful functions, primarily Ajax.

var Lib = function() {

  var template = function(str, data) {
    var retstr = str;

    // loop over all data properties
    for (var prop in data) {
      // create a regex searcher for {prop}
      var regex = new RegExp('\{'+prop+'\}','ig');
      //console.log("lib.js/template(): regex",regex);
      
      // update string
      retstr = retstr.replace(regex,data[prop]);
    }
    return retstr;
  };

  var toDom = function(str) {
    var tmp = document.createElement("div");
    tmp.innerHTML = str;
    return tmp.childNodes;
  };

  var serialize = function(obj) {
    /**
     * serialize()
     * \brief take an object, output a string fit for the querystring.
     * \param {object} obj - the data object we wish to serialize.
     * \cite: http://stackoverflow.com/a/1714899/1525594
    */
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  };

  var ajax = function(url,data,callback,method) {
    var reqBody = '',
        reqBoundary,
        reqMethod = method ? method : "GET";//method is GET by default
        data = data ? data : {}; // data object is empty object by default

    // parameter validation
    if (!url) { console.warn('lib.js/ajax(): Url is required.'); }
    if (!callback) { console.warn('lib.js/ajax(): Callback is required.'); }

    var myCallback = function(e) {
      //console.log("lib.js/ajax(): Ajax request completed!",arguments);
      callback(e.target.response,e.target);
    };

    var addFormData = function(dat) {
      var bodyStr = '',
          reqBoundary = parseInt(Math.random()*1000),
          boundaryStr = "---"+reqBoundary;
      
      for (var field in dat) {
        bodyStr += '\r\n' + 'Content-Disposition: form-data; name="'+field;
        bodyStr += dat[field];
        bodyStr += '\r\n' + boundaryStr;
      }
      bodyStr += '---';//end of form data!
      console.log('lib.js/ajax(): form data:',bodyStr);
      return bodyStr;
    };

    var myRequest = new XMLHttpRequest();
    myRequest.responseType = "json";
    myRequest.addEventListener("load",myCallback);
    myRequest.open(reqMethod,url);

    if (reqMethod === "POST") {
      myRequest.setRequestHeader("Content-Type", "multipart\/form-data; boundary="+reqBoundary);
      reqBody = addFormData();
    }
    myRequest.send(reqBody);
  };

  return {
    serialize: serialize,
    ajax: ajax,
    toDom: toDom,
    template: template
  };
};
lib = Lib();

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
  console.log(lib.toDom(allsongs));
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

//# sourceMappingURL=app.js.map