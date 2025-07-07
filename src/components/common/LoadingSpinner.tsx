import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { styles } from './LoadingSpinner.styles';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
  overlay?: boolean;
  overlayColor?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#007AFF',
  style,
  overlay = false,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Scale animation for breathing effect
    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`,
        },
        {
          scale: interpolate(scale.value, [0.8, 1.2], [0.9, 1.1]),
        },
      ],
    };
  });

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 32;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  const spinnerSize = getSpinnerSize();
  const strokeWidth = Math.max(2, spinnerSize / 8);
  const radius = (spinnerSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const SpinnerComponent = (
    <View style={[styles.container, style]}>
      <Animated.View style={[animatedStyle]}>
        <View
          style={[
            styles.spinner,
            {
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: spinnerSize / 2,
              borderWidth: strokeWidth,
              borderTopColor: color,
              borderRightColor: `${color}80`,
              borderBottomColor: `${color}40`,
              borderLeftColor: `${color}20`,
            },
          ]}
        />
      </Animated.View>
    </View>
  );

  if (overlay) {
    return (
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        {SpinnerComponent}
      </View>
    );
  }

  return SpinnerComponent;
};

export default LoadingSpinner;