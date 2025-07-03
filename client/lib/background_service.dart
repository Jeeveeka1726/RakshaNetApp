import 'dart:math';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'services/api_service.dart';

// Global notification plugin instance
final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

bool onIosBackground(ServiceInstance service) {
  WidgetsFlutterBinding.ensureInitialized();
  return true;
}

Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  // Initialize notifications BEFORE configuring the service
  await _initializeNotifications();

  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onStart,
      autoStart: true,
      isForegroundMode: true,
      notificationChannelId: 'raksha_safety_monitor',
      initialNotificationTitle: 'RakshaNet Safety Mode',
      initialNotificationContent: 'Monitoring for emergencies...',
      foregroundServiceNotificationId: 888,
      foregroundServiceTypes: [
        AndroidForegroundType.dataSync,
        AndroidForegroundType.location,
      ],
    ),
    iosConfiguration: IosConfiguration(
      onForeground: onStart,
      onBackground: onIosBackground,
    ),
  );

  // Start service only if permissions are granted
  try {
    await service.startService();
    print('Background service started successfully');
  } catch (e) {
    print('Failed to start background service: $e');
  }
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
void onStart(ServiceInstance service) {
  WidgetsFlutterBinding.ensureInitialized();

  if (service is AndroidServiceInstance) {
    service.setForegroundNotificationInfo(
      title: "RakshaNet Safety Mode",
      content: "Monitoring for emergencies...",
    );
  }

  _initializeServiceAsync(service);
}

void _initializeServiceAsync(ServiceInstance service) async {
  try {
    await _initializeNotifications();
  } catch (e) {
    print("Error initializing notifications: $e");
  }

  AccelerometerEvent? lastEvent;
  DateTime lastTriggered = DateTime.now();
  bool isListeningForVoice = false;
  Timer? voiceTimer;

  StreamSubscription? accelerometerSubscription;

  try {
    accelerometerSubscription = accelerometerEvents.listen(
      (event) async {
        final now = DateTime.now();
        if (lastEvent != null) {
          double delta = sqrt(
            pow(event.x - lastEvent!.x, 2) +
                pow(event.y - lastEvent!.y, 2) +
                pow(event.z - lastEvent!.z, 2),
          );

          if (delta > 15 && now.difference(lastTriggered).inSeconds > 5) {
            lastTriggered = now;
            await _triggerMotionSOS("Shake detected");

            if (!isListeningForVoice) {
              _startVoiceListening();
              isListeningForVoice = true;

              voiceTimer?.cancel();
              voiceTimer = Timer(const Duration(seconds: 10), () {
                isListeningForVoice = false;
              });
            }
          }
        }
        lastEvent = event;
      },
      onError: (error) {
        print("Accelerometer error: $error");
      },
    );
  } catch (e) {
    print("Error setting up accelerometer: $e");
  }

  service.on('voice_detected').listen((event) async {
    final word = event?['word'] as String?;
    if (word?.toLowerCase().contains('raksha') == true) {
      await _triggerVoiceSOS("Voice command detected: $word");
    }
  });

  service.on('trigger_sos').listen((event) async {
    await _triggerEmergencyAlert("Manual SOS activated");
  });

  service.on('stopService').listen((event) {
    voiceTimer?.cancel();
    accelerometerSubscription?.cancel();
    service.stopSelf();
  });

  Timer.periodic(const Duration(seconds: 30), (timer) async {
    if (service is AndroidServiceInstance) {
      service.setForegroundNotificationInfo(
        title: "RakshaNet Safety Mode",
        content:
            "Active - Last check: ${DateTime.now().toString().substring(11, 19)}",
      );
    }

    service.invoke('update', {
      "current_date": DateTime.now().toIso8601String(),
      "status": "monitoring",
    });
  });
}

void _startVoiceListening() {
  print("🎤 Voice listening activated - Say 'Raksha' to trigger SOS");
}

Future<void> _triggerVoiceSOS(String reason) async {
  print("🎤 VOICE SOS TRIGGERED: $reason");

  try {
    await ApiService.triggerVoiceSos();
    await _triggerEmergencyAlert(reason);
  } catch (e) {
    print("Error triggering voice SOS: $e");
    await _triggerEmergencyAlert(reason);
  }
}

Future<void> _triggerMotionSOS(String reason) async {
  print("📱 MOTION SOS TRIGGERED: $reason");

  try {
    await ApiService.triggerMotionSos();
    await _triggerEmergencyAlert(reason);
  } catch (e) {
    print("Error triggering motion SOS: $e");
    await _triggerEmergencyAlert(reason);
  }
}

Future<void> _triggerEmergencyAlert(String reason) async {
  print("🚨 EMERGENCY ALERT TRIGGERED: $reason");

  try {
    await _playAlertSound();
    await _showEmergencyNotification(reason);
    await _triggerVibration();
  } catch (e) {
    print("Error in emergency alert: $e");
  }
}

Future<void> _playAlertSound() async {
  try {
    await SystemSound.play(SystemSoundType.alert);
    print("🔊 Alert sound played");
  } catch (e) {
    print("Error playing alert sound: $e");
  }
}

Future<void> _showEmergencyNotification(String reason) async {
  try {
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
          autoCancel: false,
          ongoing: true,
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
      999,
      '🚨 EMERGENCY ALERT',
      'RakshaNet: $reason - Emergency services notified',
      platformChannelSpecifics,
    );
  } catch (e) {
    print("Error showing notification: $e");
  }
}

Future<void> _triggerVibration() async {
  try {
    await HapticFeedback.heavyImpact();
    await Future.delayed(const Duration(milliseconds: 500));
    await HapticFeedback.heavyImpact();
  } catch (e) {
    print("Error triggering vibration: $e");
  }
}

Future<bool> isBackgroundServiceRunning() async {
  final service = FlutterBackgroundService();
  return await service.isRunning();
}

Future<void> triggerSOSFromUI() async {
  final service = FlutterBackgroundService();
  if (await service.isRunning()) {
    service.invoke('trigger_sos');
  }
}

Future<void> simulateVoiceDetection(String word) async {
  final service = FlutterBackgroundService();
  if (await service.isRunning()) {
    service.invoke('voice_detected', {'word': word});
  }
}

Future<void> stopBackgroundService() async {
  final service = FlutterBackgroundService();
  if (await service.isRunning()) {
    service.invoke('stopService');
  }
}
