/*************************************************
 * ####             API docs          ###
 *
 * ### Manage tracks ###
 * GET          /track
 * POST         /track:id
 * PUT          /track:id
 * DELETE       /track:id
 *
 * ### Manage albums ###
 * GET          /album
 * POST         /album:id
 * PUT          /album:id
 * DELETE       /album:id
 *
 * ### Manage artists ###
 * GET          /artist
 * POST         /artist:id
 * PUT          /artist:id
 * DELETE       /artist:id
 *
 * ### Play songs/artists/albums ###
 * Each endpoint (except for /stream/recent) accepts these parameters:
 *  { 
 *    id: integer //REQUIRED
 *    random: boolean //optional
 *  } 
 * GET          /stream/track:id
 * GET          /stream/album:id
 * GET          /stream/artist:id
 * GET          /stream/recent
*************************************************/

var API = {
  mongo : {
    sendResults : function(err,result) {
      console.log("got results from Mongo!",result,err);
      if (!result || err) {
        res.json({"error":false,"message":"Error searching for artists"});
        return;
      }
      res.json(result);
    }
  }
};


module.exports = function(app, db) {
  var api_version_str = "/api/v1",
      Player = require("player"),
      playlist = new Player(),
      nowPlaying;

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
        console.log("db.tracks.findOne() found track!");
        if (!result || err) {
          res.json({"error":false,"playing":false});
          return;
        }


        if (nowPlaying && nowPlaying._id === result._id && playlist.paused) {
          // if we have THIS song in the player, AND it is paused,
          // THEN call the "pause" function to resume the string.
          playlist.pause();
          console.info("Resuming the song: ", result.title);
          return;
        } else {
          // open the file and start playing
          // if it's a new song, stop the old song from playing
          // and start the new song
          if (nowPlaying) {
            playlist.stop();
          }

          console.log("Now playing: ", result.title);
          playlist.add("/var/www/Server/boombox/www/" + result.filename);
        }
        console.log(playlist.list);

        // play the stream
        // note that if the nowPlaying song hasn't changed
        // then we do NOT do a playlist.add(),
        // we just play() from the current position
        playlist.play(function(err,player) {
          console.log("End of playback!",arguments);
          res.json({"error":false,"playing":false});
        });
        nowPlaying = result;
      });
    }
  });
  app.get(api_version_str+'/stream/pause', function(req, res) {

    // pause the playlist / audio stream.
    if (!playlist.paused) {
      // provided there's actually something playing, of course
      console.info("Pausing the song");
      playlist.pause();
      res.json({success: true});
    } else {
      console.info("Dude, we weren't playing anything!");
      res.json({success: false});
    }
  });

  // http://docs.boombox.apiary.io/#reference/tracks/list-one-or-all-songs
  // Routes for getting, creating, updating, and deleting song tracks by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/track(/:id)?', function(req, res) {
    var filterOpts = {},
        data;

    if (typeof req.query.id !== "undefined") {
      filterOpts._id = new ObjectId(req.query.id);
    }
    if (typeof req.query.limit !== "undefined") {
      req.query.limit = parseInt(req.query.limit);
    }
    if (typeof req.query.limit === "undefined" || req.query.limit > 50) {
      req.query.limit = 50; // Max 50 records. TODO: Return page number with data set
    }

    if (typeof req.query.search !== "undefined") {
      // turn search into an array of keywords.
      filterOpts.name = { $in: req.query.search.split(' ') };
    }

    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    data = db.collection("tracks").find(filterOpts).sort({ number: 1 }).limit(req.query.limit);

    data.toArray(function(err,results) {
      if (err) {
        res.send(err);
      } else {
        res.send(results);
      }
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
    if (typeof req.params.id === "undefined") {
      //then return all artists.
      console.info("ALL artists");
      db.collection("artists").find().sort({ title: 1 }, API.mongo.sendResults);
    } else {
      //return artists!
      console.info("artist info for artist #"+req.query.id);
      db.artists.find({_id: req.params.id}, API.mongo.sendResults);
    }
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
      db.albums.find().sort({ title: 1 }, API.mongo.sendResults);
    } else {
      //return albums!
      console.info("album info for album #"+req.query.id);
      db.albums.findOne({_id: req.params.id}, API.mongo.sendResults);
    }
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
