import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startScan } from './bluetooth/BluetoothManager';
import { Device } from 'react-native-ble-plx';

interface DeviceInfo {
  id: string;
  name: string;
  lastSeen: number;
  rssi: number;
  distance: number;
}

export default function App() {
  const [nickname, setNickname] = useState('');
  const [devices, setDevices] = useState<{ [id: string]: DeviceInfo }>({});
  const [input, setInput] = useState('');

  useEffect(() => {
    const loadNickname = async () => {
      const saved = await AsyncStorage.getItem('nickname');
      if (saved) {
        setNickname(saved);
        setInput(saved);
      }
    };
    loadNickname();
  }, []);

  const saveNickname = async () => {
    await AsyncStorage.setItem('nickname', input);
    setNickname(input);
  };

  const handleDeviceFound = (device: Device, distance: number) => {
    if (!device.id) return;
    setDevices((prev) => ({
      ...prev,
      [device.id]: {
        id: device.id,
        name: device.name || 'Unnamed Device',
        lastSeen: Date.now(),
        rssi: device.rssi ?? 0,
        distance,
      },
    }));
  };

  const sortedDevices = Object.values(devices)
    .filter((d) => d.name)
    .sort((a, b) => b.rssi - a.rssi);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Festival Finder</Text>

      <Text style={styles.label}>Your nickname:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter nickname"
        value={input}
        onChangeText={setInput}
      />
      <Button title="Save Nickname" onPress={saveNickname} />

      {nickname ? <Text style={styles.nickname}>👋 Hello, {nickname}!</Text> : null}

      <Button title="Start Scanning" onPress={() => startScan(handleDeviceFound)} />

      <FlatList
        data={sortedDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const minutesAgo = Math.floor((Date.now() - item.lastSeen) / 60000);
          const timeText = minutesAgo === 0 ? 'just now' : `${minutesAgo} min ago`;
          return (
            <Text style={styles.deviceItem}>
              {item.name} ({item.id}) — RSSI {item.rssi} dBm, est. {item.distance} m, last seen {timeText}
            </Text>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  label: { marginTop: 20, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
  },
  nickname: { marginBottom: 20, fontSize: 18, fontWeight: '500' },
  deviceItem: { marginVertical: 5, fontSize: 16 },
});