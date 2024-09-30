package com.roomsapp

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

// Custom Code for native side volume button detection

import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.os.Bundle
import android.view.KeyEvent
import android.widget.Toast

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "RoomsApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
    * Called when the activity is created. We override this method to initialize our custom code for native side volume button detection.
    * In this case, we send a custom event to React Native when the volume buttons are pressed.
    */
  override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(savedInstanceState)
    }

  // Handle key events such as volume buttons
  override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
    when (keyCode) {
        KeyEvent.KEYCODE_VOLUME_DOWN -> {
            sendEventToReactNative("volume_down")
            Toast.makeText(applicationContext, "Volume Down Key Pressed", Toast.LENGTH_SHORT).show()
        }
        KeyEvent.KEYCODE_VOLUME_UP -> {
            sendEventToReactNative("volume_up")
            Toast.makeText(applicationContext, "Volume Up Key Pressed", Toast.LENGTH_SHORT).show()
        }
    }
    return super.onKeyDown(keyCode, event)
  }

  // Send the event to React Native
  private fun sendEventToReactNative(eventName: String) {
      val reactContext: ReactContext? = getReactInstanceManager().currentReactContext
      reactContext?.let {
          it.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit(eventName, null)
      }
  } 
}
