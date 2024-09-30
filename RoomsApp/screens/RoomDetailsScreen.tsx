import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import { VolumeManager } from 'react-native-volume-manager';
import { baseURL } from '../config/baseURL';

// Setup socket connection globally outside the component
const socket = io(baseURL); // Replace with actual backend URL

const RoomDetailsScreen = ({ route }: any) => {
  const { room } = route.params; // Get room details from route params
  const prevVolumeRef = useRef<number | null>(null); // Store previous volume level for comparison

  useEffect(() => {
    // Ensure the room is joined once
    socket.emit('joinRoom', room.id);

    const initializeVolume = async () => {
      try {
        const { volume } = await VolumeManager.getVolume(); // Get initial volume
        prevVolumeRef.current = volume; // Store initial volume
      } catch (error) {
        console.error("Error getting volume:", error);
      }
    };

    // Initialize the volume level
    initializeVolume();

    // Setup the volume listener to detect volume changes
    const volumeListener = VolumeManager.addVolumeListener((volumeResult) => {
      const { volume } = volumeResult;

      // If previous volume exists and differs from the current one
      if (prevVolumeRef.current !== null && volume !== prevVolumeRef.current) {
        if (volume > prevVolumeRef.current) {
          console.log('Volume Up detected');
          socket.emit('volumeClick', { roomId: room.id, event: 'volume_up' });
        } else {
          console.log('Volume Down detected');
          socket.emit('volumeClick', { roomId: room.id, event: 'volume_down' });
        }
        prevVolumeRef.current = volume; // Update the previous volume reference
      }
    });

    // Cleanup function to remove listeners and leave the room
    return () => {
      volumeListener.remove(); // Remove volume listener
      socket.emit('leaveRoom', room.id); // Leave the socket room
    };
  }, [room.id]); // Only re-run when the room changes

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room: {room.name}</Text>
      <Text style={styles.infoText}>Press Volume Up for Left Click</Text>
      <Text style={styles.infoText}>Press Volume Down for Right Click</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
});

export default RoomDetailsScreen;
