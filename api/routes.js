/*************************************************
 * ####             API docs          ###
 *
 * ### Manage tracks ###
 * GET          /track
 * POST         /track/:id
 * PUT          /track/:id
 * DELETE       /track/:id
 *
 * ### Manage albums ###
 * GET          /album
 * POST         /album/:id
 * PUT          /album/:id
 * DELETE       /album/:id
 *
 * ### Manage artists ###
 * GET          /artist
 * POST         /artist/:id
 * PUT          /artist/:id
 * DELETE       /artist/:id
 *
 * ### Play songs/artists/albums ###
 * Each endpoint (except for /stream/recent) accepts these parameters:
 *  { 
 *    id: integer //REQUIRED
 *    random: boolean //optional
 *  } 
 * GET          /stream/track/:id
 * GET          /stream/album/:id
 * GET          /stream/artist/:id
 * GET          /stream/recent
*************************************************/
var Sock = require('socket.io'),
    api_version_str = "/api/v1",
    Player = require("player"),
    playlist = new Player(),
    playState;

var API = {
  mongo : {
    sendResults : function(err,result,res) {
      //console.log("got results from Mongo!",result,err);
      if (!result || err) {
        res.json({"error":false,"message":"Error searching for artists"});
        return;
      }
      res.json(result);
    }
  },
  params: function(url) {
    var struct = {
      find: {}
    };
    if (typeof url.id !== "undefined") {
      struct.find._id = url.id;
    }
    if (typeof url.limit !== "undefined") {
      struct.limit = parseInt(url.limit);
    }
    if (typeof url.search !== "undefined") {
      // turn search into an array of keywords.
      struct.find.name = { $in: url.search.split(' ') };
    }
    if (typeof struct.limit === "undefined" || struct.limit > 50) {
      // Max 50 records. TODO: Return page number with data set
      struct.limit = 50; 
    }
    // return parameters ready to query Mongo
    return struct;
  }
};


