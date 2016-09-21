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
    audioDir = '../audio/';

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
    // TODO: Use node-musicnamer to move the files to /[artist]/[album]/filename.mp3.
    // https://github.com/bahamas10/node-musicnamer



    console.log("Looking up filename: ",filelist[i]);

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
