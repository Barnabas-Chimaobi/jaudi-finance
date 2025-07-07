# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native Biometrics
-keep class com.rnbiometrics.** { *; }
-keep class androidx.biometric.** { *; }
-keep class android.hardware.biometrics.** { *; }
-keep class android.hardware.fingerprint.** { *; }

# React Native Keychain
-keep class com.oblador.keychain.** { *; }
-keep class androidx.security.crypto.** { *; }

# React Native Core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep React Native Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Keep WatermelonDB
-keep class com.nozbe.watermelondb.** { *; }

# Keep AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep classes with @ReactModule annotation
-keep @com.facebook.react.bridge.ReactModule class * { *; }

# Keep classes with @ReactMethod annotation
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Biometric specific rules
-keep class androidx.biometric.BiometricPrompt { *; }
-keep class androidx.biometric.BiometricPrompt$PromptInfo { *; }
-keep class androidx.biometric.BiometricPrompt$AuthenticationCallback { *; }
-keep class androidx.biometric.BiometricPrompt$AuthenticationResult { *; }
-keep class androidx.biometric.BiometricPrompt$CryptoObject { *; }
