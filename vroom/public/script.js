const socket = io('/');
const videoGrid = document.getElementById('video-grid');
/*const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
});*/
const myPeer = new Peer(undefined, {path: '/peerjs', host: '/', port: '443'});
let myVideoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
/*navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);
  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });
*/

function appendMediaDevices(){
  navigator.mediaDevices.getUserMedia({video: true,audio: true,},
    function(stream){
      addVideoStream(myVideo, stream);
      myPeer.on('call', (call)=>{
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream)=>{
            addVideoStream(video, userVideoStream);
        });
      });
      addVideoStream(stearm, myVideo);
    }
  );
}
socket.on('user-connected', userId => {
  connectToNewUser(userId, stream);
});
let text = $("input");
$('html').keydown(function (e) {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit('message', text.val());
    text.val('');
  }
});

socket.on('username', (username)=>{
  username = prompt('Name');
});

socket.on("createMessage", (message) => {
    $("ul").append(`<li class="message"><b>${socket.username}</b><br/>${message}</li>`);
    scrollToBottom();
});

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}

function leaveMeeting(){
  window.location = '/';
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>`;
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`;
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>`;
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Start Video</span>`;
  document.querySelector('.main__video_button').innerHTML = html;
}

const errorMsg = (t, msg) => {
  if(t.toLowerCase() == 'error'){
    const html = `<li style="color:red;">${msg}</li>`;
    document.querySelector('#error_box').innerHTML += html + ' ';
  }else if(t.toLowerCase() == 'connect'){
    const html = `<li style="color:green;">${msg}</li>`;
    document.querySelector('#error_box').innerHTML += html + ' ';
  }else{
    const html = '<li style="color:orange">Message type is undefined</li>';
    dicument.querySelector('#error_box').innerHTML = html;
  }
}

try{
  appendMediaDevices();
  errorMsg('connect', 'mediaDevices are good!');
}catch (e){
  errorMsg('error', `${e}`);
}