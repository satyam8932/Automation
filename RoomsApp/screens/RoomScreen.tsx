import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import axiosInstance from '../config/axios';
import { useFocusEffect } from '@react-navigation/native';

const RoomsScreen = ({ navigation, route  }: any) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get the username from the route parameters
  const { username } = route.params;

  // Fetch rooms assigned to the user
  const fetchRooms = async () => {
    try {
      const response = await axiosInstance.get('/api/room/get-user-assigned-room');
      setRooms(response.data.rooms);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRooms();  // Fetch rooms whenever the screen is focused
    }, [])
  );

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms();  // Refresh the room list
  };

  const handleRoomSelect = (room: any) => {
    navigation.navigate('RoomDetails', { room, username });  // Pass room details to the new screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Assigned Rooms</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : rooms.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.roomsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {rooms.map((room: any) => (
            <TouchableOpacity key={room.id} onPress={() => handleRoomSelect(room)} style={styles.roomCard}>
              <Text style={styles.roomName}>{room.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noRoomsText}>No rooms assigned yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  roomsContainer: {
    paddingBottom: 20,
  },
  roomCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 15,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#007bff',
    textAlign: 'center',
  },
  noRoomsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});

export default RoomsScreen;
