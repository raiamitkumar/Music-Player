var electron = require('electron');
var ipcRender = electron.ipcRenderer;
var remote = electron.remote;
var dialog = remote.require('electron').dialog;
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
    if(path.length > 1){
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

document.body.style.backgroundImage = "url('file:///E:/Kingfisher-Calendar-2012-Angela-Jonsson-December-WideScreen-Wallpaper-12.jpg')";

function playFile(path){
  if(audio){
    audio.pause();
    audio.currentTime = 0;
  }
  audio = new Audio('file:///'+path);
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
      seek.style.background = "linear-gradient(to right, red 0%, red " + a + "%, #fff 100%)";
      timeLeft--;
    }
  }, 1000)
}
