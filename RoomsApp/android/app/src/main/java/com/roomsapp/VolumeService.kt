package com.roomsapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.media.VolumeProviderCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import android.widget.Toast
import android.content.Context

class VolumeService : Service() {
    private lateinit var mediaSession: MediaSessionCompat
    private lateinit var wakeLock: PowerManager.WakeLock
    private lateinit var localBroadcastManager: LocalBroadcastManager

    companion object {
        const val ACTION_VOLUME_EVENT = "com.roomsapp.VOLUME_EVENT"
        const val EXTRA_VOLUME_EVENT = "volume_event"
    }

    override fun onCreate() {
        super.onCreate()
        initializeService()
    }

    private fun initializeService() {
        localBroadcastManager = LocalBroadcastManager.getInstance(this)

        // Initialize MediaSessionCompat
        mediaSession = MediaSessionCompat(this, "VolumeService")
        mediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS)

        // Set up the initial playback state (simulating playback)
        mediaSession.setPlaybackState(
            PlaybackStateCompat.Builder()
                .setState(PlaybackStateCompat.STATE_PLAYING, 0, 0f)
                .build()
        )

        // Create a VolumeProviderCompat to listen for volume button presses
        val volumeProvider = object : VolumeProviderCompat(VolumeProviderCompat.VOLUME_CONTROL_RELATIVE, 100, 50) {
            override fun onAdjustVolume(direction: Int) {
                when (direction) {
                    -1 -> {
                        Log.d("VolumeService", "Volume Down Pressed")
                        sendVolumeEvent("volume_down")
                        showToast("Volume Down Pressed")
                    }
                    1 -> {
                        Log.d("VolumeService", "Volume Up Pressed")
                        sendVolumeEvent("volume_up")
                        showToast("Volume Up Pressed")
                    }
                    else -> Log.d("VolumeService", "Volume button released")
                }
            }
        }

        mediaSession.setPlaybackToRemote(volumeProvider)
        mediaSession.isActive = true

        // Keep the service alive with a wake lock
        val powerManager = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "VolumeService::WakeLock")
        wakeLock.acquire()

        // Start the service as a foreground service
        startForegroundService()
    }

    private fun sendVolumeEvent(eventName: String) {
        val intent = Intent(ACTION_VOLUME_EVENT).apply {
            putExtra(EXTRA_VOLUME_EVENT, eventName)
        }
        localBroadcastManager.sendBroadcast(intent)
        Log.d("VolumeService", "Broadcasting volume event: $eventName")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        initializeService()
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        if (mediaSession.isActive) {
            mediaSession.release()
        }
        if (wakeLock.isHeld) {
            wakeLock.release()
        }
    }

    private fun startForegroundService() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelId = "VolumeServiceChannel"
            val channel = NotificationChannel(channelId, "Volume Button Service", NotificationManager.IMPORTANCE_LOW)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)

            val notification = NotificationCompat.Builder(this, channelId)
                .setContentTitle("Volume Button Listener")
                .setContentText("Listening for volume button events")
                .setSmallIcon(R.drawable.ic_notification)
                .build()

            startForeground(1, notification)
        }
    }

    // Function to show a Toast message
    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}