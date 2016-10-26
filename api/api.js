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
    if (typeof params.limit !== "number") {
      params.limit = 50; // notice default is 50
    }
    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    data = db.albums.find(searchOpts).sort({ title: 1 }).limit(params.limit, callback);
  };
  this.albums.insert =  function(params, callback) {
    self.log("albums.insert():", arguments);
    if (typeof params._id !== "string") { throw "ID is required."; }
    if (typeof params.artistid !== "string") { throw "Artistid is required."; }
    if (typeof params.title!== "string") { throw "Title is required."; }
    if (typeof params.track_count !== "string") { throw "Track_count is required."; }

    var doc = {
      _id: params.id,
      artistid: params.artistid,
      title: params.title,
      track_count: params.track_count
    };

    db.albums.insert(doc, callback);
  };
  this.albums.update =  function(params, callback) {
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
    if (typeof params.limit !== "number") {
      params.limit = 50; // notice default is 50
    }
    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    db.artists.find(searchOpts).sort({ name: 1 }).limit(params.limit, callback);
  };
  this.artists.insert =  function(params, callback) {
    self.log("artists.insert():", arguments);
    if (typeof params._id !== "string") { throw "ID is required."; }
    if (typeof params.name !== "string") { throw "Name is required."; }

    var doc = {
      _id: params.id,
      name: params.name
    };

    db.artists.insert(doc, callback);
  };
  this.artists.update = function(params, callback) {
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
    if (typeof params.artistid !== "undefined") {
      // get all tracks by artist
      searchOpts.artistid = params.artistid;
    }
    if (typeof params.albumid !== "undefined") {
      // get all tracks from album
      searchOpts.albumid = params.albumid;
      // Then sort by track number
      var sortBy = { number: 1 };
    }
    if (typeof params.limit !== "number") {
      // notice default is 50
      params.limit = 50;
    }
    if (typeof sortBy === "undefined") {
      // default sort order is the track title
      var sortBy = { title: 1 };
    }

    self.log("Search parameters:", searchOpts);
    self.log("Sorting by:", sortBy);

    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    db.tracks.find(searchOpts).sort(sortBy).limit(params.limit, function(err, result) {
      callback(err, result);
    });
  };
  this.tracks.insert = function() {
    self.log("tracks.insert():", arguments);
    if (typeof params._id !== "string") { throw "ID is required."; }
    if (typeof params.name !== "string") { throw "Name is required."; }

    var doc = {
      _id: params.id,
      name: params.name
    };

    db.artists.insert(doc, callback);
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
