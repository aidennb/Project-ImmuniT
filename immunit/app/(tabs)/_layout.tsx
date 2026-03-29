import { Tabs } from 'expo-router';
import { Image, Text } from 'react-native';

export const screenOptions = {
  headerShown: false,
};
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#4B5563',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          fontFamily: 'Inter_500Medium',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color, focused }) => (
            <Image
              source={require('../../assets/images/home.png')}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#0080FF' : '#4B5563', // icon color
              }}
              resizeMode="contain"
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color: focused ? '#111827' : '#4B5563', // label color
                fontSize: 10,
                lineHeight: 20,
                fontWeight: focused ? '400' : '600',
                fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_500Medium',
                marginTop: 4,
              }}
            >
              Home
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ size, color, focused }) => (
            <Image
              source={require('../../assets/images/assistant.png')}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#0080FF' : '#4B5563', // icon color
              }}
              resizeMode="contain"
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color: focused ? '#111827' : '#4B5563', // label color
                fontSize: 10,
                lineHeight: 20,
                fontWeight: focused ? '400' : '600',
                fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_500Medium',
                marginTop: 4,
              }}
            >
              AI Assistant
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ size, color, focused }) => (
            <Image
              source={require('../../assets/images/notifications.png')}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#0080FF' : '#4B5563', // icon color
              }}
              resizeMode="contain"
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color: focused ? '#111827' : '#4B5563', // label color
                fontSize: 10,
                lineHeight: 20,
                fontWeight: focused ? '400' : '600',
                fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_500Medium',
                marginTop: 4,
              }}
            >
              Notifications
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <Image
              source={require("../../assets/images/ic_profile_icon.png")}
              style={{
                width: size,
                height: size,
                overflow: 'hidden',
                borderRadius: size / 2,
              }}
              resizeMode="cover"
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color: focused ? '#111827' : '#4B5563', // label color
                fontSize: 10,
                lineHeight: 20,
                fontWeight: focused ? '400' : '600',
                fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_500Medium',
                marginTop: 4,
              }}
            >
              My Profile
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
