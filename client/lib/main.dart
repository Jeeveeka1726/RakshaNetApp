import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/services.dart';
import 'login_page.dart';
import 'theme.dart';
import 'background_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Request permissions before starting service
  await Permission.notification.request();
  await Permission.locationWhenInUse.request();
  
  await initializeService();
  runApp(const RakshaNetApp());
}

class RakshaNetApp extends StatefulWidget {
  const RakshaNetApp({super.key});

  @override
  State<RakshaNetApp> createState() => _RakshaNetAppState();
}

class _RakshaNetAppState extends State<RakshaNetApp> {
  bool isDarkMode = false;

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
      home: LoginPage(toggleTheme: toggleTheme),
      debugShowCheckedModeBanner: false,
    );
  }
}
