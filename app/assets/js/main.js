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
var exit_button = document.getElementById('exit-btn');
var play_button = document.getElementById('play-button');
var seek = document.getElementById('seek');
var albumCover = document.getElementById('album-banner');
var songTitle = document.getElementById('song-title');
var songAlbum = document.getElementById('song-album');
var songArtist = document.getElementById('song-artist');
var isMaximized = false;
var menuActive = false, count = 0;
var path = "";
var songDuration, audio, timeLeft = 0, timePlayed = 0;

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
min_button.addEventListener('click', function(){
  ipcRender.send('minimize')
  if(menuActive){
    hideMenu()
  }
})
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
close_button.addEventListener('click', function(){
  ipcRender.send('close')
  if(menuActive){
    hideMenu()
  }
})
exit_button.addEventListener('click', function(){
  ipcRender.send('close')
  if(menuActive){
    hideMenu()
  }
})
open_file_btn.addEventListener('click', function(){
  hideMenu()
  // path = dialog.showOpenDialog({
  //     properties: ['openFile', 'multiSelections']
  // });
  path = dialog.showOpenDialog({
      properties: ['openFile']
  });
  if(path.length > 0){
    if(path.length === 1){
      playFile(path);
    }
    else{
      playMultiFiles(path);
    }
  }
})
close_file_btn.addEventListener('click', function(){
  audio.pause();
  audio.currentTime = 0;
  audio.src = "";
  play_button.src = "../assets/images/controls/player/play.png";
})
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

function hideMenu(){
  file_menu.style.display = "none";
  menuActive = false;
}

function playFile(path){
  if(audio){
    audio.pause();
    audio.currentTime = 0;
  }
  audio = new Audio('file:///'+path);

  // Getting metadata for the audio file
  id3({ file: path.toString(), type: id3.OPEN_LOCAL }, function(err, tags) {
    if(tags){
      console.log(tags);
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

function startSeek(){
  seek.max = songDuration;
  timeLeft = songDuration;
  setInterval(function(){
    if(timeLeft >= 0){
      timePlayed = songDuration - timeLeft;
      seek.value = timePlayed;
      var a = timePlayed/songDuration;
      timeLeft--;
    }
  }, 1000)
}
