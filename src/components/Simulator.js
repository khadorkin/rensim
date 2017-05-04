/**
 * Base component
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ToolbarAndroid,
  View
} from 'react-native';
import Field from './Field';
import { contentsMargin } from '../utils/constants';

export default class Simulator extends Component {
  render() {
    const actions = [
      {title: 'Filter'},
      {title: 'Filter'},
      {title: 'Filter'},
      {title: 'Filter'}
    ];
    return (
      <View style={styles.container}>
        <ToolbarAndroid
          actions={ actions }
          style={ styles.toolbar }
          title='ぷよシミュレータ' />
        <View style={ styles.contents }>
          <Field stack={ this.props.stack } style={ styles.field }>
          </Field>
          <View style={ styles.head }>
            <Text>
              Next, double next, scores here.
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#f5fcff',
  },
  toolbar: {
    backgroundColor: '#e9eaed',
    height: 56,
  },
  contents: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  head: {
    flex: 1,
    margin: contentsMargin
  },
  field: {
    backgroundColor: '#BBBBBB',
    margin: contentsMargin
  }
});