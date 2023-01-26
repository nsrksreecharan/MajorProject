import React, { Component } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import {drawRect} from "./utilites"
import Tesseract from "tesseract.js";
import "./App.css";

var Classes=[]

class App extends Component {

  state = {
    imageUrl: null,
    classes:[],
    text:""
  };

  constructor(props) {
    super(props);
    this.webcamRef = React.createRef();
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this.runCoco();
  }

  runCoco = async () => {
    const net = await cocossd.load();
    this.detectInterval = setInterval(() => {
      Classes=[];
      this.detect(net);
    }, 1);
  };



  detect = async (net) => {
    if (
      typeof this.webcamRef.current !== "undefined" &&
      this.webcamRef.current !== null &&
      this.webcamRef.current.video.readyState === 4
    ) {
      const video = this.webcamRef.current.video;
      const videoWidth = this.webcamRef.current.video.videoWidth;
      const videoHeight = this.webcamRef.current.video.videoHeight;

      this.webcamRef.current.video.width = videoWidth;
      this.webcamRef.current.video.height = videoHeight;

      this.canvasRef.current.width = videoWidth;
      this.canvasRef.current.height = videoHeight;

      const obj = await net.detect(video);
      
      const ctx = this.canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
      const classes = Classes;
      obj.forEach((i) => classes.push(i.class));
      this.setState({classes})
    }
  };

  detectText = async () => {
    try {
      const { data: { text } } = await Tesseract.recognize(
        this.state.imageUrl,
        "eng",
        {
          tessjs_create_pdf: "1",
        }
      );
      this.setState({text});
    } catch (error) {
      console.error(error);
    }
  };

  
  capture = () => {
    const imageUrl = this.webcamRef.current.getScreenshot();
    this.setState({ imageUrl ,text:"loading Text"}, this.detectText);
  };

  render() {
    const {text,classes,imageUrl}=this.state
    return (
      <div className="App">
        <header className="App-header">
          <Webcam
            ref={this.webcamRef}
            muted={true}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 9,
              width: 640,
              height: 480,
            }}
          />

          <canvas
            ref={this.canvasRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              width: 640,
              height: 480,
            }}
          />
        </header>
        <button onClick={this.capture}>Capture</button>
          {imageUrl && (
            <img src={this.state.imageUrl} alt="Screenshot" />
          )}
          {text!==""?(
            <p>{text}</p>
          ):""}
          {classes.length?(
            <div className="classesDetected">
              {classes.map(i=><p>{i}</p>)}
            </div>
          ):""}
      </div>
    );
  }
}

export default App;