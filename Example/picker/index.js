import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const {
  add,
  divide,
  ceil,
  floor,
  greaterOrEq,
  or,
  multiply,
  block,
  call,
  cond,
  Clock,
  event,
  eq,
  set,
  timing,
  Value,
  clockRunning,
  startClock,
  stopClock,
} = Animated;

const VALUE_HEIGHT = 50;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  thing: {
    height: VALUE_HEIGHT,
    width: VALUE_HEIGHT,
    backgroundColor: 'red',
  },
  stripes: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  stripe: {
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    height: VALUE_HEIGHT,
  },
})

const runSnap = (clock, yPositionOnRelease, dragY) => {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    duration: 200,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease),
  };
  const decimalValueIndex = divide(yPositionOnRelease, VALUE_HEIGHT)
  const step = cond(greaterOrEq(dragY, 0),
    ceil(decimalValueIndex),
    floor(decimalValueIndex),
  )

  const landingHeight = multiply(step, VALUE_HEIGHT);

  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.frameTime, 0),
      set(state.position, yPositionOnRelease),
      set(config.toValue, landingHeight),
      startClock(clock),
    ]),
    timing(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ])
}

const stripes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

class Picker extends React.Component {
  constructor(props) {
    super(props)

    this.dragY = new Value(0)
    this.offsetY = new Value(0)
    this.gestureState = new Value(-1)
    this.snapClock = new Clock()

    this.onGestureEvent = event([
      {
        nativeEvent: {
          translationY: this.dragY,
          state: this.gestureState,
        },
      },
    ])

    const addY = add(this.dragY, this.offsetY)

    this._transY = cond(
      eq(this.gestureState, State.ACTIVE),
      addY,
      cond(eq(this.gestureState, State.END),
        set(this.offsetY, runSnap(this.snapClock, addY, this.dragY)),
        set(this.offsetY, addY),
      ),
    )
  }

  render() {
    return (
      <View style={styles.screen}>
        <View style={styles.stripes}>
          {stripes.map(stripe => <View style={styles.stripe} />)}
        </View>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={this.onGestureEvent}
          onHandlerStateChange={this.onGestureEvent}>
          <Animated.View style={
            [
              styles.thing,
              {
                transform: [
                  { translateY: this._transY }
                ]
              }
            ]
          } />
        </PanGestureHandler>
      </View>
    )
  }
}

export default Picker;
