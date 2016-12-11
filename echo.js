'use strict';

import React, { Component } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TextInput,
  ListView,
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

//import { JANUS } from 'react-native-dotenv'
var server = "wss://www.le-space.de/janus"; //JANUS
//var server = "wss://localhost/janus"; //JANUS

var janus = null;
var echotest = null;
var started = false;

var localstream_janus, remotestream_janus; 

function janusStart(){

var Janus = require('./janus.nojquery.js');
    
    Janus.init({debug: "all", callback: function() {
            if(started)
                return;
            started = true;
    }});

    janus = new Janus({
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
                                    bootbox.alert("Error attaching plugin... " + error);
                                },
                                consentDialog: function(on) {
                                },
                                mediaState: function(medium, on) {
                                    Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                                },
                                webrtcState: function(on) {
                                    Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
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
                                   // this.setState({status: 'connect', info: 'got local stream'});
                                    localstream_janus = stream;
                                    container.setState({selfViewSrc: stream.toURL()});
                                },
                                onremotestream: function(stream) {
                                   Janus.debug("got remote stream");
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
                         bootbox.alert(error, function() {
                             window.location.reload();
                         });
                    },
                    destroyed: function() {
                        window.location.reload();
                    }
                });

}

let container;

const RCTWebRTCDemo = React.createClass({
  getInitialState: function() {

    return {
      info: 'Initializing',
      status: 'init',
      isFront: true,
      selfViewSrc: null,
      remoteViewSrc: null,
    };

  },
  componentDidMount: function() {
    container = this;
        this.setState({status: 'connect', info: 'Connecting'});
    janusStart();
  },
  _connectJanus(event) {

  },
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {this.state.info}
        </Text>
        { this.state.status != 'ready' ?
          (<View>
            <TouchableHighlight
              onPress={this._connectJanus}>
              <Text>Connect Janus</Text>
            </TouchableHighlight>
          </View>) : null
        }
        <RTCView streamURL={this.state.selfViewSrc} style={styles.selfView}/>
        {

        }
        <RTCView streamURL={this.state.remoteViewSrc} style={styles.remoteView}/>
        {
       /*   mapHash(this.state.remoteList, function(remote, index) {
            return <RTCView key={index} streamURL={remote} style={styles.remoteView}/>
          })*/
        }

      </View>
    );
  }
});

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
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

AppRegistry.registerComponent('RCTWebRTCDemo', () => RCTWebRTCDemo);
