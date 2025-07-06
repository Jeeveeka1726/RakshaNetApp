import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';

class FirebaseService {
  static FirebaseFirestore? _firestore;
  static Timer? _locationTimer;
  static bool _isTracking = false;

  // Initialize Firebase
  static Future<void> initialize() async {
    try {
      await Firebase.initializeApp(
        options: const FirebaseOptions(
          apiKey: "AIzaSyBCdfdZrq2XI7OpoLvB0sTqKgY2ifHrgF8",
          authDomain: "rakshanet--live--location.firebaseapp.com",
          projectId: "rakshanet--live--location",
          storageBucket: "rakshanet--live--location.firebasestorage.app",
          messagingSenderId: "910921426775",
          appId: "1:910921426775:web:9a1777219def3794d08012",
          // androidAppId: "1:910921426775:android:9a1777219def3794d08012",
          // iosAppId: "1:910921426775:ios:9a1777219def3794d08012",
        ),
      );
      _firestore = FirebaseFirestore.instance;
      print('✅ Firebase initialized successfully');
    } catch (e) {
      print('❌ Firebase initialization failed: $e');
    }
  }

  // Store SOS event in Firebase
  static Future<bool> storeSosEvent({
    required String userId,
    required String userName,
    required String type,
    required double? latitude,
    required double? longitude,
    required String? address,
    required List<Map<String, dynamic>> contactsData,
  }) async {
    try {
      if (_firestore == null) {
        print('❌ Firebase not initialized');
        return false;
      }

      final sosData = {
        'type': type.toUpperCase(),
        'address': address ?? 'Address not available',
        'lat': latitude,
        'lng': longitude,
        'timestamp': DateTime.now().toIso8601String(),
        'contacts': contactsData,
        'userId': userId,
        'userName': userName,
        'status': 'active',
      };

      await _firestore!.collection('sosEvents').add(sosData);
      print('✅ SOS event stored in Firebase');
      return true;
    } catch (e) {
      print('❌ Failed to store SOS event in Firebase: $e');
      return false;
    }
  }

  // Start live location tracking
  static Future<void> startLiveLocationTracking(String userId) async {
    if (_isTracking) {
      print('📍 Location tracking already active');
      return;
    }

    try {
      // Check location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          print('❌ Location permissions denied');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        print('❌ Location permissions permanently denied');
        return;
      }

      _isTracking = true;
      print('📍 Starting live location tracking for user: $userId');

      // Update location every 30 seconds
      _locationTimer = Timer.periodic(const Duration(seconds: 30), (timer) async {
        await _updateLiveLocation(userId);
      });

      // Send initial location immediately
      await _updateLiveLocation(userId);
    } catch (e) {
      print('❌ Failed to start location tracking: $e');
      _isTracking = false;
    }
  }

  // Stop live location tracking
  static void stopLiveLocationTracking() {
    if (_locationTimer != null) {
      _locationTimer!.cancel();
      _locationTimer = null;
    }
    _isTracking = false;
    print('📍 Live location tracking stopped');
  }

  // Update live location in Firebase
  static Future<void> _updateLiveLocation(String userId) async {
    try {
      if (_firestore == null) return;

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final locationData = {
        'userId': userId,
        'lat': position.latitude,
        'lng': position.longitude,
        'timestamp': DateTime.now().toIso8601String(),
        'accuracy': position.accuracy,
      };

      await _firestore!.collection('liveLocations').add(locationData);
      print('📍 Live location updated: ${position.latitude}, ${position.longitude}');
    } catch (e) {
      print('❌ Failed to update live location: $e');
    }
  }

  // Store SOS event with live location and send to backend
  static Future<bool> storeSosEventWithLocation({
    required String userId,
    required String userName,
    required String type,
    required List<Map<String, dynamic>> contactsData,
  }) async {
    try {
      // Get current location
      Position? position;
      String? address;

      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 10),
        );

        // You can add reverse geocoding here if needed
        address = 'Location: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';
      } catch (e) {
        print('⚠️ Could not get location for SOS event: $e');
      }

      // Store SOS event in Firebase
      bool firebaseSuccess = await storeSosEvent(
        userId: userId,
        userName: userName,
        type: type,
        latitude: position?.latitude,
        longitude: position?.longitude,
        address: address,
        contactsData: contactsData,
      );

      // Start live location tracking after SOS
      if (firebaseSuccess) {
        await startLiveLocationTracking(userId);
        print('✅ SOS event stored in Firebase and live tracking started');
      }

      return firebaseSuccess;
    } catch (e) {
      print('❌ Failed to store SOS event with location: $e');
      return false;
    }
  }

  // Check if Firebase is available
  static bool get isInitialized => _firestore != null;

  // Check if location tracking is active
  static bool get isTracking => _isTracking;
}
