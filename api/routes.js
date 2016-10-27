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

module.exports = function(app, db, socket) {
  var api = require("./api")(db),
      playlist = require("./playlist")(socket),
      playState;

  console.log("API");
  console.log("...... version: ", api.version);

  app.get(api.version+"/stream/track/:id", function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      /**
       * play .mp3 files out to the speakers
       * @cite: https://github.com/turingou/player
       */
      var opts = {
        id: req.params.id,
        limit: 1,
      };
      api.tracks.get(opts, function(err,result) {
        if (!result || err) {
          res.json({error:true,playing:false,"msg":"Track not found."});
          return;
        }
        // open the file and start playing
        // if it's a new song, stop the old song from playing
        // and start the new song

        console.log("Now playing: ", result.title);
        playlist.play(result);

        // send it to the frontend
        res.json({error: false });
      });
    }
  });
  app.get(api.version+"/stream/album/:id", function(req, res) {
    console.log("okay, we're going to add an entire album to the playlist!");
    api.albums.get(req.params, function(err, result) {
      if (!result) {
        res.status(404).json({error:true,playing:false,msg:"Album not found."});
        return;
      }
      if (err) {
        res.json({error:true,playing:false,msg:"Unexpected error searching for album"});
        return;
      }

      api.tracks.getByAlbumId(result[0]._id, function(err, tracks) {
        if (err || !tracks) {
          console.warn("No tracks found for album:", req.params.id);
          return;
        }

        // let playlist.js take care of it.
        playlist.play(tracks);

        // respond nicely
        res.json({ error: false });
      });
    });
  });
  app.get(api.version+"/stream/artist/:id", function(req, res) {
    console.log("okay, we're going to add an entire artist to the playlist!");
    api.artists.get(req.params, function(err, result) {
      if (!result) {
        res.status(404).json({error:true,playing:false,msg:"Artist not found."});
        return;
      }
      if (err) {
        res.json({error:true,playing:false,msg:"Unexpected error searching for artist"});
        return;
      }

      // get all songs by this artist
      api.tracks.getByArtistId(result[0]._id, function(err, tracks) {
        if (err || !tracks) {
          console.warn("No tracks found for artist:", req.params.id);
          res.status(404).json({error:true,playing:false,msg:"No tracks found for artist"});
          return;
        }

        // start playing the new playlist.
        playlist.play(tracks);

        // respond nicely, keep frontend informed
        res.json({ error: false });
      });
    });
  });
  app.get(api.version+"/stream/pause", function(req, res) {

    // pause the playlist / audio stream.
    playlist.pause();
    res.json({ error: false });
  });
  app.get(api.version+'/stream/next', function(req, res) {
    // play the next song in the playlist
    playlist.next();

    // respond nicely, keep frontend informed
    res.json({ error: false });
  });
  app.get(api.version+'/stream/prev', function(req, res) {
    // play the "previous" song in the playlist.
    playlist.prev();

    // somehow we have to maintain state on this
    // I'm not sure how the playlist array will work
    // after we've "advanced" to the next item.
    // here goes.
    // UPDATE: Too hard!! Leave this for further updates

    // respond nicely, keep frontend informed
    res.json({ error: false });
  });

  // http://docs.boombox.apiary.io/#reference/tracks/list-one-or-all-songs
  // Routes for getting, creating, updating, and deleting song tracks by ID.
  // ID is required for all except GET.
  app.get(api.version+"/track(/:id)?", function(req, res) {
    var filterOpts = {},
        data;

    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    var handleIt = function(err,results) {
      if (!results) {
        res.status(404).json({ error: "Track(s) not found" });
      } else {
        res.json(results);
      }
    };
  
    // actually get the data
    api.tracks.get(req.query, handleIt);
  });
  app.post(api.version+"/track/:id", function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //insert tracks!
      api.tracks.insert(req.params, function() {
        res.status(201).json({error: "false"});
      });
    }
  });
  app.put(api.version+"/track/:id", function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      api.tracks.update(req.param.id, function() {
        res.json({success: "true"});
      });
    }
  });
  app.delete(api.version+"/track/:id", function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //delete tracks!
      api.tracks.del(req.params.id, function() {
        res.json({success: "true"});
      });
    }
  });

  // Routes for getting, creating, updating, and deleting song artists by ID.
  // ID is required for all except GET.
  app.get(api.version+"/artist(/:id)?", function(req, res) {
    if (typeof req.params.id === "undefined") {
      //then return all artists.
      api.artists.get(req.params, function(err, results) {
        res.json(results);
      });
    } else {
      //return max 1 artist by id
      api.artists.get({ id: req.params.id }, function(err, results) {
        res.json(results);
      });
    }
  });
  app.post(api.version+"/artist/:id", function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //create artists!
      api.artists.insert(req.params, function() {
        res.json({success: "true"});
      });
    }
  });
  app.put(api.version+"/artist/:id", function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //update artists!
      api.artists.update(req.params.id, function() {
        res.json({success: "true"});
      });
    }
  });
  app.delete(api.version+"/artist/:id", function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //delete artists!
      api.artists.del(req.params.id, function() {
        res.json({success: "true"});
      });
    }
  });

  // Routes for getting, creating, updating, and deleting song albums by ID.
  // ID is required for all except GET.
  app.get(api.version+"/album(/:id)?", function(req, res) {
    if (typeof req.params.id === "undefined") {
      //then return all albums.

      // get the albums by search phrase, etc.
      api.albums.get(filterOpts, function(err, results) {
        if (!results) {
          res.status(404).json({ error: "Album(s) not found" });
        } else {
          res.json(results);
        }
      });
    } else {
      //get albums by id
      api.albums.get(filterOpts, function(err, results) {
        if (!results) {
          res.status(404).json({ error: "Album(s) not found" });
        } else {
          res.json(results);
        }
      });
    }
  });
  app.post(api.version+"/album/:id", function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //create albums!
      api.albums.insert(req.params, function() {
        res.json({success: "true"});
      });
    }
  });
  app.put(api.version+"/album/:id", function(req, res) {
    console.log(req.params);

    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //update albums!
      api.albums.update(req.params, function() {
        res.json({success: "true"});
      });
    }
  });
  app.delete(api.version+"/album/:id", function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //delete albums!
      api.albums.del(req.params.id, function() {
        res.json({success: "true"});
      });
    }
  });
  return api;
};
