import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

const manager = new BleManager();

export function estimateDistance(rssi: number, txPower = -59): number {
  if (rssi === 0) return -1.0;

  const ratio = rssi / txPower;
  if (ratio < 1.0) {
    return parseFloat((Math.pow(ratio, 10)).toFixed(2));
  } else {
    return parseFloat((0.89976 * Math.pow(ratio, 7.7095) + 0.111).toFixed(2));
  }
}

export async function startScan(onDeviceFound: (device: Device, distance: number) => void) {
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

    if (device?.name && device.rssi !== null) {
      const distance = estimateDistance(device.rssi);
      onDeviceFound(device, distance);
    }
  });
}