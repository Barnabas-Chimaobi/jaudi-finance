import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

interface CameraOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowsEditing?: boolean;
  mediaType?: MediaType;
}

interface CapturedImage {
  uri: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  type: string;
}

class CameraService {
  private defaultOptions: CameraOptions = {
    quality: 0.8, // Optimized for low bandwidth
    maxWidth: 1024,
    maxHeight: 1024,
    allowsEditing: true,
    mediaType: 'photo',
  };

  /**
   * Request camera permissions
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Jaudi Finance needs access to your camera to capture KYC documents.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Camera permission request failed:', error);
      return false;
    }
  }

  /**
   * Request photo library permissions
   */
  async requestPhotoLibraryPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const permission = Platform.Version >= 33 
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
          
        const granted = await PermissionsAndroid.request(permission, {
          title: 'Photo Library Permission',
          message: 'Jaudi Finance needs access to your photo library to select KYC documents.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Photo library permission request failed:', error);
      return false;
    }
  }

  /**
   * Capture image using camera
   */
  async captureImage(options: CameraOptions = {}): Promise<CapturedImage | null> {
    try {
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Camera access is required to capture KYC documents. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const mergedOptions = { ...this.defaultOptions, ...options };
      
      return new Promise((resolve) => {
        launchCamera(
          {
            mediaType: mergedOptions.mediaType!,
            quality: mergedOptions.quality!,
            maxWidth: mergedOptions.maxWidth!,
            maxHeight: mergedOptions.maxHeight!,
            includeBase64: false, // Avoid base64 for performance
            saveToPhotos: false,
          },
          (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorMessage) {
              resolve(null);
              return;
            }

            const asset = response.assets?.[0];
            if (asset && asset.uri) {
              resolve({
                uri: asset.uri,
                fileName: asset.fileName || `capture_${Date.now()}.jpg`,
                fileSize: asset.fileSize || 0,
                width: asset.width || 0,
                height: asset.height || 0,
                type: asset.type || 'image/jpeg',
              });
            } else {
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.error('Image capture failed:', error);
      return null;
    }
  }

  /**
   * Select image from photo library
   */
  async selectFromLibrary(options: CameraOptions = {}): Promise<CapturedImage | null> {
    try {
      const hasPermission = await this.requestPhotoLibraryPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Photo library access is required to select KYC documents. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const mergedOptions = { ...this.defaultOptions, ...options };
      
      return new Promise((resolve) => {
        launchImageLibrary(
          {
            mediaType: mergedOptions.mediaType!,
            quality: mergedOptions.quality!,
            maxWidth: mergedOptions.maxWidth!,
            maxHeight: mergedOptions.maxHeight!,
            includeBase64: false,
            selectionLimit: 1,
          },
          (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorMessage) {
              resolve(null);
              return;
            }

            const asset = response.assets?.[0];
            if (asset && asset.uri) {
              resolve({
                uri: asset.uri,
                fileName: asset.fileName || `selected_${Date.now()}.jpg`,
                fileSize: asset.fileSize || 0,
                width: asset.width || 0,
                height: asset.height || 0,
                type: asset.type || 'image/jpeg',
              });
            } else {
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.error('Image selection failed:', error);
      return null;
    }
  }

  /**
   * Show image picker options
   */
  async showImagePicker(options: CameraOptions = {}): Promise<CapturedImage | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image',
        'Choose how you want to add your document',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const image = await this.captureImage(options);
              resolve(image);
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const image = await this.selectFromLibrary(options);
              resolve(image);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true }
      );
    });
  }

  /**
   * Validate image for KYC requirements
   */
  validateKYCImage(image: CapturedImage): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check file size (max 5MB for low bandwidth)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.fileSize > maxSize) {
      errors.push('Image size must be less than 5MB');
    }
    
    // Check minimum dimensions
    const minWidth = 300;
    const minHeight = 300;
    if (image.width < minWidth || image.height < minHeight) {
      errors.push(`Image must be at least ${minWidth}x${minHeight} pixels`);
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(image.type.toLowerCase())) {
      errors.push('Only JPEG and PNG images are allowed');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Compress image for low bandwidth
   */
  async compressImage(image: CapturedImage, targetSizeKB = 500): Promise<CapturedImage> {
    // This is a simplified compression - in a real app, you'd use a library like react-native-image-resizer
    try {
      const targetBytes = targetSizeKB * 1024;
      
      if (image.fileSize <= targetBytes) {
        return image; // Already small enough
      }
      
      // Calculate compression ratio
      const ratio = Math.sqrt(targetBytes / image.fileSize);
      const newWidth = Math.floor(image.width * ratio);
      const newHeight = Math.floor(image.height * ratio);
      
      // In a real implementation, you would use react-native-image-resizer here
      console.log(`Would compress image from ${image.width}x${image.height} to ${newWidth}x${newHeight}`);
      
      return {
        ...image,
        width: newWidth,
        height: newHeight,
        fileSize: targetBytes,
      };
    } catch (error) {
      console.error('Image compression failed:', error);
      return image; // Return original if compression fails
    }
  }

  /**
   * Get optimized camera options for KYC
   */
  getKYCCameraOptions(): CameraOptions {
    return {
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      allowsEditing: true,
      mediaType: 'photo',
    };
  }

  /**
   * Get high quality camera options for important documents
   */
  getHighQualityCameraOptions(): CameraOptions {
    return {
      quality: 0.9,
      maxWidth: 2048,
      maxHeight: 2048,
      allowsEditing: true,
      mediaType: 'photo',
    };
  }

  /**
   * Get low bandwidth camera options
   */
  getLowBandwidthCameraOptions(): CameraOptions {
    return {
      quality: 0.6,
      maxWidth: 800,
      maxHeight: 800,
      allowsEditing: true,
      mediaType: 'photo',
    };
  }

  /**
   * Check if camera is available
   */
  async isCameraAvailable(): Promise<boolean> {
    try {
      // This would check if the device has a camera
      // For now, assume it's available on mobile devices
      return Platform.OS === 'ios' || Platform.OS === 'android';
    } catch (error) {
      console.error('Camera availability check failed:', error);
      return false;
    }
  }
}

export const cameraService = new CameraService();