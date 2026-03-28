import React from 'react';
import { View, Text } from 'react-native';

export default function ExploreScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <Text className="text-4xl mb-4">🗺️</Text>
      <Text className="text-xl font-semibold text-gray-800">探索</Text>
      <Text className="text-gray-500 mt-2">发现更多精彩房源</Text>
    </View>
  );
}
