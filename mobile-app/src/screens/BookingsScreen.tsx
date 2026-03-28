import React from 'react';
import { View, Text } from 'react-native';

export default function BookingsScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <Text className="text-4xl mb-4">📅</Text>
      <Text className="text-xl font-semibold text-gray-800">订单</Text>
      <Text className="text-gray-500 mt-2">查看您的预订</Text>
    </View>
  );
}
