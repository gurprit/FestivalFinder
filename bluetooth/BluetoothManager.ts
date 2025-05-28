import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

const manager = new BleManager();

export async function startScan(onDeviceFound: (device: Device) => void) {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
  }

  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.error('Scan error:', error);
      return;
    }

    if (device?.name) {
      onDeviceFound(device);
    }
  });
}
