import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RoomsScreen from '../screens/RoomScreen';
import RoomDetailsScreen from '../screens/RoomDetailsScreen'; 

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Rooms" component={RoomsScreen} />
        <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthNavigator;
