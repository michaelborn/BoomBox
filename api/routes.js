module.exports = function(app) {
  var api_version_str = "/api/v1";

  // Routes for getting, creating, updating, and deleting song tracks by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/track', function(req, res) {
    if (typeof req.query.id === "undefined") {
      //then return all tracks.
    } else {
      //only return track info for the track:ID
    }
    //return tracks!
  });
  app.post(api_version_str+'/track/:id', function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //insert tracks!
    }
  });
  app.put(api_version_str+'/track/:id', function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //update track with trackID=req.
    }
  });
  app.delete(api_version_str+'/track/:id', function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //delete tracks!
    }
  });

  // Routes for getting, creating, updating, and deleting song artists by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/artist', function(req, res) {
    if (typeof req.query.id === "undefined") {
      //then return all tracks.
    } else {
      //return artists!
    }
  });
  app.post(api_version_str+'/artist/:id', function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //create artists!
    }
  });
  app.put(api_version_str+'/artist/:id', function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //create artists!
    }
  });
  app.delete(api_version_str+'/artist/:id', function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //delete artists!
    }
  });

  // Routes for getting, creating, updating, and deleting song albums by ID.
  // ID is required for all except GET.
  app.get(api_version_str+'/album', function(req, res) {
    if (typeof req.query.id === "undefined") {
      //then return all tracks.
    } else {
      //return albums!
    }
  });
  app.post(api_version_str+'/album/:id', function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //create albums!
    }
  });
  app.put(api_version_str+'/album/:id', function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //update albums!
    }
  });
  app.delete(api_version_str+'/album/:id', function(req, res) {
    if (typeof req.params.id === "undefined") {
      res.status(400).json({error: "You must specify an ID."});
    } else {
      //delete albums!
    }
  });
  return app;
};
