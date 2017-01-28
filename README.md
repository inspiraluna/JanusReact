# JanusReact 

## Usage
- Clone the repository, run `npm install`.  
- For iOS, run the project on Xcode.  
- For Android, run `react-native run-android` in the directory.  

- first.js is doing the echo - touching the screen switches to second screen
- second.js is doing streaming to a local file on janus-server - change mount point in this file 



##Todo
- start gstreamer for delivering local rtpstream
	- janus gstreamer 
		https://the.randomengineer.com/2014/05/21/lightweight-live-video-in-a-webpage-with-gstreamer-and-webrtc/
	- gstreamer rtsp project 
		https://planb.nicecupoftea.org/2015/07/28/hackspacehat-part-1-webrtc-janus-and-gstreamer/
	- rtsp-demo-urls 
		http://g33ktricks.blogspot.com.es/p/the-rtsp-real-time-streaming-protocol.html
	- live555 rtsp-server/streamer	
		http://www.live555.com/openRTSP/

##Done:
- 2017-01-27 (main) corrected packages json
- 2017-01-22 (main) replaced remote video on screen with remote video
- 2016-12-28 (echo) make proper fullscreen of remote view https://github.com/oney/react-native-webrtc/issues/23
- 2016-12-20 (main) write component which can show/hide two different components
- 2016-12-21 (echo) hide localVideo (just don't display it)
- (2h) implement streaming version 
	https://github.com/meetecho/janus-gateway/blob/master/html/streamingtest.js
	https://janus.conf.meetecho.com/streamingtest.html
- (1h) deploy for production on ios 
	https://facebook.github.io/react-native/releases/0.21/docs/running-on-device-ios.html#content
	http://stackoverflow.com/questions/37186967/undefined-symbols-for-architecture-x86-64-stdterminate-referenced-from
- (1h) deploy for production on android 
	https://facebook.github.io/react-native/releases/0.21/docs/signed-apk-android.html
- deploy on android
- bug in android Missing keys in getUserMedia 
	https://github.com/oney/react-native-webrtc/issues/145
	https://github.com/oney/react-native-webrtc/issues/157
