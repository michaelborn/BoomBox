# BoomBox
Use a raspberry pi or any computer as a media server for audio files.

## Dependencies
* Node.js
* npm
* Grunt.js

## API docs
This will probably, hopefully, soon be converted to (API Blueprint)[https://apiblueprint.org/].

### Manage tracks
* `GET          /track`
* `POST         /track:id`
* `PUT          /track:id`
* `DELETE       /track:id`

### Manage albums
* `GET          /album`
* `POST         /album:id`
* `PUT          /album:id`
* `DELETE       /album:id`

### Manage artists
* `GET          /artist`
* `POST         /artist:id`
* `PUT          /artist:id`
* `DELETE       /artist:id`

### Play songs/artists/albums
Each endpoint (except for /stream/recent) accepts these parameters:

````javascript
{ 
  id: integer //REQUIRED
  random: boolean //optional
}
````

* `GET          /stream/track:id`
* `GET          /stream/album:id`
* `GET          /stream/artist:id`
* `GET          /stream/recent`
