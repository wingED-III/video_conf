import './App.css';
import React, { useEffect, useRef, useState } from "react"
import { Button, TextField } from '@material-ui/core';
import { CopyToClipboard } from "react-copy-to-clipboard"
// import Peer from "simple-peer"
import io from "socket.io-client"

const socket = io.connect('http://localhost:5000')
function App() {

  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()
  const [ stream, setStream ] = useState()
  const [ idToCall, setIdToCall ] = useState("")
  const [ me, setMe ] = useState("")

  useEffect(()=> {/*
    navigator.mediaDevices.getUserMedia({video: true,audio: true}).then((stream) =>{
      setStream(stream)
      myVideo.current.srcObject = stream
    }) */
    socket.on("me", (id) => {
			setMe(id)
		})
  },[])
  
  //อยู่ใน const callUser กับ const answerCall จ้า
  /*peer.on("stream", (stream) => {
    userVideo.current.srcObject = stream
  })*/


  return (
    <div className="container">
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
      <TextField
					id="filled-basic"
					label="Room ID"
					variant="filled"
					value={idToCall}
					onChange={(e) => setIdToCall(e.target.value)}
				/>
        <Button variant="contained" color="primary">
          Join Room
        </Button>
        <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
        <Button variant="contained" color="primary">
          Create Room
        </Button>
        </CopyToClipboard>
        </div>
    </div>
  );
}

export default App;
