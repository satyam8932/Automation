'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '../config/axios';
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody
} from '@/components/ui/table';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function AssignRoom() {
  const [usersWithRooms, setUsersWithRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  useEffect(() => {
    // Fetch all users with their assigned rooms
    const fetchUsersWithRooms = async () => {
      const response = await axiosInstance.get('/api/admin/users-with-rooms');
      setUsersWithRooms(response.data.users);
    };

    // Fetch available users
    const fetchUsers = async () => {
      const response = await axiosInstance.get('/api/admin/users');
      setUsers(response.data.users);
    };

    // Fetch available rooms
    const fetchRooms = async () => {
      const response = await axiosInstance.get('/api/admin/rooms');
      setRooms(response.data.rooms);
    };

    fetchUsersWithRooms();
    fetchUsers();
    fetchRooms();
  }, []);

  // Function to assign a room to a user
  const assignRoom = async () => {
    try {
      await axiosInstance.post('/api/admin/assign-room', { userId: selectedUser, roomId: selectedRoom });
      alert('User assigned to room successfully!');
      setSelectedUser('');
      setSelectedRoom('');
      refreshUsersWithRooms();  // Refresh the list after assigning
    } catch (error) {
      alert('Error assigning room');
    }
  };

  // Function to deassign a room from a user
  const deassignRoom = async (userId: number, roomId: number) => {
    try {
      await axiosInstance.post('/api/admin/deassign-room', { userId, roomId });
      alert('Room deassigned successfully!');
      refreshUsersWithRooms();  // Refresh the list after deassigning
    } catch (error) {
      alert('Error deassigning room');
    }
  };

  // Function to refresh the users with rooms list after any changes
  const refreshUsersWithRooms = async () => {
    const response = await axiosInstance.get('/api/admin/users-with-rooms');
    setUsersWithRooms(response.data.users);
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">Assign User to Room</h1>

      {/* Card for assigning users to rooms */}
      <Card className="p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Assign User</CardTitle>
          <CardDescription>Select a user and a room to assign them.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Selection */}
          <Select onValueChange={(value: any) => setSelectedUser(value)} value={selectedUser}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Room Selection */}
          <Select onValueChange={(value: any) => setSelectedRoom(value)} value={selectedRoom}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room: any) => (
                <SelectItem key={room.id} value={room.id.toString()}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={assignRoom} className="w-full">Assign Room</Button>
        </CardContent>
      </Card>

      {/* Table displaying users and their assigned rooms */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Users with Assigned Rooms</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Assigned Rooms</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithRooms.length > 0 ? (
              usersWithRooms.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.rooms && user.rooms.length > 0 ? (
                      user.rooms.map((room: any) => room.name).join(', ')
                    ) : (
                      'No rooms assigned'
                    )}
                  </TableCell>
                  <TableCell>
                    {user.rooms && user.rooms.length > 0 && user.rooms.map((room: any) => (
                      <Button
                        key={room.id}
                        onClick={() => deassignRoom(user.id, room.id)}
                        variant="destructive"
                        className="ml-2"
                      >
                        Remove {room.name}
                      </Button>
                    ))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>No users assigned to any rooms.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
