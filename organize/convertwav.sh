#!/usr/bin/env bash

moveToDir=$1

echo $moveToDir

# make the new directory
# notice we get the dir path from args
echo "Making the ../$moveToDir directory"
mkdir -p ../$moveToDir

# convert the .wav files to .mp3
for t in track*.wav
do
  echo "Converting $t to MP3 format..."
  # note the "silent" option - turns out lame is pretty loud!
  lame --silent $t
done

# move the .mp3 files to the new dir
echo "moving .mp3 files to ../$moveToDir"
mv *.mp3 ../$moveToDir

# cleanup: delete the old .wav files
rm *.wav

# here's the cool part: eject the CD tray!
echo "Ejecting CD tray"
eject

# return nicely
echo "DONE!"
exit 0
