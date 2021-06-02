import './App.css';
import React, { useEffect, useRef, useState } from "react"
import { Button } from '@material-ui/core';
// import Peer from "simple-peer"
import io from "socket.io-client"

const socket = io.connect('http://localhost:5000')
function App() {

  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()
  const [ stream, setStream ] = useState()
/*
  useEffect(()=> {
    navigator.mediaDevices.getUserMedia({video: true,audio: true}).then((stream) =>{
      setStream(stream)
      myVideo.current.srcObject = stream
    })

  },[])
  */ 
  //อยู่ใน const callUser กับ const answerCall จ้า
  /*peer.on("stream", (stream) => {
    userVideo.current.srcObject = stream
  })*/


  return (
    <div className="container">
      <p>test ja</p>
      <div className="video-container">
       {/*  <div className="video">
          {stream && <video playsInline muted ref={myVideo} autoPlay style={{width: "300px"}}/>}
        </div>
       <div className="video">
         {callAccepted && !callEnded ?
            <video playsInline ref={userVideo} autoPlay style={{width:"300px"}}/>:
        null} 
        </div> 
         */}
      </div> 
      <div className="room">
        <Button variant="contained" color="primary">
          Join Room
        </Button>
        <Button variant="contained" color="primary">
          Create Room
        </Button>
        </div>
    </div>
  );
}

export default App;
