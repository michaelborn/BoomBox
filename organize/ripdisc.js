#!/usr/bin/env node

/**
 * This file uses python-discid to check the CD-rom
 * to see if the songs are catalogued in musicbrainz.org.
 *
 * @cite: https://github.com/mborn319/python-discid2
 * @cite: https://pypi.python.org/pypi/musicbrainzngs/0.6
 * @cite: https://github.com/bmc0/musicbrainz_discid
 * @cite: https://www.npmjs.com/package/python-shell
 * @cite: http://xiph.org/paranoia/
 */

var fs = require('fs')
    path = require('path')
    acoustid = require('acoustid'),
    db = require('../init-mongo.js'),
    pyShell = require('python-shell'),
    shell = require('child_process'),
    spawn = shell.spawn;


/**
 * Begin the cd analyzing using libdiscid
 * and musicbrainz_discid.py.
 *
 * @cite: https://github.com/mborn319/python-discid2
 * @cite: https://pypi.python.org/pypi/musicbrainzngs/0.6
 * @cite: https://github.com/bmc0/musicbrainz_discid
 * @cite: https://www.npmjs.com/package/python-shell
 */
pyShell.run('musicbrainz_discid/musicbrainz_discid.py', {}, function(err,results) {
  if (err) {
    if (err.exitCode === 1) {
      console.error("Cannot find audio metadata.",err);
    } else {
      console.error("Got error from musicbrainz_discid:",err);
    }
    return false;
  }  else {

  console.log("Got CD metadata: ",results);
    /**
     * begin the cd ripping process using cdparanoia
     * Note we can include an integer argument 
     * which signals that we only want a particular track number.
     * This is quite useful for debugging, as it speeds up wait times.
     *
     * @cite: http://xiph.org/paranoia/
     */
    cdripper = spawn("cdparanoia",["-B"]);
    
    // output to standard output -
    // this probably means a song has been successfully saved to disk
    cdripper.stdout.on("data",function(data) {
      console.log("cdparanoia stdout:",data);
    });

    // output to standard error
    cdripper.stderr.on("data",function(data) {
      //console.log("cdparanoia stderr:",data);
    });

    // cdparanoia is done!
    cdripper.on("close",function(code) {
      console.log("cdparanoia done, exit code ", code);

      // Run the bash "eject" program to pop out the CD tray
      shell.exec("eject",{},function() {
        console.log("DONE! CD ejected.");
      });
      
      // Move the audio files to the correct directory
      newDir = "../audio/wav/artist/album/";
      runCmd = "mkdir -p " + newDir + ";mv *.wav " + newDir;
      shell.exec(runCmd,{},function() {
        console.log("DONE! files moved to correct directory.");
      });
    });
  }

});
