import React from 'react';
import { Text, TextProps } from 'react-native';

export default function CustomText(props: TextProps) {
  return <Text {...props} style={[{ fontFamily: 'Inter_400Regular' }, props.style]} />;
}
