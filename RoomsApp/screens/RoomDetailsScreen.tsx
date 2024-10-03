import React, { useEffect } from 'react';
import { DeviceEventEmitter, View, Text, StyleSheet, Alert, NativeModules } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';
import { baseURL } from '../config/baseURL';

const socket = io(baseURL);
const { VolumeServiceModule } = NativeModules;

const RoomDetailsScreen = ({ route }: any) => {
  const { room, username } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    // Start the VolumeService
    VolumeServiceModule.startService();

    // Send login event with deviceType 'android' and the username
    socket.emit('login', { username, deviceType: 'android' });

    // Listen for loginError event
    socket.on('loginError', (data) => {
      // Handle login error
      Alert.alert('Login Error', data.message, [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to the previous screen on error
            navigation.goBack();
          },
        },
      ]);
    });

    // Join the room
    socket.emit('joinRoom', room.id);

    // Listen for volume button events
    const volumeUpListener = DeviceEventEmitter.addListener('volume_up', () => {
      console.log('Volume Up Click');
      socket.emit('volumeClick', { roomId: room.id, event: 'volume_up' });
    });

    const volumeDownListener = DeviceEventEmitter.addListener('volume_down', () => {
      console.log('Volume Down Click');
      socket.emit('volumeClick', { roomId: room.id, event: 'volume_down' });
    });

    return () => {
      // Clean up listeners and leave the room
      volumeUpListener.remove();
      volumeDownListener.remove();
      socket.off('loginError');
      socket.emit('leaveRoom', room.id);
      socket.disconnect();

      // Stop the VolumeService
      VolumeServiceModule.stopService();
    };
  }, [room.id, username, navigation]);

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
