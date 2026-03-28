import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-primary-500 pt-16 pb-8 px-4">
        <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center">
          <Text className="text-4xl">👤</Text>
        </View>
        <Text className="text-white text-xl font-bold mt-4">旅行者</Text>
        <Text className="text-white/80">traveler@example.com</Text>
      </View>

      <View className="p-4">
        {['我的收藏', '支付方式', '联系客服', '设置'].map((item, index) => (
          <TouchableOpacity
            key={item}
            className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">{['❤️', '💳', '💬', '⚙️'][index]}</Text>
              <Text className="text-base text-gray-800">{item}</Text>
            </View>
            <Text className="text-gray-400">></Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
