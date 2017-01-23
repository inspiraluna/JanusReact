'use strict';


import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,  
  Text,
  Navigator,
  TouchableHighlight,
  ToolbarAndroid,
} from 'react-native';
import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc';

var Dimensions = require('Dimensions');
var window = Dimensions.get('window');

//var server = "http://35.167.53.111:8088/janus";
var server = "wss://www.le-space.de/janus"; //JANUS
//var server = "wss://localhost/janus"; //JANUS


var echotest = null;
var started = false;

var localstream_janus, remotestream_janus; 
let container;

export default class First extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info: 'Initializing',
      status: 'init',
      isFront: true,
      selfViewSrc: null,
      remoteViewSrc: null,
      windowWidth:Dimensions.get('window').width,
      windowHeight:(Dimensions.get('window').height),
    };
    
  }
  setNativeProps(nativeProps) {
    //   this._root.setNativeProps(nativeProps);
  }
  componentDidMount () {
       container = this;
       this.setState({ info: 'Initializing' });
       this._connectJanus();
  } 
  render() {

     return (
      <View style={{flex:1}}>
       <RTCView  
          streamURL={this.state.selfViewSrc}
          style={{ padding: 0, top: 0,  transform: [{scale: 1.41},]
            , width: (this.state.windowWidth), height: (this.state.windowHeight) }}
           
        />
        {

        }
      </View>
    );
  }
  _connectJanus(event) {
    
    //this.setState({status: 'connect', info: 'Connecting'});
    //this.setState({ showText: !this.state.showText });
    var Janus = require('./janus.nojquery.js');
    
    Janus.init({debug: "all", callback: function() {
            if(started)
                return;
            started = true;
    }});

    var janus = new Janus({
                    server: server,
                    iceServers: [{urls:["stun:5.9.154.226:3478",
                    "stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302","stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302","stun:stun.ekiga.net",
                    "stun:stun.ideasip.com","stun:stun.schlund.de","stun:stun.voiparound.com",
                    "stun:stun.voipbuster.com","stun:stun.voipstunt.com","stun:stun.voxgratia.org",
                    "stun:stun.services.mozilla.com"]},
                    {"urls":["turn:5.9.154.226:3478"],"username":"akashionata","credential":"silkroad2015"}],
          
                    camera_front: container.state.isFront,

                    success: function() {
                        janus.attach(
                            {
                                plugin: "janus.plugin.echotest",
                               // plugin: "janus.plugin.videoroom",
                                success: function(pluginHandle) {
                                    echotest = pluginHandle;
                                    Janus.log("Plugin attached! (" + echotest.getPlugin() + ", id=" + echotest.getId() + ")");
                                    container.setState({ info: 'Plugin attached' });
                                    // Negotiate WebRTC
                                    var body = { "audio": true, "video": true };
                                    Janus.debug("Sending message (" + JSON.stringify(body) + ")");
                                    echotest.send({"message": body});
                                    Janus.debug("Trying a createOffer too (audio/video sendrecv)");
                                    echotest.createOffer(
                                      {
                                        // No media provided: by default, it's sendrecv for audio and video
                                        media: { data: true },  // Let's negotiate data channels as well
                                        success: function(jsep) {
                                          Janus.debug("Got SDP!");
                                           container.setState({ info: 'Got SDP' });
                                          Janus.debug(jsep);
                                          echotest.send({"message": body, "jsep": jsep});
                                        },
                                        error: function(error) {
                                          Janus.error("WebRTC error:", error);
                                          bootbox.alert("WebRTC error... " + JSON.stringify(error));
                                        }
                                      });
                                },
                                error: function(error) {
                                    Janus.error("  -- Error attaching plugin...", error);
                                    container.setState({ info: 'Error attaching plugin' });
                                
                                },
                                consentDialog: function(on) {
                                },
                                mediaState: function(medium, on) {
                                    var msg = "Janus " + (on ? "started" : "stopped") + " receiving our " + medium;
                                    container.setState({ info: msg });
                                    Janus.log(msg);
                                },
                                webrtcState: function(on) {
                                    var msg = "Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now";
                                    container.setState({ info: msg });
                                    Janus.log(msg);
                                    // $("#videolocal").parent().parent().unblock();
                                },
                                onmessage: function(msg, jsep) {
                                  Janus.debug(" ::: Got a message :::");
                                  Janus.debug(JSON.stringify(msg));
                                  if(jsep !== undefined && jsep !== null) {
                                    Janus.debug("Handling SDP as well...");
                                    Janus.debug(jsep);
                                    echotest.handleRemoteJsep({jsep: jsep});
                                  }
                                  var result = msg["result"];
                                },
                                onlocalstream: function(stream) {
                                    Janus.debug("got local stream");
                                   container.setState({status: 'connect', info: 'got local stream'});
                                   localstream_janus = stream;
                                    container.setState({selfViewSrc: stream.toURL()});
                                },
                                onremotestream: function(stream) {
                                    var msg = "got remote stream";
                                    container.setState({ info: msg });
                                    Janus.debug(msg);
                                   
                                  //  this.setState({status: 'connect', info: 'Connected - got remote stream'});
                                   remotestream_janus = stream;
                                   container.setState({remoteViewSrc: stream.toURL()});
                                    // The publisher stream is sendonly, we don't expect anything here
                                },
                                oncleanup: function() {

                                }
                            });
                    },
                    error: function(error) {
                        Janus.error(error);
                         
                    },
                    destroyed: function() {
                      
                    }
                });

  }
}

const styles = StyleSheet.create({
  selfView: {
    width: 200,
    height: 150,
  },
  remoteView: {
    width: 200,
    height: 150,
  },
  container: {
    backgroundColor: '#F5FCFF',
  }
});