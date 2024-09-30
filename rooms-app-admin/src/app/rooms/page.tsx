'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '../config/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { TrashIcon } from 'lucide-react';
import Link from 'next/link';

export default function RoomManagement() {
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/rooms');
        setRooms(response.data.rooms);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  const createRoom = async () => {
    try {
      await axiosInstance.post('/api/admin/create-room', { name: newRoomName, password });
      setNewRoomName('');
      setPassword('');
      alert('Room created successfully');
      // Re-fetch rooms after creation
      const response = await axiosInstance.get('/api/admin/rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      alert('Error creating room');
    }
  };

  const deleteRoom = async (roomId: number) => {
    try {
      await axiosInstance.delete('/api/admin/delete-room', { data: { roomId } });
      setRooms(rooms.filter((room) => room.id !== roomId));
    } catch (error) {
      alert('Error deleting room');
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Room Management</h1>
      <div className='flex space-x-2'>
        <Link href="/rooms">
          <Button>Rooms</Button>
        </Link>
        <Link href="/assign">
          <Button>Assign</Button>
        </Link>
      </div>
      {/* Create Room Section */}
      <Card className="p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Create a New Room</CardTitle>
          <CardDescription>Fill out the details below to create a new room.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Room Name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="mb-2"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button onClick={createRoom} className="w-full">Create Room</Button>
        </CardContent>
      </Card>

      {/* List of Existing Rooms */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Existing Rooms</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Room Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => deleteRoom(room.id)}
                      className="flex items-center space-x-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span>Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No rooms available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
