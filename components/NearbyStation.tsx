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

  useEffect(() => {
    getLocationAndStations();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.shieldButton}
        onPress={() => {
          setModalVisible(true);
          getLocationAndStations(); // refresh on open
        }}
      >
        <Ionicons name="shield-checkmark" size={30} color="white" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nearby Police Stations</Text>

            {loading ? (
              <ActivityIndicator size="large" />
            ) : errorMsg ? (
              <Text style={styles.error}>{errorMsg}</Text>
            ) : (
              <FlatList
                data={stations}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <View style={styles.stationItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.address}>{item.vicinity}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dirButton}
                      onPress={() =>
                        openInMaps(item.geometry.location.lat, item.geometry.location.lng)
                      }
                    >
                      <Text style={styles.dirText}>Directions</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
    backgroundColor: '#f2f4f8',
  },
  shieldButton: {
    backgroundColor: '#007bff',
    padding: 18,
    borderRadius: 50,
    elevation: 6,
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#222',
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  dirButton: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'center',
  },
  dirText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  closeBtn: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
});
