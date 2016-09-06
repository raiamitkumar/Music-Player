var electron = require('electron');
var ipcRender = electron.ipcRenderer;
var remote = electron.remote;
var dialog = remote.require('electron').dialog;
var fs = require('fs');
var id3 = require('id3js');
var musicmetadata = require('musicmetadata');
var audioMetaData = require('audio-metadata');
var min_button = document.getElementById('minimize');
var max_button = document.getElementById('maximize');
var close_button = document.getElementById('close');
var file_option = document.getElementById('file-menu-option');
var file_menu = document.getElementById('file-menu');
var open_button = document.getElementById('open');
var open_file_btn = document.getElementById('open-file-btn');
var close_file_btn = document.getElementById('close-file-btn');
var add_file_btn = document.getElementById('add-file-btn');
var exit_button = document.getElementById('exit-btn');
var play_button = document.getElementById('play-button');
var seek = document.getElementById('seek');
var albumCover = document.getElementById('album-banner');
var songTitle = document.getElementById('song-title');
var songAlbum = document.getElementById('song-album');
var songArtist = document.getElementById('song-artist');
var currentPlaylistSection = document.getElementById('current-playlist');
var isMaximized = false, menuActive = false, count = 0, path = "", songDuration, audio, timeLeft = 0, timePlayed = 0, songIndex = 0, intervalTime = 1000;;
var songQueue = []
var tableRow, rowElement, textElement

// Function to check for the height of the window and recompute the height of the current playlist section
function resizeContainer(){
  var height = window.outerHeight;
  height = height - 360;
  currentPlaylistSection.style.height = height;
}
// Event Listener to check if user clicks on a menu option when the menu is open
document.addEventListener('click', function(e){
  if(e.target == file_option){
    if(menuActive){
      hideMenu()
    }
    else{
      file_menu.style.display = "block";
      menuActive = true;
    }
  }
  else if(e.target !=file_menu && menuActive && e.target != min_button && e.target != max_button && e.target != close_button){
    hideMenu()
  }
})
// Event Listener to listen for minimize window activity
min_button.addEventListener('click', function(){
  ipcRender.send('minimize')
  if(menuActive){
    hideMenu()
  }
})
// Event Listener to listen for maximize window activity
max_button.addEventListener('click', function(){
  if(isMaximized){
    ipcRender.send('unmaximize')
    isMaximized = false;
  }
  else{
    ipcRender.send('maximize')
    isMaximized = true;
  }
  if(menuActive){
    hideMenu()
  }
})
// Event Listener to listen for close current song activity
close_button.addEventListener('click', function(){
  ipcRender.send('close')
  if(menuActive){
    hideMenu()
  }
})
// Event Listener to listen for close window activity
exit_button.addEventListener('click', function(){
  ipcRender.send('close')
  if(menuActive){
    hideMenu()
  }
})
// Event Listener to listen for open file activity
open_file_btn.addEventListener('click', function(){
  hideMenu()
  songQueue = dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
  });
  songIndex = 0
  if(songQueue.length > 0){
    addToPlaylist(songQueue)
    playFile(songQueue[songIndex])
  }
})
// Event Listener to listen for add file activity
add_file_btn.addEventListener('click', function(){
  hideMenu()
  toBeAdded = dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })
  songIndex = songIndex.concat(toBeAdded)
  if(songIndex === songQueue.length - 1 && audio.ended){
    songIndex++
    playFile(songQueue[songIndex])
  }
})
// Event Listener to listen for close file activity
close_file_btn.addEventListener('click', function(){
  if(audio){
    audio.pause()
    audio.currentTime = 0
    audio.src = ""
  }
  play_button.src = "../assets/images/controls/player/play.png"
})
// Event Listener to listen for play/pause song activity
play_button.addEventListener('click', function(){
  if(audio){
    if(audio.paused){
      audio.play()
      play_button.src = "../assets/images/controls/player/pause.png";
    }
    else{
      audio.pause()
      play_button.src = "../assets/images/controls/player/play.png";
    }
  }
})
// Function to close the menu
function hideMenu(){
  file_menu.style.display = "none";
  menuActive = false;
}
// Function to start playing the selected songs
function playFile(path){
  if(audio){
    audio.pause();
    audio.currentTime = 0;
  }
  audio = new Audio('file:///'+path);

  // Getting metadata for the audio file
  id3({ file: path.toString(), type: id3.OPEN_LOCAL }, function(err, tags) {
    if(tags){
      songTitle.innerHTML = tags.title;
      songAlbum.innerHTML = tags.album;
      songArtist.innerHTML = tags.artist;
    }
  });

  // Getting Album Cover of the audio file
  musicmetadata(fs.createReadStream(path.toString()), function (err, metadata) {
    if(!err && metadata.picture[0].data){
      var base64Data = base64ArrayBuffer( metadata.picture[0].data );
      albumCover.src = 'data:image/png;base64, ' + base64Data;
      var img = "url('data:image/png;base64, "+base64Data + "')";
      document.getElementById('player-background').style.backgroundImage = img;
    }
  });
  songDuration = 0;
  audio.addEventListener('loadedmetadata', function() {
      songDuration = audio.duration;
      play_button.src = "../assets/images/controls/player/pause.png";
      audio.play();
      startSeek();
  });
  audio.muted = false;
}
// Function to start the seek
function startSeek(){
  seek.max = songDuration;
  timeLeft = songDuration;
  intervalTime = 1000;
  setInterval(function(){
    // Updating seek value
    seek.value = audio.currentTime;
    // Playing next file if the current song has ended
    if(audio.ended && songIndex < songQueue.length - 1){
      songIndex++;
      playFile(songQueue[songIndex])
    }
  }, intervalTime)
}
// Function to add the selected songs to the playlist and reflect them in the view
function addToPlaylist(songsList){
  for(var i=0; i<songsList.length; i++){
    // Getting metadata for the audio file
    id3({ file: songsList[i].toString(), type: id3.OPEN_LOCAL }, function(err, tags) {
      if(tags){
        tableRow = document.createElement("tr")
        rowElement = document.createElement("td")
        textElement = document.createTextNode(tags.title)
        rowElement.appendChild(textElement)
        tableRow.appendChild(rowElement)
        rowElement = document.createElement("td")
        textElement = document.createTextNode(tags.album)
        rowElement.appendChild(textElement)
        tableRow.appendChild(rowElement)
        rowElement = document.createElement("td")
        textElement = document.createTextNode(tags.artist)
        rowElement.appendChild(textElement)
        tableRow.appendChild(rowElement)
        document.getElementById('playlist-body').appendChild(tableRow)
      }
    });
  }
}
