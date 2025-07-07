import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import HapticFeedback from 'react-native-haptic-feedback';
import { styles } from './Button.styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  hapticFeedback = true,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    
    if (hapticFeedback) {
      HapticFeedback.trigger('impactLight');
    }
    
    onPress();
  };

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles = [styles.button, styles[size]];
    
    if (fullWidth) {
      baseStyles.push(styles.fullWidth);
    }
    
    if (disabled) {
      baseStyles.push(styles.disabled);
    } else {
      baseStyles.push(styles[variant]);
    }
    
    if (style) {
      baseStyles.push(style);
    }
    
    return baseStyles;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyles = [styles.text, styles[`${size}Text`]];
    
    if (disabled) {
      baseStyles.push(styles.disabledText);
    } else {
      baseStyles.push(styles[`${variant}Text`]);
    }
    
    if (textStyle) {
      baseStyles.push(textStyle);
    }
    
    return baseStyles;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'primary' ? '#FFFFFF' : '#007AFF'}
        />
      );
    }

    const textElement = (
      <Text style={getTextStyle()}>
        {title}
      </Text>
    );

    if (!icon) {
      return textElement;
    }

    return (
      <>
        {iconPosition === 'left' && (
          <>
            {icon}
            <Text style={[getTextStyle(), { marginLeft: 8 }]}>
              {title}
            </Text>
          </>
        )}
        {iconPosition === 'right' && (
          <>
            <Text style={[getTextStyle(), { marginRight: 8 }]}>
              {title}
            </Text>
            {icon}
          </>
        )}
      </>
    );
  };

  return (
    <AnimatedTouchableOpacity
      style={[getButtonStyle(), animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1} // We handle opacity with animations
    >
      {renderContent()}
    </AnimatedTouchableOpacity>
  );
};

export default Button;