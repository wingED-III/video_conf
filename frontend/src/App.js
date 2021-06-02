import './App.css';
import history from "./history";
import React, { useEffect, useRef, useState } from "react"
import { Button, TextField } from '@material-ui/core';
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"
import CustomizedInput from "./components/CustomizedInput";

const socket = io.connect('http://localhost:5000')
function App() {

  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()
  const [ stream, setStream ] = useState()
  const [ idToCall, setIdToCall ] = useState("")
  const [ me, setMe ] = useState("")
  const [ callEnded, setCallEnded] = useState(false)
  const [ callAccepted, setCallAccepted ] = useState(false)
  const [name, setName] = useState("");
  useEffect(()=> {/*
    navigator.mediaDevices.getUserMedia({video: true,audio: true}).then((stream) =>{
      setStream(stream)
      myVideo.current.srcObject = stream
    }) */
    socket.on("me", (id) => {
			setMe(id)
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
    history.push({ pathname: "/room" })
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
      <TextField
					id="filled-basic"
					label="Room ID"
					variant="filled"
					value={idToCall}
					onChange={(e) => setIdToCall(e.target.value)}
				/>
        <div className="call-button">
						<Button variant="contained" color="primary"  onClick={() => callUser(idToCall)}>
							Join Room
						</Button>
					{idToCall}
          </div>
        <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
        <Button variant="contained" color="primary">
          Create Room
        </Button>
        </CopyToClipboard>
        <form className="form">
          <CustomizedInput
            label="Name"
            id="name"
            /*handleChange={this.handleChange}*/
          />
          <CustomizedInput
            label="Room ID"
            id="roomid"
            /*handleChange={this.handleChange}*/
          />
          <Button type="button" className="form__custom-button" >
            Join Room
          </Button>
          <Button type="button" className="form__custom-button">
            Create Room
          </Button>
        </form>
      </div>
    </div>
  );
}

export default App;
