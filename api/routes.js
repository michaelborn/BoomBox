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



module.exports = function(app, db) {
  var api_version_str = "/api/v1",
      Player = require("player");

  app.get(api_version_str+'/stream/track/:id', function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      /**
       * play .wav files out to the speakers
       * @cite: https://github.com/turingou/player
       */
      db.tracks.findOne({},function(err,nowPlaying) {
        if (!nowPlaying || err) {
          res.json({"error":false,"playing":false});
          return;
        }

        // open the file and start playing
        var player = new Player("audio/wav/The-Martins/The-Martins/track03.cdda.wav");

        // set up a handler
        player.play(function(err,player) {
          console.log("End of playback!",arguments);
          res.json({"error":false,"playing":false});
        });
      });
    }
  });
  app.get(api_version_str+'/stream/pause', function(req, res) {
    // will need to extend the Play module to support a "pause" event
    res.json({success: true});
  });

  // http://docs.boombox.apiary.io/#reference/tracks/list-one-or-all-songs
  // Routes for getting, creating, updating, and deleting song tracks by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/track', function(req, res) {
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

    console.log("Searching by filterOpts:",filterOpts);
    // Return tracks searchable by name, sorted a-z by name, LIMIT 50
    data = db.collection("tracks").find(filterOpts).sort({name: -1}).limit(req.query.limit);

    data.toArray(function(err,results) {
      if (err) {
        res.send(err)
      } else {
        res.send(results);
      }
    })
  });
  app.post(api_version_str+'/track/:id', function(req, res) {
    console.log(req.params);
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //insert tracks!
      var newtrack = {
        name: req.params.name,
        filename: req.params.filename
      };
      tracks.insert(newtrack,function(err,response) {
        if (!err) { console.info("Inserted ",response.insertedCount," tracks!") };
      });
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
  app.get(api_version_str+'/artist', function(req, res) {
    if (typeof req.query.id === "undefined") {
      //then return all artists.
     res.send("ALL artists");
    } else {
      //return artists!
      res.send("artist info for artist #"+req.query.id);
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
  app.get(api_version_str+'/album', function(req, res) {
    if (typeof req.query.id === "undefined") {
      //then return all albums.
     res.send("ALL albums");
    } else {
      //return albums!
      res.send("album info for album #"+req.query.id);
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
