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
var streaming = null;
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
                    success: function() {
                        janus.attach(
                            {
                                plugin: "janus.plugin.streaming",
                               // plugin: "janus.plugin.videoroom",
                                success: function(pluginHandle) {
                                    streaming = pluginHandle;
                                    Janus.log("Plugin attached! (" + streaming.getPlugin() + ", id=" + streaming.getId() + ")");
                                    
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

                                          var body = { "request": "watch", id: 2 };
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
                                            stopStream();
                                        }
                                      } else if(msg["error"] !== undefined && msg["error"] !== null) {
                                        bootbox.alert(msg["error"]);
                                        stopStream();
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
                                              bootbox.alert("WebRTC error... " + JSON.stringify(error));
                                            }
                                          });
                                      }

                                },
                                onremotestream: function(stream) {
                                   Janus.debug("got remote stream");
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

  },
  _connectJanus(event) {
    this.setState({status: 'connect', info: 'Connecting'});
    janusStart();

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
