import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock data with better quality
const FEATURED_PROPERTIES = [
  {
    id: '1',
    name: '海景豪华公寓',
    location: '三亚·亚龙湾',
    price: 899,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    rating: 4.9,
    reviews: 128,
    type: '整套公寓',
    guests: 4,
  },
  {
    id: '2',
    name: '古城庭院民宿',
    location: '丽江·古城区',
    price: 368,
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
    rating: 4.8,
    reviews: 96,
    type: '独立房间',
    guests: 2,
  },
  {
    id: '3',
    name: '山景度假别墅',
    location: '杭州·西湖区',
    price: 1280,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    rating: 4.9,
    reviews: 64,
    type: '整套别墅',
    guests: 8,
  },
];

const CATEGORIES = [
  { name: '民宿', icon: '🏠' },
  { name: '酒店', icon: '🏨' },
  { name: '公寓', icon: '🏢' },
  { name: '别墅', icon: '🏡' },
  { name: '露营', icon: '⛺' },
  { name: '树屋', icon: '🌳' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeCategory, setActiveCategory] = useState('民宿');

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      {/* Header with gradient */}
      <View className="bg-primary-600 pt-16 pb-8 px-5">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white/70 text-sm font-medium mb-1">欢迎回来</Text>
            <Text className="text-white text-3xl font-bold">发现理想住宿</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
            <Text className="text-xl">🔔</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View className="bg-white rounded-2xl flex-row items-center px-4 py-3.5 shadow-lg">
          <Text className="text-xl mr-3">🔍</Text>
          <TextInput
            className="flex-1 text-base text-neutral-800"
            placeholder="你想去哪里？"
            placeholderTextColor="#a3a3a3"
          />
          <View className="bg-primary-100 rounded-xl px-3 py-1.5">
            <Text className="text-primary-700 font-medium text-sm">搜索</Text>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View className="py-6 bg-white">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity 
              key={category.name}
              className={`items-center mr-6 ${activeCategory === category.name ? 'opacity-100' : 'opacity-60'}`}
              onPress={() => setActiveCategory(category.name)}
            >
              <View className={`w-16 h-16 rounded-2xl items-center justify-center mb-2 ${
                activeCategory === category.name 
                  ? 'bg-primary-500' 
                  : 'bg-neutral-100'
              }`}>
                <Text className="text-2xl">{category.icon}</Text>
              </View>
              <Text className={`text-sm font-medium ${
                activeCategory === category.name 
                  ? 'text-primary-600' 
                  : 'text-neutral-600'
              }`}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Section */}
      <View className="p-5">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xl font-bold text-neutral-800">精选推荐</Text>
          <TouchableOpacity>
            <Text className="text-primary-600 font-medium">查看全部 →</Text>
          </TouchableOpacity>
        </View>
        
        {FEATURED_PROPERTIES.map((property, index) => (
          <TouchableOpacity
            key={property.id}
            className="bg-white rounded-3xl mb-5 overflow-hidden shadow-sm"
            style={{ 
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            }}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id })}
            activeOpacity={0.95}
          >
            <Image 
              source={{ uri: property.image }} 
              className="w-full h-52" 
              resizeMode="cover"
            />
            
            <View className="p-5">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                  <Text className="text-lg font-bold text-neutral-800 mb-1">{property.name}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-neutral-500">📍 {property.location}</Text>
                  </View>
                </View>
                <View className="bg-primary-50 rounded-xl px-3 py-1.5 flex-row items-center">
                  <Text className="text-yellow-500 text-sm">⭐</Text>
                  <Text className="text-sm font-bold text-neutral-800 ml-1">{property.rating}</Text>
                  <Text className="text-xs text-neutral-400 ml-1">({property.reviews})</Text>
                </View>
              </View>

              <View className="flex-row items-center mb-4">
                <View className="bg-neutral-100 rounded-lg px-2.5 py-1 mr-2">
                  <Text className="text-xs text-neutral-600">{property.type}</Text>
                </View>
                <View className="bg-neutral-100 rounded-lg px-2.5 py-1">
                  <Text className="text-xs text-neutral-600">👤 {property.guests}人</Text>
                </View>
              </View>
              
              <View className="flex-row items-end justify-between pt-3 border-t border-neutral-100">
                <View className="flex-row items-baseline">
                  <Text className="text-2xl font-bold text-primary-600">¥{property.price}</Text>
                  <Text className="text-neutral-400 text-sm ml-1">/晚</Text>
                </View>
                
                <TouchableOpacity className="bg-primary-600 rounded-xl px-5 py-2.5">
                  <Text className="text-white font-semibold">预订</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
