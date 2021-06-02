import './App.css';
import React, { useEffect, useRef, useState } from "react"
import { Button, TextField } from '@material-ui/core';
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"
import CustomizedInput from "./components/CustomizedInput";
import Logo from "./components/Zeem.png";

const socket = io.connect('http://localhost:5000')
function App() {

  const myVideo = useRef()
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
  useEffect(()=> {/*
    navigator.mediaDevices.getUserMedia({video: true,audio: true}).then((stream) =>{
      setStream(stream)
      myVideo.current.srcObject = stream
    }) */
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
	}
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
        <img src={Logo} className="logo"/>
        <form className="form">
          <CustomizedInput
            label="Name"
            id="name"
            handleChange={(e) => setName(e.target.value)}
          />
          <CustomizedInput
            label="Room ID"
            id="roomid"
            handleChange={(e) => setIdToCall(e.target.value)}
          />
          <Button type="button" className="form__custom-button"  onClick={() => callUser(idToCall)}>
            Join Room
          </Button>
          <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
          <Button type="button" className="form__custom-button">
            Create Room
          </Button>
          </CopyToClipboard>
        </form>
      </div>
    </div>
  );
}

export default App;
