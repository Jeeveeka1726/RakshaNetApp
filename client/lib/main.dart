import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_background_service_android/flutter_background_service_android.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:permission_handler/permission_handler.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeService();
  runApp(MyApp());
}

bool onIosBackground(ServiceInstance service) {
  WidgetsFlutterBinding.ensureInitialized();
  return true;
}

Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onStart,
      autoStart: true,
      isForegroundMode: true,
      notificationChannelId: 'safety_monitor',
      initialNotificationTitle: 'Safety Mode',
      initialNotificationContent: 'Monitoring for sudden movements...',
    ),
    iosConfiguration: IosConfiguration(
      onForeground: onStart,
      onBackground: onIosBackground,
    ),
  );

  await service.startService();
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  final player = AudioPlayer();
  AccelerometerEvent? lastEvent;
  DateTime lastTriggered = DateTime.now();

  // No need to check isRunning() inside here
  accelerometerEvents.listen((event) async {
    final now = DateTime.now();
    if (lastEvent != null) {
      double delta = sqrt(
        pow(event.x - lastEvent!.x, 2) +
            pow(event.y - lastEvent!.y, 2) +
            pow(event.z - lastEvent!.z, 2),
      );

      if (delta > 15 && now.difference(lastTriggered).inSeconds > 5) {
        lastTriggered = now;
        await player.play(AssetSource('alarm.mp3'));
      }
    }
    lastEvent = event;
  });

  if (service is AndroidServiceInstance) {
    service.on('setAsForeground').listen((event) {
      service.setAsForegroundService();
    });
    service.on('stopService').listen((event) {
      service.stopSelf();
    });
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(title: 'Women Safety App', home: HomeScreen());
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool isRunning = false;

  @override
  void initState() {
    super.initState();
    _askPermissions();
    _checkService();
  }

  Future<void> _askPermissions() async {
    await Permission.activityRecognition.request();
    await Permission.notification.request();
    await Permission.ignoreBatteryOptimizations.request();
  }

  Future<void> _checkService() async {
    final service = FlutterBackgroundService();
    final running = await service.isRunning();
    setState(() {
      isRunning = running;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Safety Monitor')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(isRunning ? "Monitoring active!" : "Service not running"),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final service = FlutterBackgroundService();
                if (await service.isRunning()) {
                  service.invoke("stopService");
                } else {
                  service.startService();
                }
                _checkService();
              },
              child: Text(isRunning ? "Stop Monitoring" : "Start Monitoring"),
            ),
          ],
        ),
      ),
    );
  }
}
