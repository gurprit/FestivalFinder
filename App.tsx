import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import { startScan } from './bluetooth/BluetoothManager';
import { Device } from 'react-native-ble-plx';

export default function App() {
  const [devices, setDevices] = useState<{
    [id: string]: { name: string; id: string; lastSeen: number };
  }>({});

  const handleDeviceFound = (device: Device) => {
    if (!device.id) return;

    setDevices((prev) => ({
      ...prev,
      [device.id]: {
        id: device.id,
        name: device.name || 'Unnamed Device',
        lastSeen: Date.now(),
      },
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Friends</Text>
      <Button title="Start Scanning" onPress={() => startScan(handleDeviceFound)} />
      <FlatList
        data={Object.values(devices)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const minutesAgo = Math.floor((Date.now() - item.lastSeen) / 60000);
          const timeText = minutesAgo === 0 ? 'just now' : `${minutesAgo} min ago`;

          return (
            <Text style={styles.deviceItem}>
              {item.name} ({item.id}) — last seen {timeText}
            </Text>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  title: { fontSize: 24, marginBottom: 10 },
  deviceItem: { marginVertical: 5, fontSize: 16 },
});
