import React, { Component, PureComponent } from "react";
//import { View, Text } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import {
  StyleSheet,
  Text,
  View,
  Dimensions
} from 'react-native';
const  { width, height, scale } = Dimensions.get('window');

import raf from 'raf';
import hoistNonReactStatics from 'hoist-non-react-statics';

// NB this is only an utility for the examples
function timeLoop(C, { refreshRate = 60 } = {}) {
  class TL extends PureComponent {
    static displayName = `timeLoop(${C.displayName||C.name||""})`;
    state;
    state = {
      time: 0,
      tick: 0,
    };
    _r;
    componentDidMount() {
      this.onPausedChange(this.props.paused);
    }
    componentWillReceiveProps({ paused }) {
      if (this.props.paused !== paused) {
        this.onPausedChange(paused);
      }
    }
    componentWillUnmount() {
      raf.cancel(this._r);
    }
    startLoop = () => {
      let startTime, lastTime;
      let interval = 1000 / refreshRate;
      lastTime = -interval;
      const loop = (t) => {
        this._r = raf(loop);
        if (!startTime) startTime = t;
        if (t - lastTime > interval) {
          lastTime = t;
          this.setState({
            time: t - startTime,
            tick: this.state.tick + 1,
          });
        }
      };
      this._r = raf(loop);
    };
    onPausedChange = paused => {
      if (paused) {
        raf.cancel(this._r);
      }
      else {
        this.startLoop();
      }
    };
    render() {
      return <C
        {...this.props}
        {...this.state}
      />;
    }
  };

  hoistNonReactStatics(TL, C);
  return TL;
}

const shaders = Shaders.create({
  helloGL: {
    frag: GLSL`
precision mediump float;
 
uniform float time;
uniform vec2 resolution;
 
void main( void ) {
  float adjustedTime = time * 0.0001;
  vec2 position = ( gl_FragCoord.xy / resolution.xy ) - 0.8;
 
  float x = 0.3 * ( position.x + 1. ) * sin( 3.0 * position.x - 8. * adjustedTime );
 
  float y = 4. / ( 40. * abs(position.y - x));
 
  gl_FragColor = vec4( (position.x) * y, 0.5 * y, y, 10. );
}
`
  }
});

const Sketch = ({ time, width, height }) => {
  return (
    //*<Surface style={{ width, height }} width={width} height={height}>*/
    <Surface style={{ width:"100%", height:"100%" }}>
      <Node
        shader={shaders.helloGL}
        uniforms={{ time, resolution: [ 300, 300 ] }} />
    </Surface>
  )
}
const Comp = timeLoop(Sketch);

export default class GL extends Component {
  render() {
    return (
      <View style={{ flex:1 }}>
        <Comp width="100%" heigh="100%" />
      </View>
    );
  }
}
