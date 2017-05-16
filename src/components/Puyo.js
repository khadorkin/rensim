/* @flow */

import React, { PureComponent } from 'react';
import { Image } from 'react-native';

const puyoImages = [
  null,
  require('../../assets/puyo_red.png'),
  require('../../assets/puyo_green.png'),
  require('../../assets/puyo_blue.png'),
  require('../../assets/puyo_yellow.png')
];

/**
 * Component for render single puyo
 */
export default class Puyo extends PureComponent {
  style() {
    return {
      position: 'absolute',
      top: this.props.y,
      left: this.props.x,
      width: this.props.size,
      height: this.props.size,
      opacity: this.props.a || 1
    };
  }

  render() {
    const image = puyoImages[this.props.puyo];
    if (image === null) return null;

    return (
      <Image style={ this.style() } source={ image }/>
    );
  }
}