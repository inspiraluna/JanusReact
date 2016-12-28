import React, { Component } from 'react';
import { Text, Navigator, View, TouchableHighlight, AppRegistry, } from 'react-native';

import First from './first';
import Second from './second';
//AppRegistry.registerComponent('JanusReact', () => First);

var Dimensions = require('Dimensions');
let container;
const routes = [
  {title: 'Echo Stream', index: 0},
  {title: 'Streaming', index: 1},
];
export default class NavAllDay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowWidth:Dimensions.get('window').width,
      windowHeight:(Dimensions.get('window').height),
    };
  }
  componentDidMount () {
       container = this;
  } 
  render() {
    return (
      <Navigator
        initialRoute={routes[0]}
        navigationBarHidden={true}
        barTintColor='#FFFFFD'
        style={{padding: 0, backgroundColor: 'white' }}
        renderScene={this.navigatorRenderScene}/>
    );
  }

  navigatorRenderScene(route, navigator){
             switch (route.index) {
             case 0:
              return (<View style={{padding: 0, flex:1}}>
              <TouchableHighlight onPress={() => {
                  if (route.index === 0) {
                    navigator.push(routes[1]);
                  } else {
                    navigator.pop();
                  }
                }}>       
               <First/>
                </TouchableHighlight> 
            </View>); 
              case 1: 
              return (<View style={{padding: 100}}>
              <TouchableHighlight onPress={() => {
                  if (route.index === 0) {
                    navigator.push(routes[1]);
                  } else {
                    navigator.pop();
                  }
                }}>       
                   <Second/>
                </TouchableHighlight> 
            </View>)
        }
  }
}

AppRegistry.registerComponent('JanusReact', () => NavAllDay);