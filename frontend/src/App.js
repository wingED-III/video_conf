import './App.css';
import React, { useEffect, useRef, useState } from "react"
import { Button, Tooltip, Typography, useControlled } from '@material-ui/core';

import Peer from "simple-peer"
import io from "socket.io-client"
import CustomizedInput from "./components/CustomizedInput";
import Logo from "./components/Zeem.png";
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CallIcon from '@material-ui/icons/Call';
import CallEndIcon from '@material-ui/icons/CallEnd';

const socket = io.connect('http://localhost:5000')
function App() {

  const myVideo = useRef()
  const myAudio = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()
  const [ me, setMe ] = useState("")
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")
  const [ othername, setOtherName ] = useState("")
  const [ roomId, setRoomId ] = useState("")
  
  useEffect(()=> {
    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) =>{
      setStream(stream)
        myVideo.current.srcObject = stream
    }) 
    socket.on("me", (id) => {
			setMe(id)
		})
    socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setOtherName(data.name)
			setCallerSignal(data.signal)
		})
    socket.on("callEnded", () => {
      setCallEnded(true)
      connectionRef.current.destroy()
		})
    socket.on("callAccepted", (data) => {
      setOtherName(data.name)
		})
   
  },[])
  
  const callUser = (id,name) => {

		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			
				userVideo.current.srcObject = stream
			
		})
		socket.on("callAccepted", (data) => {
			setCallAccepted(true)
			peer.signal(data.signal)
		})
		connectionRef.current = peer
    console.log("fff")
	}
  const leaveCall = () => {	
    setCallEnded(true)
    setReceivingCall(false)
    socket.emit("callEnded", {

    })
		connectionRef.current.destroy()
	}
  const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller, name: name })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})
		peer.signal(callerSignal)
		connectionRef.current = peer
	}

  const handleCreateRoom =()=>{
    navigator.clipboard.writeText(me)
    setRoomId(me)
  }

  let isVideo = true
  const muteVideo = () => {
    isVideo = !isVideo
    stream.getVideoTracks()[0].enabled = isVideo
    if(isVideo === false){
      console.log('camera close')
      document.getElementById("vdoimg").src="cameraoff.png"
    }
    else{
      document.getElementById("vdoimg").src="camera.png"
    }

  }

  let isAudio = true
  const muteAudio = () => {
    isAudio = !isAudio
    stream.getAudioTracks()[0].enabled = isAudio
    if(isAudio === false){
      console.log('mic close')
      document.getElementById("micimg").src="micoff.png"
    }
    else{
      document.getElementById("micimg").src="mic.png"
    }

  }

  return (
    <div className="top-down">
      <img src={Logo} className={roomId!==""?"logo-calling":"logo-main"}/>
      { roomId!=="" && 
      <div className="room-header" id="room-id">
        <Typography className="room-id">
          Room ID: {roomId}   
        </Typography>
        <Tooltip title="Copy to Clipboard">
        <Button variant="text" onClick={() => {navigator.clipboard.writeText(me)}}>
            <FileCopyIcon/>
          </Button>
        </Tooltip>
      </div>}
      <div className="container">
      <div className="video-container">
        <div className="video">
          <Typography variant='h5'style={{color:'#635a56'}}>{name!==""?name:'Me'}</Typography>
          {stream && <video playsInline muted ref={myVideo} autoPlay style={{width: "350px"}}/>}
        </div>
        {callAccepted && !callEnded ? 
        <div className="video-user">
          <Typography variant='h5' style={{color:'#635a56'}}>{othername!==""?othername:"Unknown User"}</Typography>
            <video playsInline ref={userVideo} autoPlay style={{width:"350px"}}/>
        </div> : null}
      </div>
      {!(callAccepted && !callEnded) &&
        <div className="room">
          <form className="form">
            <CustomizedInput
              label="Name"
              handleChange={(e) => setName(e.target.value)}
            />
            <CustomizedInput
              label="Room ID"
              handleChange={(e) => setIdToCall(e.target.value)}
            />
            <Button className="custom-button"  onClick={callUser(idToCall,name)}>
              Join Room
            </Button>
            <Button className="custom-button"  onClick={handleCreateRoom}>
              Create Room
            </Button>
          </form>
        </div>}
      </div>
      {receivingCall && !callAccepted &&!callEnded ? 
      <div className="room-header" style={{marginTop:'25px'}}>
        <Typography className="room-id">
          {othername!==""?othername:"Unknown User"} is Calling ...     
        </Typography>
          <Button variant="contained" style={{color:'white', backgroundColor:'#79C978'}} onClick={answerCall}>
            <CallIcon />
          </Button>
          <Button variant="contained" style={{color:'white', backgroundColor:'#E83B3B'}} onClick={leaveCall}>
            <CallEndIcon />
          </Button>
      </div> : null }
      
        
      <div className="down-button">
        <Button className="muteVideo" onClick={() => muteVideo()}>
          <img id="vdoimg" src="camera.png"></img>
        </Button>
      {!callEnded && callAccepted ?  
        <Button className="leave-button" onClick={leaveCall}>
          Leave Call
        </Button> : null}
        <Button className="muteAudio" onClick={() => muteAudio()}>
            <img id="micimg" src="mic.png"></img>
        </Button>
      </div>
    </div> 
  );
}

export default App;
