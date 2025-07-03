import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/services.dart';
import 'login_page.dart';
import 'dashboard_page.dart';
import 'theme.dart';
import 'background_service.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Request all permissions at app launch
  await _requestAllPermissions();

  // Initialize background service after permissions
  await initializeService();

  runApp(const RakshaNetApp());
}

Future<void> _requestAllPermissions() async {
  try {
    // Request permissions in groups for better success rate

    // Location permissions
    await Permission.locationWhenInUse.request();
    await Permission.locationAlways.request();

    // Notification permissions
    await Permission.notification.request();

    // Audio permissions
    await Permission.microphone.request();

    // Phone and SMS permissions
    await Permission.phone.request();
    await Permission.sms.request();

    // Activity recognition
    await Permission.activityRecognition.request();

    // Battery optimization (Android specific)
    if (await Permission.ignoreBatteryOptimizations.isDenied) {
      await Permission.ignoreBatteryOptimizations.request();
    }

    // System alert window (for emergency alerts)
    if (await Permission.systemAlertWindow.isDenied) {
      await Permission.systemAlertWindow.request();
    }

    print('All permissions requested successfully');
  } catch (e) {
    print('Error requesting permissions: $e');
  }
}

class RakshaNetApp extends StatefulWidget {
  const RakshaNetApp({super.key});

  @override
  State<RakshaNetApp> createState() => _RakshaNetAppState();
}

class _RakshaNetAppState extends State<RakshaNetApp> {
  bool isDarkMode = false;
  bool isLoading = true;
  bool isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      // Add a small delay to ensure permissions are processed
      await Future.delayed(const Duration(seconds: 2));

      final authenticated = await ApiService.isAuthenticated();
      setState(() {
        isAuthenticated = authenticated;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isAuthenticated = false;
        isLoading = false;
      });
    }
  }

  void toggleTheme() {
    setState(() {
      isDarkMode = !isDarkMode;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RakshaNet',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home:
          isLoading
              ? Scaffold(
                backgroundColor: const Color(0xFFF9FAFB),
                body: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: const Color(0xFF2563EB).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(
                          Icons.security,
                          size: 40,
                          color: Color(0xFF2563EB),
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'RakshaNet',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF111827),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Initializing safety features...',
                        style: TextStyle(
                          fontSize: 14,
                          color: Color(0xFF6B7280),
                        ),
                      ),
                      const SizedBox(height: 32),
                      const CircularProgressIndicator(
                        color: Color(0xFF2563EB),
                        strokeWidth: 3,
                      ),
                    ],
                  ),
                ),
              )
              : isAuthenticated
              ? DashboardPage(toggleTheme: toggleTheme)
              : LoginPage(toggleTheme: toggleTheme),
      debugShowCheckedModeBanner: false,
    );
  }
}
