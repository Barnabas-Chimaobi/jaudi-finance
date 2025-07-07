import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { styles } from './Input.styles';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: 'default' | 'filled' | 'outline';
  size?: 'small' | 'medium' | 'large';
  required?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  hintStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  size = 'medium',
  required = false,
  disabled = false,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  hintStyle,
  value,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef<TextInput>(null);
  
  const focusAnimation = useSharedValue(0);
  const errorAnimation = useSharedValue(0);

  React.useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  React.useEffect(() => {
    focusAnimation.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  React.useEffect(() => {
    errorAnimation.value = withTiming(error ? 1 : 0, { duration: 200 });
  }, [error]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [error ? '#FF3B30' : '#E5E5EA', error ? '#FF3B30' : '#007AFF']
    );

    return {
      borderColor,
      borderWidth: withTiming(isFocused || error ? 2 : 1, { duration: 200 }),
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const shouldFloat = isFocused || hasValue;
    
    return {
      transform: [
        {
          translateY: withTiming(shouldFloat ? -0 : 0, { duration: 200 }),
        },
        {
          scale: withTiming(shouldFloat ? 0.8 : 1, { duration: 200 }),
        },
      ],
      color: interpolateColor(
        focusAnimation.value,
        [0, 1],
        [error ? '#FF3B30' : '#8E8E93', error ? '#FF3B30' : '#007AFF']
      ),
    };
  });

  const errorAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: errorAnimation.value,
      transform: [
        {
          translateY: withTiming(error ? 0 : -10, { duration: 200 }),
        },
      ],
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleRightIconPress = () => {
    if (onRightIconPress) {
      onRightIconPress();
    } else {
      inputRef.current?.focus();
    }
  };

  const getContainerStyle = (): ViewStyle[] => {
    const baseStyles = [styles.container, styles[variant], styles[size]];
    
    if (disabled) {
      baseStyles.push(styles.disabled);
    }
    
    if (error) {
      baseStyles.push(styles.error);
    }
    
    if (style) {
      baseStyles.push(style);
    }
    
    return baseStyles;
  };

  const getInputStyle = (): TextStyle[] => {
    const baseStyles = [styles.input, styles[`${size}Input`]];
    
    if (leftIcon) {
      baseStyles.push(styles.inputWithLeftIcon);
    }
    
    if (rightIcon) {
      baseStyles.push(styles.inputWithRightIcon);
    }
    
    if (disabled) {
      baseStyles.push(styles.disabledInput);
    }
    
    if (inputStyle) {
      baseStyles.push(inputStyle);
    }
    
    return baseStyles;
  };

  const getLabelStyle = (): TextStyle[] => {
    const baseStyles = [styles.label, styles[`${size}Label`]];
    
    if (required) {
      baseStyles.push(styles.requiredLabel);
    }
    
    if (labelStyle) {
      baseStyles.push(labelStyle);
    }
    
    return baseStyles;
  };

  return (
    <View style={styles.wrapper}>
      {label && variant !== 'filled' && (
        <Animated.Text style={[getLabelStyle(), labelAnimatedStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Animated.Text>
      )}
      
      <Animated.View style={[getContainerStyle(), containerAnimatedStyle]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={inputRef}
          style={getInputStyle()}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          placeholder={variant === 'filled' ? textInputProps.placeholder : undefined}
          placeholderTextColor={disabled ? '#C7C7CC' : '#A8A8A8'}
          {...textInputProps}
        />
        
        {variant === 'filled' && label && (
          <Animated.Text style={[styles.floatingLabel, labelAnimatedStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>
        )}
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={handleRightIconPress}
            disabled={disabled}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Animated.Text style={[styles.errorText, errorStyle, errorAnimatedStyle]}>
          {error}
        </Animated.Text>
      )}
      
      {hint && !error && (
        <Text style={[styles.hintText, hintStyle]}>
          {hint}
        </Text>
      )}
    </View>
  );
};

export default Input;