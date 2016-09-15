#!/usr/bin/env node

var fs = require('fs')
    path = require('path')
    acoustid = require('acoustid'),
    audioDir = '../audio/';

// get all files in the audio directory
fs.readdir(audioDir, function(err,filelist) {
  if (err) {
    console.warn("Error reading directory:",err);
    return false;
  }
  // console.log("There are these files in the dir:",filelist);
  for (var i=0;i<filelist.length;i++) {
    if (fs.statSync(audioDir + filelist[i]).isDirectory()) {
      continue;
    }
    // TODO: Use node-musicnamer to move the files to /[artist]/[album]/filename.mp3.
    // https://github.com/bahamas10/node-musicnamer




    // Fingerprint the files using fpcalc,
    // then use node-acoustid to get the musicbrainz.org metadata
    // from the acoustid web service
    // https://github.com/parshap/node-acoustid
    // https://acoustid.org/webservice
    opts = {
      key: "y1QtljLfrL"
    };
    acoustid(audioDir + filelist[i], opts, function(err, result) {
      if (err) {
        console.warn("Error getting music brainz metadata:",err);
        return false;
      }
      console.log("got result:",result);
      
    });
  }
});
