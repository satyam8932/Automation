import React, { useEffect } from 'react';
import { View, Text, StyleSheet, NativeModules, NativeEventEmitter } from 'react-native';
import io from 'socket.io-client';

const socket = io('http://your-server-ip:5001');  // Connect to your backend

const RoomDetailsScreen = ({ route } : any) => {
  const { room } = route.params;  // Get room details from route params

  useEffect(() => {
    // Join the room through the socket connection
    socket.emit('joinRoom', room.id);

    // Listen for volume button events
    const volumeButtonListener = new NativeEventEmitter(NativeModules.VolumeButtonHandler);

    const volumeUpListener = volumeButtonListener.addListener('VolumeUp', () => {
      console.log('Volume Up pressed');
      socket.emit('volumeClick', { roomId: room.id, event: 'left_click' });
    });

    const volumeDownListener = volumeButtonListener.addListener('VolumeDown', () => {
      console.log('Volume Down pressed');
      socket.emit('volumeClick', { roomId: room.id, event: 'right_click' });
    });

    return () => {
      volumeUpListener.remove();
      volumeDownListener.remove();
      socket.emit('leaveRoom', room.id);  // Disconnect from room when leaving
    };
  }, [room]);

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
