#!/usr/bin/env bash

# ripdisc.js calls this program and passes it a single argument:
# the name of the directory in which we wish to place the mp3 files
moveToDir=$1

# make the new directory
# notice we get the dir path from args
echo "Making the ../$moveToDir directory"
mkdir -p ../$moveToDir

# convert the .wav files to .mp3
# note we use xargs to split this into 5 processes so it goes WAY faster
echo "Converting all .wav files to .mp3"
ls *.wav | xargs -n1 -t -P5 lame --silent
#for t in track*.wav
#do
#  echo "Converting $t to MP3 format..."
#  # note the "silent" option - turns out lame is pretty loud!
#  lame --silent $t
#done

# move the .mp3 files to the new dir
echo "moving .mp3 files to ../$moveToDir"
mv *.mp3 ../$moveToDir

# cleanup: delete the old .wav files
#rm *.wav

# here's the cool part: eject the CD tray!
echo "Ejecting CD tray"
eject

# return nicely
echo "DONE!"
exit 0
