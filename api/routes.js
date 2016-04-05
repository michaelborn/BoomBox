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
module.exports = function(app) {
  var api_version_str = "/api/v1";

  app.get(api_version_str+'/stream/track:id', function(req, res) {
    if (typeof req.query.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      // run the ogg123 binary and pass the audio track filename/filepath to it.
      var cmd = 'ogg123 ' + tracks.findOne({id:req.params.id}).filename;

      //run the command and get the results.
      //note this will probably have to be done via spawning child processes, else it'll hang up the server.
      exec(cmd, function(error, stdout, stderr) {
        console.info("played/playing song file!");
      });
    }
  });

  // Routes for getting, creating, updating, and deleting song tracks by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/track', function(req, res) {
    if (typeof req.query.id === "undefined") {
      //then return all tracks.
      res.send("ALL tracks");
      console.log("tracks data=",tracks.find({}));
    } else {
      //only return track info for the track:ID
      res.send("track info for track #"+req.query.id);
    }
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
