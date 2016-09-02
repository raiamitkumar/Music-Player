var electron = require('electron');
var ipcRender = electron.ipcRenderer;
var dialog = electron.remote;
console.log(dialog);
var min_button = document.getElementById('minimize');
var max_button = document.getElementById('maximize');
var close_button = document.getElementById('close');
var file_option = document.getElementById('file-menu-option');
var file_menu = document.getElementById('file-menu');
var open_button = document.getElementById('open');
var open_file_btn = document.getElementById('open-file-btn');
var open_file_input = document.getElementById('open-file-input');
var isMaximized = false;
var menuActive = false, count = 0;
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
open_file_btn.addEventListener('click', function(){
  hideMenu()
  open_file_input.click();
})

function hideMenu(){
  file_menu.style.display = "none";
  menuActive = false;
}

document.body.style.backgroundImage = "url('file:///E:/sultan.jpg')";
var audio = new Audio('file:///E:/Music/Challa.mp3');
var songDuration = 0;
audio.addEventListener('loadedmetadata', function() {
    songDuration = audio.duration;
    audio.play();
});
audio.muted = true;
