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
