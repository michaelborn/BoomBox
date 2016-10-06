#!/usr/bin/env node

/**
 * This file currently uses node-acoustid to get the acoustid for each file.
 * I'll probably switch it to use node-groove, and then use groove for everything else while I'm at it.
 * Have node-groove fingerprint the files and save the retrieved metadata to the tags.
 * Then, my code will also save the important metadata in Mongo.
 * @cite: https://github.com/parshap/node-acoustid
 * @cite: https://github.com/andrewrk/node-groove
 */

var fs = require('fs')
    path = require('path')
    acoustid = require('acoustid'),
    audioDir = '../audio/',
    db = require('../init-mongo.js');

var acoustidOpts = {
  key: "y1QtljLfrL",
  meta: "recordings"
};

// get all files in the audio directory
fs.readdir(audioDir, function(err,filelist) {
  if (err) {
    console.warn("Error reading directory:",err);
    return false;
  }

  for (var i=0;i<filelist.length;i++) {
    if (fs.statSync(audioDir + filelist[i]).isDirectory()) {
      continue;
    }
    var fullFilename = audioDir + filelist[i];
    // TODO: Use node-musicnamer to move the files to /[artist]/[album]/filename.mp3.
    // https://github.com/bahamas10/node-musicnamer

    console.log("Looking up filename: ",fullFilename);

    getAcoustInfo(fullFilename,acoustidResults = function(err,result) {
        if (!err) {
          saveTrack(result,fullFilename);
        }
    });


    // Add artist to DB.artists collection
  };
});
var getAcoustInfo = function(filename,callback) {
  var retval;
  acoustid(filename,acoustidOpts,function(err,result) {
    if (err) {
      console.warn("Error getting acoustid metadata:",err);
    } else {
      // use first result, assume it's accurate
      var retval = result[0];
      console.log("got track:",JSON.stringify(retval,null,2));
    }
    callback(err,retval);
  });
};
var saveTrack = function(track,filename) {
  // Add track to db.tracks collection
  var newTrack = {
    id: track.id,
    name: track.recordings.title,
    filename: path.basename(filename),
    duration: track.recordings.duration,
    albumid: ''
  };
  db.collection("tracks").insert(newTrack);

};
var getMusicBrainz = function() {

};
