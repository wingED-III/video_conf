import './App.css';
import React, { useEffect, useRef, useState } from "react"
import { Button, Tooltip, Typography } from '@material-ui/core';
import { CopyToClipboard } from "react-copy-to-clipboard"
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
  const [ inRoom, setInRoom] = useState(false)
  const [ roomId, setRoomId ] = useState("")

  let localStream
  
  
  useEffect(()=> {
    navigator.mediaDevices.getUserMedia({video: true,audio: true}).then((stream) =>{
      setStream(stream)
        myVideo.current.srcObject = stream
    }) 
    socket.on("me", (id) => {
			setMe(id)
		})
    socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal)
		})
  },[])
  
  const callUser = (id) => {

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
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
    console.log("fff")
	}
  const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
    setInRoom(false)
	}
  const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

  const handleCreateRoom =()=>{
    setRoomId(me)
    console.log(roomId)
  }

  let isVideo = true
  const muteVideo = () => {
    isVideo = !isVideo
    stream.getVideoTracks()[0].enabled = isVideo
  }

  let isAudio = true
  const muteAudio = () => {
    isAudio = !isAudio
    stream.getAudioTracks()[0].enabled = isAudio
  }

  return (
    <div className="top-down">
      <img src={Logo} className={roomId!==""?"logo-calling":"logo-main"}/>
      { roomId!=="" && 
      <div className="room-header">
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
          {stream && <video playsInline muted ref={myVideo} autoPlay style={{width: "350px"}}/>}
        </div>
        <div className="video-user">
          {callAccepted && !callEnded ?
            <video playsInline ref={userVideo} autoPlay style={{width:"350px"}}/>:
          null} 
        </div> 
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
            <Button className="custom-button"  onClick={callUser(idToCall)}>
              Join Room
            </Button>
            <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
            <Button className="custom-button" onclick={handleCreateRoom}>
              Create Room
            </Button>
            </CopyToClipboard>
          </form>
        </div>}
      </div>
      {receivingCall && !callAccepted &&!callEnded ? 
      <div className="room-header" style={{marginTop:'25px'}}>
        <Typography className="room-id">
          Someone is Calling ...     
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
          <img src="camera.png"></img>
        </Button>
      {!callEnded && callAccepted ?  
        <Button className="leave-button" onClick={leaveCall}>
          Leave Call
        </Button> : null}
        <Button className="muteAudio" onclick={() => muteAudio()}>
            <img src="mic.png"></img>
        </Button>
      </div>
    </div> 
  );
}

export default App;
