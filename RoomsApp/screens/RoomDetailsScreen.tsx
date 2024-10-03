import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, View, Text, StyleSheet, Alert, NativeModules } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';
import { baseURL } from '../config/baseURL';

const { VolumeServiceModule } = NativeModules;

const RoomDetailsScreen = ({ route }: any) => {
  const { room, username } = route.params;
  const [connectedStatus, setConnectedStatus] = useState('Not Connected');
  const navigation = useNavigation();
  let socket: any;

  const initializeSocketConnection = () => {
    // Initialize the socket inside a function to rebuild it when necessary
    socket = io(baseURL, {
      reconnection: false, // Disable automatic reconnection to handle reconnect manually
    });

    // Socket connected handler
    socket.on('connect', () => {
      setConnectedStatus('Connected');
      socket.emit('login', { username, deviceType: 'android' });
    });

    // Handle login errors (e.g., user already logged in elsewhere)
    socket.on('loginError', (data: any) => {
      Alert.alert('Login Error', data.message, [
        {
          text: 'OK',
          onPress: () => {
            // Clean up the socket when user gets kicked out
            handleUserKickedOut();
          },
        },
      ]);
    });

    // Join the room after connecting
    socket.emit('joinRoom', room.id);

    // Add volume button listeners
    const volumeUpListener = DeviceEventEmitter.addListener('volume_up', () => {
      console.log('Volume Up Click');
      socket.emit('volumeClick', { roomId: room.id, event: 'volume_up' });
    });

    const volumeDownListener = DeviceEventEmitter.addListener('volume_down', () => {
      console.log('Volume Down Click');
      socket.emit('volumeClick', { roomId: room.id, event: 'volume_down' });
    });

    // Cleanup function for volume listeners and socket when component unmounts
    return () => {
      volumeUpListener.remove();
      volumeDownListener.remove();
      socket.emit('leaveRoom', room.id); // Leave room on unmount
      socket.disconnect();
      socket.off(); // Clear all event listeners from the socket
    };
  };

  const handleUserKickedOut = () => {
    if (socket) {
      // Disconnect socket to ensure clean reconnection on re-entry
      socket.emit('leaveRoom', room.id); // Ensure user leaves the room properly
      socket.disconnect();
      socket.off(); // Clear all event listeners
    }

    // Navigate back to the previous screen
    navigation.goBack();
  };

  useEffect(() => {
    // Start the VolumeService and initialize socket connection
    if (VolumeServiceModule && VolumeServiceModule.startService) {
      VolumeServiceModule.startService();
    } else {
      console.warn('VolumeServiceModule is not available.');
    }

    // Initialize socket connection
    initializeSocketConnection();

    return () => {
      // Clean up everything on component unmount
      if (socket) {
        socket.emit('leaveRoom', room.id);
        socket.disconnect();
        socket.off();
      }

      // Stop the VolumeService if it was started
      if (VolumeServiceModule && VolumeServiceModule.stopService) {
        VolumeServiceModule.stopService();
      }
    };
  }, [room.id, username, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room: {room.name}</Text>
      <Text style={styles.title}>{connectedStatus}</Text>
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
