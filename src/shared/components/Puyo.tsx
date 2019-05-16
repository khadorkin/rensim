import React from 'react';
import { Component } from 'react';
import { Animated, Image, ViewStyle } from 'react-native';
import _ from 'lodash';
import { PuyoConnection } from "../selectors/simulatorSelectors";

declare function require(x: string): any;

const puyoImages = {
  'puyoSkinDefault': [
    null,
    require('../../../assets/puyo_red.png'),
    require('../../../assets/puyo_green.png'),
    require('../../../assets/puyo_blue.png'),
    require('../../../assets/puyo_yellow.png'),
    require('../../../assets/puyo_purple.png')
  ],
  'puyoSkinCharacter': [
    null,
    require('../../../assets/puyo_red_char.png'),
    require('../../../assets/puyo_green_char.png'),
    require('../../../assets/puyo_blue_char.png'),
    require('../../../assets/puyo_yellow_char.png'),
    require('../../../assets/puyo_purple_char.png')
  ]
};

const connectionImages = {
  'puyoSkinDefault': [
    {
      horizontal: require('../../../assets/puyo_red_connect_horizontal.png'),
      vertical: require('../../../assets/puyo_red_connect_vertical.png')
    },
    {
      horizontal: require('../../../assets/puyo_green_connect_horizontal.png'),
      vertical: require('../../../assets/puyo_green_connect_vertical.png')
    },
    {
      horizontal: require('../../../assets/puyo_blue_connect_horizontal.png'),
      vertical: require('../../../assets/puyo_blue_connect_vertical.png')
    },
    {
      horizontal: require('../../../assets/puyo_yellow_connect_horizontal.png'),
      vertical: require('../../../assets/puyo_yellow_connect_vertical.png')
    },
    {
      horizontal: require('../../../assets/puyo_purple_connect_horizontal.png'),
      vertical: require('../../../assets/puyo_purple_connect_vertical.png')
    }
  ],
  'puyoSkinCharacter': [
    {
      horizontal: require('../../../assets/puyo_red_connect_horizontal_char.png'),
      vertical: require('../../../assets/puyo_red_connect_vertical_char.png')
    },
    {
      horizontal: require('../../../assets/puyo_green_connect_horizontal_char.png'),
      vertical: require('../../../assets/puyo_green_connect_vertical_char.png')
    },
    {
      horizontal: require('../../../assets/puyo_blue_connect_horizontal_char.png'),
      vertical: require('../../../assets/puyo_blue_connect_vertical_char.png')
    },
    {
      horizontal: require('../../../assets/puyo_yellow_connect_horizontal_char.png'),
      vertical: require('../../../assets/puyo_yellow_connect_vertical_char.png')
    },
    {
      horizontal: require('../../../assets/puyo_purple_connect_horizontal_char.png'),
      vertical: require('../../../assets/puyo_purple_connect_vertical_char.png')
    }
  ]
};

export interface Props {
  puyo: number,
  connections?: PuyoConnection,
  x?: number,
  y?: number | Animated.Animated,
  a?: number | Animated.Animated,
  size: number,
  skin: string
}

interface State {
}

/**
 * Component for render single puyo
 */
export default class Puyo extends Component<Props, State> {
  style(): ViewStyle {
    const { x, y, size, a } = this.props;

    if (x && y) {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        transform: [
          {
            translateX: x,
          },
          {
            translateY: y as number, // TODO: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/28164
          }
        ],
        width: size + 1,
        height: size + 1,
        opacity: a === undefined ? 1 : a as number  // TODO: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/28164
      };
    } else {
      return {
        width: size + 1,
        height: size + 1,
        opacity: a === undefined ? 1 : a as number  // TODO: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/28164
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  imageStyle() {
    return {
      width: this.props.size,
      height: this.props.size
    };
  }

  getImage() {
    return puyoImages[this.props.skin][this.props.puyo];
  }

  renderConnection() {
    const { connections, puyo } = this.props;
    if (!connections) return null;
    const base = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: this.props.size,
      height: this.props.size
    };
    const half = this.props.size / 2;
    const image = connectionImages[this.props.skin][puyo - 1];
    const render = (source, style, key) => {
      return (
        <Image source={ source } style={ [base, style] } key={ key }/>
      );
    };

    return [
      connections.top ? render(image.vertical, { top: -half - 1 }, 't') : null,
      connections.bottom ? render(image.vertical, { top: this.props.size - half }, 'b') : null,
      connections.left ? render(image.horizontal, { left: -half }, 'l') : null,
      connections.right ? render(image.horizontal, { left: this.props.size - half }, 'r') : null
    ];
  }

  render() {
    const image = this.getImage();
    if (image === null) return null;

    return (
      <Animated.View style={ this.style() } pointerEvents="none">
        <Image style={ this.imageStyle() } source={ image }/>
        { this.renderConnection() }
      </Animated.View>
    );
  }
}
