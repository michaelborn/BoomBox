// api.js - this file does all the data interaction with the BoomBox API
var Api = function() {
  this.songs = {};
  this.albums = {};
  this.artists = {};

  this.songs.get = function(opts) {
    var data = opts; 
    var whenDone = function(dat) {
      console.log("Ajax response:",dat);
    };
    lib.ajax("track",data,whenDone,"GET");
  };

};
var api = new Api();

