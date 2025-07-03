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
  
  await initializeService();
  runApp(const RakshaNetApp());
}

Future<void> _requestAllPermissions() async {
  // Request all necessary permissions
  final permissions = [
    Permission.notification,
    Permission.locationWhenInUse,
    Permission.locationAlways,
    Permission.activityRecognition,
    Permission.microphone,
    Permission.phone,
    Permission.sms,
    Permission.ignoreBatteryOptimizations,
  ];

  // Request permissions one by one
  for (Permission permission in permissions) {
    try {
      final status = await permission.request();
      print('Permission ${permission.toString()}: ${status.toString()}');
      
      // For critical permissions, show dialog if denied
      if (permission == Permission.notification || 
          permission == Permission.locationWhenInUse) {
        if (status.isDenied || status.isPermanentlyDenied) {
          print('Critical permission denied: ${permission.toString()}');
        }
      }
    } catch (e) {
      print('Error requesting permission ${permission.toString()}: $e');
    }
  }

  // Special handling for battery optimization
  try {
    if (await Permission.ignoreBatteryOptimizations.isDenied) {
      await Permission.ignoreBatteryOptimizations.request();
    }
  } catch (e) {
    print('Error requesting battery optimization permission: $e');
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
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    try {
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
      home: isLoading
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
