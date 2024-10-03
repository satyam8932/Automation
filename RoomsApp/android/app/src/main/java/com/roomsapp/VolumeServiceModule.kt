package com.roomsapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class VolumeServiceModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val volumeReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val eventName = intent.getStringExtra(VolumeService.EXTRA_VOLUME_EVENT)
            eventName?.let {
                sendEventToReactNative(it)
            }
        }
    }

    override fun getName(): String {
        return "VolumeServiceModule"
    }

    @ReactMethod
    fun startService() {
        val intent = Intent(reactContext, VolumeService::class.java)
        reactContext.startService(intent)
        LocalBroadcastManager.getInstance(reactContext).registerReceiver(
            volumeReceiver,
            IntentFilter(VolumeService.ACTION_VOLUME_EVENT)
        )
    }

    @ReactMethod
    fun stopService() {
        val intent = Intent(reactContext, VolumeService::class.java)
        reactContext.stopService(intent)
        LocalBroadcastManager.getInstance(reactContext).unregisterReceiver(volumeReceiver)
    }

    private fun sendEventToReactNative(eventName: String) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, null)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        LocalBroadcastManager.getInstance(reactContext).unregisterReceiver(volumeReceiver)
    }
}