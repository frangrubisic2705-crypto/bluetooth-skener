import { useEffect, useState } from "react";
import {
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

const manager = new BleManager();

export default function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);

  async function requestPermissions() {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  }

  function startScan() {
    setDevices([]);
    setScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        setScanning(false);
        return;
      }
      if (device) {
        setDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  }

  useEffect(() => {
    requestPermissions();
    return () => {
      manager.destroy();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uređaji u blizini</Text>
      <Text style={styles.count}>
        {devices.length} {devices.length === 1 ? "uređaj" : "uređaja"}
      </Text>

      <TouchableOpacity
        style={[styles.button, scanning && styles.buttonScanning]}
        onPress={startScan}
        disabled={scanning}
      >
        <Text style={styles.buttonText}>
          {scanning ? "Skeniranje... (10s)" : "Pokreni skeniranje"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.deviceCard}>
            <Text style={styles.deviceName}>
              {item.name ?? "Nepoznat uređaj"}
            </Text>
            <Text style={styles.deviceId}>{item.id}</Text>
            <Text style={styles.deviceRssi}>
              Signal: {item.rssi ?? "?"} dBm
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {scanning ? "Tražim uređaje..." : "Pritisni gumb za početak"}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f5",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#18181b",
    marginBottom: 4,
  },
  count: {
    fontSize: 16,
    color: "#71717a",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#18181b",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonScanning: {
    backgroundColor: "#52525b",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    gap: 12,
  },
  deviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#18181b",
  },
  deviceId: {
    fontSize: 12,
    color: "#a1a1aa",
    marginTop: 2,
  },
  deviceRssi: {
    fontSize: 13,
    color: "#71717a",
    marginTop: 4,
  },
  empty: {
    textAlign: "center",
    color: "#a1a1aa",
    marginTop: 40,
    fontSize: 15,
  },
});
