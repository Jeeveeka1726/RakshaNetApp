import 'package:flutter/material.dart';
import 'login_page.dart';
import 'theme.dart';

void main() {
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
