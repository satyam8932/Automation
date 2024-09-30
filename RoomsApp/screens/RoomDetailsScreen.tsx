import React, { useEffect } from 'react';
import { DeviceEventEmitter, View, Text, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import { baseURL } from '../config/baseURL';

const socket = io(baseURL); // Replace with actual backend URL

const RoomDetailsScreen = ({ route }: any) => {
  const { room } = route.params;

  useEffect(() => {
    // Join the room via socket
    socket.emit('joinRoom', room.id);

    // Listen for native volume button events
    const volumeUpListener = DeviceEventEmitter.addListener('volume_up', () => {
      console.log('Volume Up detected');
      socket.emit('volumeClick', { roomId: room.id, event: 'volume_up' });
    });

    const volumeDownListener = DeviceEventEmitter.addListener('volume_down', () => {
      console.log('Volume Down detected');
      socket.emit('volumeClick', { roomId: room.id, event: 'volume_down' });
    });

    return () => {
      // Remove listeners on unmount
      volumeUpListener.remove();
      volumeDownListener.remove();
      socket.emit('leaveRoom', room.id); // Leave room on unmount
    };
  }, [room.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room: {room.name}</Text>
      <Text style={styles.infoText}>Volume Up for Left Click</Text>
      <Text style={styles.infoText}>Volume Down for Right Click</Text>
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