module.exports = function(app, db) {

  app.get(api_version_str+'/stream/track/:id', function(req, res) {
    console.log("Dude, who called my API??");
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      /**
       * play .mp3 files out to the speakers
       * @cite: https://github.com/turingou/player
       */
      db.tracks.findOne({_id: req.params.id},function(err,result) {
        if (!result || err) {
          res.json({"error":true,"playing":false,"msg":"Track not found."});
          return;
        }


        if (playState && playState.trackid === result._id && playlist.paused) {
          // if we have THIS song in the player, AND it is paused,
          // THEN call the "pause" function to resume the string.
          playlist.pause();
          console.info("Resuming the song: ", result.title);
          return;
        } else {
          // open the file and start playing
          // if it's a new song, stop the old song from playing
          // and start the new song
          if (playState) {
            playlist.stop();
          }

          console.log("Now playing: ", result.title);
          playlist.add("/var/www/Server/boombox/www/" + result.filename);
        }
        console.log(playlist.list);

        // play the stream
        // note that if the playState song hasn't changed
        // then we do NOT do a playlist.add(),
        // we just play() from the current position
        playlist.play(function(err,player) {
          console.log("End of playback!",arguments);
          res.json({"error":false,"playing":false});
        });

        // maintain our state
        playState = {
          "playing": true,
          "playtype": "track",
          "track": result,
          "next": false,
          "prev": false
        };

        // send it to the frontend
        //Sock.emit(playState);
        res.json(playState);
      });
    }
  });
  app.get(api_version_str+'/stream/album/:id', function(req, res) {
    console.log("okay, we're going to add an entire album to the playlist!");
      db.albums.findOne({_id: req.params.id},function(err,result) {
        if (!result || err) {
          res.json({"error":true,"playing":false,"msg":"Album not found."});
          return;
        }

        db.tracks.find({ albumid: result._id }).sort({ number: 1}, function(err,tracks) {
          if (err || !tracks) {
            console.warn("No tracks found for album:", req.params.id);
            return;
          }

          // add each song to the playlist
          tracks.forEach(function(thisTrack) {
            console.log("Adding this item to playlist:",thisTrack.title);
            playlist.add(thisTrack.filename);
          });

          // start playing the new playlist
          playlist.play();

          // maintain our state
          playState = {
            "playing": true,
            "playtype": "album",
            "track": tracks[0],
            "next": tracks.length > 1 ? tracks[1]._id : false,
            "prev": false
          };

          // send it to the frontend
          //Sock.emit(playState);
          
          // respond nicely
          res.json(playState);
        });
      });
  });
  app.get(api_version_str+'/stream/artist/:id', function(req, res) {
    console.log("okay, we're going to add an entire artist to the playlist!");
      db.artists.findOne({_id: req.params.id},function(err,result) {
        if (!result || err) {
          res.json({"error":true,"playing":false,"msg":"Artist not found."});
          return;
        }

        // get all songs by this artist
        db.tracks.find({ artistid: result._id }).sort({ number: 1 }, function(err,tracks) {
          if (err || !tracks) {
            console.warn("No tracks found for artist:", req.params.id);
            return;
          }

          // add each song to the playlist
          tracks.forEach(function(thisTrack) {
            console.log("Adding this item to playlist:",thisTrack.title);
            playlist.add(thisTrack.filename);
          });

          // start playing the new playlist.
          playlist.play();

          // maintain our state
          playState = {
            "playing": true,
            "playtype": "artist",
            "track": tracks[0],
            "next": tracks.length > 1 ? tracks[1]._id : false,
            "prev": false
          };


          // send it to the frontend
          //Sock.emit(playState);

          // respond nicely, keep frontend informed
          res.json(playState);
        });
      });
  });
  app.get(api_version_str+'/stream/pause', function(req, res) {

    // pause the playlist / audio stream.
    if (!playlist.paused) {
      // provided there's actually something playing, of course
      console.info("Pausing the song");
      playlist.pause();

      // maintain our state
      playState.playing = false;

      res.json(playState);
    } else {
      console.info("Dude, we weren't playing anything!");
      res.json({error: true});
    }
  });

  // http://docs.boombox.apiary.io/#reference/tracks/list-one-or-all-songs
  // Routes for getting, creating, updating, and deleting song tracks by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/track(/:id)?', function(req, res) {
    var filterOpts = {},
        data;

    filterOpts = API.params(req.query);

    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    data = db.collection("tracks").find(filterOpts.find).sort({ number: 1 }).limit(filterOpts.limit);

    data.toArray(function(err,results) {
      API.mongo.sendResults(err,results,res);
    });
  });
  app.post(api_version_str+'/track/:id', function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //insert tracks!
    }
  });
  app.put(api_version_str+'/track/:id', function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //update track with trackID=req.
      res.send("inserting track #"+req.params.id);
    }
  });
  app.delete(api_version_str+'/track/:id', function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //delete tracks!
      res.send("deleting track #"+req.params.id);
    }
  });

  // Routes for getting, creating, updating, and deleting song artists by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/artist(/:id)?', function(req, res) {
    console.log("req.params:",req.params);
    console.log("req.query:",req.query);
    filterOpts = API.params(req.query);
    if (typeof req.params.id === "undefined") {
      //then return all artists.
      console.info("ALL artists");
      data = db.collection("artists").find(filterOpts.find).sort({ title: 1 }).limit(filterOpts.limit);
    } else {
      //return artists!
      console.info("artist info for artist #"+req.query.id);
      data = db.artists.find({_id: req.params.id});
    }
    data.toArray(function(err,results) {
      API.mongo.sendResults(err,results,res);
    });
  });
  app.post(api_version_str+'/artist/:id', function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //create artists!
      res.send("creating artist #"+req.params.id);
    }
  });
  app.put(api_version_str+'/artist/:id', function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //create artists!
      res.send("updating artist #"+req.params.id);
    }
  });
  app.delete(api_version_str+'/artist/:id', function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //delete artists!
      res.send("deleting artist #"+req.params.id);
    }
  });

  // Routes for getting, creating, updating, and deleting song albums by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/album(/:id)?', function(req, res) {
    if (typeof req.params.id === "undefined") {
      //then return all albums.
      console.info("ALL albums");
      filterOpts = API.params(req);

      data = db.albums.find(filterOpts.find).sort({ title: 1 }).limit(filterOpts.limit);
    } else {
      //return albums!
      console.info("album info for album #"+req.query.id);
      data = db.albums.findOne({_id: req.params.id});
    }
    data.toArray(function(err,results) {
      API.mongo.sendResults(err,results,res);
    });
  });
  app.post(api_version_str+'/album/:id', function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //create albums!
      res.send("inserting album #"+req.params.id);
    }
  });
  app.put(api_version_str+'/album/:id', function(req, res) {
    console.log(req.params);

    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //update albums!
      res.send("updating album #"+req.params.id);
    }
  });
  app.delete(api_version_str+'/album/:id', function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //delete albums!
      res.send("deleting album #"+req.params.id);
    }
  });
  return app;
};
