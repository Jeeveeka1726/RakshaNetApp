import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// 🔐 Replace this with your own key — keep it secret in production
const GOOGLE_API_KEY = 'AIzaSyAeN6n8eMSKveBnlZT_oQQcgsFUfVjVfac';

export default function NearbyStationsWithModal() {
  const [location, setLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getLocationAndStations = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchNearbyStations(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      setErrorMsg('Error getting location');
      setLoading(false);
    }
  };

  const fetchNearbyStations = async (lat, lng) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=police&key=${GOOGLE_API_KEY}`;
      const response = await axios.get(url);
      setStations(response.data.results);
    } catch (error) {
      setErrorMsg('Failed to fetch stations');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  useEffect(() => {
    getLocationAndStations();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.policeStationButton}
        onPress={() => {
          setModalVisible(true);
          getLocationAndStations(); // refresh on open
        }}
      >
        <Ionicons name="shield-checkmark" size={24} color="#DC2626" />
        <Text style={styles.policeStationText}>Find Nearby Police Stations</Text>
        <Ionicons name="chevron-forward" size={20} color="#DC2626" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Nearby Police Stations</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#DC2626" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.policeStationsList}>
                <ActivityIndicator size="large" color="#DC2626" />
              </View>
            ) : errorMsg ? (
              <View style={styles.policeStationsList}>
                <Text style={styles.error}>{errorMsg}</Text>
              </View>
            ) : (
              <FlatList
                style={styles.policeStationsList}
                data={stations}
                keyExtractor={(item) => item.place_id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.policeStationItem}>
                    <View style={styles.stationInfo}>
                      <Text style={styles.stationName}>{item.name}</Text>
                      {location && (
                        <Text style={styles.stationDistance}>
                          {calculateDistance(
                            location.latitude,
                            location.longitude,
                            item.geometry.location.lat,
                            item.geometry.location.lng
                          )} km away
                        </Text>
                      )}
                      <Text style={styles.stationAddress}>{item.vicinity}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.directionButton}
                      onPress={() =>
                        openInMaps(item.geometry.location.lat, item.geometry.location.lng)
                      }
                    >
                      <Ionicons name="navigate" size={16} color="#fff" />
                      <Text style={styles.directionButtonText}>Directions</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f4f8',
  },
  policeStationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  policeStationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingTop: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
  },
  policeStationsList: {
    padding: 20,
  },
  policeStationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    marginBottom: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stationDistance: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 12,
    color: "#666",
  },
  directionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  directionButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
});