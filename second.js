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


var server = "https://video1.onu.io:8090/janus";

//var server = "wss://www.le-space.de/janus"; //JANUS
var mountpoint = 4;

//import { JANUS } from 'react-native-dotenv'
var janus = null;
var streaming = null;
var started = false;

var localstream_janus, remotestream_janus; 
let containerStreaming;

export default class Second extends Component {
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
       containerStreaming = this;
       this.setState({ info: 'Initializing' });
       //this._connectJanus();
  } 
  render() {

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Streaming State: {this.state.info}</Text>
        { this.state.status != 'streaming' ?
          (<View>
            <TouchableHighlight 
              onPress={this._connectJanus}>
              <Text style={styles.button}>Connect to Janus Stream</Text>
            </TouchableHighlight>
          </View>) : null
        }
        { this.state.status == 'streaming' ?
          (<View>
            <TouchableHighlight onPress={this._stopJanus}>
              <Text style={styles.button}>Stop Stream</Text>
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
   _stopJanus(event) {
    var body = { "request": "stop" };
    streaming.send({"message": body});
    streaming.hangup();
  }
  _connectJanus(event) {
    
   containerStreaming.setState({status: 'connect', info: 'Connecting'});
    
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
                    success: function() {
                        janus.attach(
                            {
                                plugin: "janus.plugin.streaming",
                               // plugin: "janus.plugin.videoroom",
                                success: function(pluginHandle) {
                                    streaming = pluginHandle;
                                    Janus.log("Plugin attached! (" + streaming.getPlugin() + ", id=" + streaming.getId() + ")");
                                    
                                    containerStreaming.setState({status: 'attached', info: 'Plugin attached'});
                                    
                                    var body = { "request": "list" };
                                    Janus.debug("Sending message (" + JSON.stringify(body) + ")");
                                    streaming.send({"message": body, success: function(result) {
                                      setTimeout(function() {
                                     //   $('#update-streams').removeClass('fa-spin').click(updateStreamsList);
                                      }, 500);
                                      if(result === null || result === undefined) {
                                       // bootbox.alert("Got no response to our query for available streams");
                                        return;
                                      }
                                      if(result["list"] !== undefined && result["list"] !== null) {
                                       // $('#streams').removeClass('hide').show();
                                       // $('#streamslist').empty();
                                       // $('#watch').attr('disabled', true).unbind('click');
                                        var list = result["list"];
                                        Janus.log("Got a list of available streams");
                                        Janus.debug(list);
                                        for(var mp in list) {
                                          Janus.debug("  >> [" + list[mp]["id"] + "] " + list[mp]["description"] + " (" + list[mp]["type"] + ")");
                                         // $('#streamslist').append("<li><a href='#' id='" + list[mp]["id"] + "'>" + list[mp]["description"] + " (" + list[mp]["type"] + ")" + "</a></li>");
                                        }

                                          var body = { "request": "watch", id: mountpoint };
                                          containerStreaming.setState({status: 'requested', info: 'Stream requested'});
                                          streaming.send({"message": body});
                                        //$('#streamslist a').unbind('click').click(function() {
                                          //selectedStream = $(this).attr("id");
                                         // $('#streamset').html($(this).html()).parent().removeClass('open');
                                          //return false;

                                        //});
                                        //$('#watch').removeAttr('disabled').click(startStream);
                                      }
                                    }});
                                    
                                },
                                
                                error: function(error) {
                                    Janus.error("  -- Error attaching plugin...", error);
                                    containerStreaming.setState({status: 'error', info: error});
                                  
                                },

                                consentDialog: function(on) {
                                
                                },
                                
                                mediaState: function(medium, on) {
                                    containerStreaming.setState({status: 'stopped', info: 'Stopped'});
                                    Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                                },
                                
                                webrtcState: function(on) {
                                    Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                                    // $("#videolocal").parent().parent().unblock();
                                },
                                
                                onmessage: function(msg, jsep) {

                                      Janus.debug(" ::: Got a message :::");
                                      Janus.debug(JSON.stringify(msg));
                                      var result = msg["result"];
                                      if(result !== null && result !== undefined) {
                                        if(result["status"] !== undefined && result["status"] !== null) {
                                          var status = result["status"];
                                          if(status === 'starting')
                                              Janus.debug(" ::: starting :::");
                                          //  $('#status').removeClass('hide').text("Starting, please wait...").show();
                                          else if(status === 'started')
                                              Janus.debug(" ::: started :::");
                                          //  $('#status').removeClass('hide').text("Started").show();
                                          else if(status === 'stopped')
                                              containerStreaming.setState({status: 'ready', info: 'ready'});
                                        }
                                      } else if(msg["error"] !== undefined && msg["error"] !== null) {
                                        //bootbox.alert(msg["error"]);
                                        containerStreaming.setState({status: 'stopped', info: 'Stopped'});
                                        //stopStream();
                                        return;
                                      }
                                      if(jsep !== undefined && jsep !== null) {
                                        Janus.debug("Handling SDP as well...");
                                        Janus.debug(jsep);
                                        // Answer
                                        streaming.createAnswer(
                                          {
                                            jsep: jsep,
                                            media: { audioSend: false, videoSend: false },  // We want recvonly audio/video
                                            success: function(jsep) {
                                              Janus.debug("Got SDP!");
                                              Janus.debug(jsep);
                                              var body = { "request": "start" };
                                              streaming.send({"message": body, "jsep": jsep});
                                             // $('#watch').html("Stop").removeAttr('disabled').click(stopStream);
                                            },
                                            error: function(error) {
                                              Janus.error("WebRTC error:", error);
                                              containerStreaming.setState({status: 'error', info: error});
                                             // bootbox.alert("WebRTC error... " + JSON.stringify(error));
                                            }
                                          });
                                      }

                                },
                                onremotestream: function(stream) {
                                   Janus.debug("got remote stream");
                                   containerStreaming.setState({status: 'streaming', info: 'Streaming'});
                                   remotestream_janus = stream;
                                 //  containerStreaming.setState({remoteViewSrc: stream.toURL()});
                                    // The publisher stream is sendonly, we don't expect anything here
                                },
                                oncleanup: function() {
                                    containerStreaming.setState({status: 'ready', info: 'Ready'});
                                }
                            });
                    },
                    error: function(error) {
                        Janus.error(error);
                         //bootbox.alert(error, function() {
                           //  window.location.reload();
                         //});
                    },
                    destroyed: function() {
                        window.location.reload();
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
    top:200,
  },
  button: {
    width: 200,
    height: 150,
    borderStyle:'solid',
    color:'blue',
    top:50,
  },
  container: {
    top: 100,
    backgroundColor: '#F5FCFF',
  }
});