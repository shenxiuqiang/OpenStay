import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';

export type RootStackParamList = {
  Main: undefined;
  PropertyDetail: { propertyId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Bookings: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3182ce',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: '探索' }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: '订单' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '我的' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{ title: '房源详情' }} />
    </Stack.Navigator>
  );
}
