#!/usr/bin/env node
function Api(db) {
  var self = this;
  this.version =  "/api/v1",

  // miscellaneous functions
  this.log = function(arg1, arg2) {
    if (arg1 && arg2) {
      console.log(arg1, arg2);
    } else if (arg1) {
      console.log(arg1);
    }
  };

  // all albums stuff
  this.albums = {};
  this.albums.get =  function(params, callback) {
    self.log("albums.get():", arguments);
    var searchOpts = {};
    if (typeof id !== "undefined") {
      searchOpts._id = params.id
    }
    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    data = db.albums.find(searchOpts).sort({ title: 1 }, callback);
  };
  this.albums.insert =  function() {
    self.log("albums.insert():", arguments);
  };
  this.albums.update =  function() {
    self.log("albums.update():", arguments);
  };
  this.albums.del =  function(id) {
    self.log("albums.del():", arguments);
    if (!id) { throw "albums.del(): id is required"; }

    // in order to maintain referential integrity, delete the tracks first.
    self.tracks.delByAlbum(id);

    // now, delete the artist by id.
    db.albums.deleteOne({_id: id});
  };



  // all artist stuff
  this.artists = {};
  this.artists.get =  function(params, callback) {
    self.log("artists.get():", arguments);
    var searchOpts = {};
    if (typeof id !== "undefined") {
      searchOpts._id = params.id
    }
    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    db.artists.find(searchOpts).sort({ name: 1 }, callback);
  };
  this.artists.insert =  function() {
    self.log("artists.insert():", arguments);
  };
  this.artists.update = function() {
    self.log("artists.update():", arguments);
  };
  this.artists.del = function(id) {
    self.log("artists.del():", arguments);
    if (!id) { throw "artists.del(): id is required"; }

    // in order to maintain referential integrity, delete the tracks first.
    self.tracks.delByArtist(id);

    // now, delete the artist by id.
    db.artists.deleteOne({_id: id});
  };


  // all track stuff
  this.tracks = {};
  this.tracks.getByArtistId = function(artistid, callback) {
    self.log("tracks.getByArtistId():", arguments);
    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    db.tracks.find({ artistid: artistid }).sort({ number: 1 }, callback);
  };
  this.tracks.getByAlbumId = function(albumid, callback) {
    self.log("tracks.getByAlbumId():", arguments);
    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    db.tracks.find({ albumid: albumid }).sort({ number: 1 }, callback);
  };
  this.tracks.get = function(params, callback) {
    self.log("tracks.get():", arguments);
    var searchOpts = {};
    if (typeof params.id !== "undefined") {
      searchOpts._id = params.id
    }
    if (typeof params.artistid === "string") {
      searchOpts.artistid = params.artistid;
    }
    if (typeof params.albumid === "string") {
      searchOpts.albumid = params.albumid;
    }
    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    db.tracks.find(searchOpts).sort({ number: 1 }, function(err, result) {
      callback(err, result);
    });
  };
  this.tracks.insert = function() {
    self.log("tracks.insert():", arguments);
  };
  this.tracks.update = function() {
    self.log("tracks.update():", arguments);
  };
  this.tracks.del = function(id) {
    self.log("tracks.del():", arguments);
    if (!id) { throw "tracks.del(): id is required"; }
    db.tracks.deleteOne({ _id: id });
  };
  this.tracks.delByArtist = function(artistid) {
    self.log("tracks.delByArtist():", arguments);
    if (!artistid) { throw "delByArtist(): artistid is required"; }
    db.tracks.remove({artistid: artistid});
  };
  this.tracks.delByAlbum = function(albumid) {
    if (!albumid) { throw "delByAlbum(): albumid is required"; }
    db.tracks.remove({ albumid: albumid });
  };

  // call these endpoints for audio streaming
  this.streams = {};
  this.streams.track = function() {
    self.log("streams.track():", arguments);
  }
  this.streams.album = function() {
    self.log("streams.album():", arguments);

  };
  this.streams.artist = function() {
    self.log("streams.artist():", arguments);
  };

  return this;
};
module.exports = function(db) {
  return new Api(db);
};
