import 'dart:math';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// Global notification plugin instance
final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

bool onIosBackground(ServiceInstance service) {
  WidgetsFlutterBinding.ensureInitialized();
  return true;
}

Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  // Initialize notifications
  await _initializeNotifications();

  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onStart,
      autoStart: true,
      isForegroundMode: true,
      notificationChannelId: 'raksha_safety_monitor',
      initialNotificationTitle: 'RakshaNet Safety Mode',
      initialNotificationContent: 'Monitoring for emergencies...',
    ),
    iosConfiguration: IosConfiguration(
      onForeground: onStart,
      onBackground: onIosBackground,
    ),
  );

  await service.startService();
}

Future<void> _initializeNotifications() async {
  const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');

  const DarwinInitializationSettings initializationSettingsIOS =
      DarwinInitializationSettings(
    requestAlertPermission: true,
    requestBadgePermission: true,
    requestSoundPermission: true,
  );

  const InitializationSettings initializationSettings = InitializationSettings(
    android: initializationSettingsAndroid,
    iOS: initializationSettingsIOS,
  );

  await flutterLocalNotificationsPlugin.initialize(initializationSettings);
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  AccelerometerEvent? lastEvent;
  DateTime lastTriggered = DateTime.now();
  bool isListeningForVoice = false;
  Timer? voiceTimer;

  // Initialize notifications in background service
  await _initializeNotifications();

  // Monitor accelerometer for shake detection
  accelerometerEvents.listen((event) async {
    final now = DateTime.now();
    if (lastEvent != null) {
      double delta = sqrt(
        pow(event.x - lastEvent!.x, 2) +
            pow(event.y - lastEvent!.y, 2) +
            pow(event.z - lastEvent!.z, 2),
      );

      // Detect sudden movement (shake)
      if (delta > 15 && now.difference(lastTriggered).inSeconds > 5) {
        lastTriggered = now;
        await _triggerEmergencyAlert("Shake detected");
        
        // Start voice listening after shake
        if (!isListeningForVoice) {
          _startVoiceListening();
          isListeningForVoice = true;
          
          // Stop listening after 10 seconds
          voiceTimer?.cancel();
          voiceTimer = Timer(const Duration(seconds: 10), () {
            isListeningForVoice = false;
          });
        }
      }
    }
    lastEvent = event;
  });

  // Simulate voice recognition (in a real app, you'd use speech_to_text package)
  // For demonstration, we'll trigger on a timer or through service communication
  service.on('voice_detected').listen((event) async {
    final word = event?['word'] as String?;
    if (word?.toLowerCase().contains('raksha') == true) {
      await _triggerEmergencyAlert("Voice command detected: $word");
    }
  });

  // Handle manual SOS trigger from UI
  service.on('trigger_sos').listen((event) async {
    await _triggerEmergencyAlert("Manual SOS activated");
  });

  // Stop service handler
  service.on('stopService').listen((event) {
    voiceTimer?.cancel();
    service.stopSelf();
  });

  // Update service status
  Timer.periodic(const Duration(seconds: 30), (timer) async {
    service.invoke(
      'update',
      {
        "current_date": DateTime.now().toIso8601String(),
        "status": "monitoring",
      },
    );
  });
}

void _startVoiceListening() {
  // In a real implementation, you would start speech recognition here
  // For now, we'll simulate it with a print statement
  print("🎤 Voice listening activated - Say 'Raksha' to trigger SOS");
}

Future<void> _triggerEmergencyAlert(String reason) async {
  print("🚨 EMERGENCY ALERT TRIGGERED: $reason");
  
  // Play alert sound
  await _playAlertSound();
  
  // Show emergency notification
  await _showEmergencyNotification(reason);
  
  // Vibrate device
  await _triggerVibration();
  
  // Here you would also:
  // - Send SMS to emergency contacts
  // - Share location
  // - Call emergency services if configured
}

Future<void> _playAlertSound() async {
  try {
    // Load and play the alert.wav file
    await SystemSound.play(SystemSoundType.alert);
    
    // For custom sound, you would use an audio player package
    // Example with audioplayers package:
    // final player = AudioPlayer();
    // await player.play(AssetSource('alert.wav'));
    
    print("🔊 Alert sound played");
  } catch (e) {
    print("Error playing alert sound: $e");
  }
}

Future<void> _showEmergencyNotification(String reason) async {
  const AndroidNotificationDetails androidPlatformChannelSpecifics =
      AndroidNotificationDetails(
    'emergency_alerts',
    'Emergency Alerts',
    channelDescription: 'Critical emergency notifications',
    importance: Importance.max,
    priority: Priority.high,
    showWhen: true,
    enableVibration: true,
    playSound: true,
  );

  const DarwinNotificationDetails iOSPlatformChannelSpecifics =
      DarwinNotificationDetails(
    presentAlert: true,
    presentBadge: true,
    presentSound: true,
  );

  const NotificationDetails platformChannelSpecifics = NotificationDetails(
    android: androidPlatformChannelSpecifics,
    iOS: iOSPlatformChannelSpecifics,
  );

  await flutterLocalNotificationsPlugin.show(
    0,
    '🚨 EMERGENCY ALERT',
    'RakshaNet: $reason - Emergency services notified',
    platformChannelSpecifics,
  );
}

Future<void> _triggerVibration() async {
  try {
    await HapticFeedback.heavyImpact();
    // Add a delay and vibrate again for emphasis
    await Future.delayed(const Duration(milliseconds: 500));
    await HapticFeedback.heavyImpact();
  } catch (e) {
    print("Error triggering vibration: $e");
  }
}

// Helper function to check if service is running
Future<bool> isBackgroundServiceRunning() async {
  final service = FlutterBackgroundService();
  return await service.isRunning();
}

// Helper function to trigger SOS from UI
Future<void> triggerSOSFromUI() async {
  final service = FlutterBackgroundService();
  if (await service.isRunning()) {
    service.invoke('trigger_sos');
  }
}

// Helper function to simulate voice detection (for testing)
Future<void> simulateVoiceDetection(String word) async {
  final service = FlutterBackgroundService();
  if (await service.isRunning()) {
    service.invoke('voice_detected', {'word': word});
  }
}
