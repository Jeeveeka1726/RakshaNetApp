import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';
import 'services/api_service.dart';

class EnhancedSOSPage extends StatefulWidget {
  @override
  _EnhancedSOSPageState createState() => _EnhancedSOSPageState();
}

class _EnhancedSOSPageState extends State<EnhancedSOSPage>
    with TickerProviderStateMixin {
  bool loading = false;
  bool modalVisible = false;
  int countdown = 10;
  String? locationLink;
  String? selectedMethod;
  Timer? timer;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  Position? currentPosition;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
    _getLocationUpdates();
  }

  @override
  void dispose() {
    timer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _getLocationUpdates() async {
    try {
      LocationPermission permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        _showAlert('Permission Denied', 'Location access is required for SOS functionality.');
        return;
      }

      // Get current position
      currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        locationLink = 'https://www.google.com/maps?q=${currentPosition!.latitude},${currentPosition!.longitude}';
      });

      // Listen for position updates
      Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
        ),
      ).listen((Position position) {
        setState(() {
          currentPosition = position;
          locationLink = 'https://www.google.com/maps?q=${position.latitude},${position.longitude}';
        });
      });
    } catch (e) {
      print('Error getting location: $e');
    }
  }

  void _startCountdown() {
    setState(() {
      countdown = 10;
      modalVisible = true;
      selectedMethod = null;
    });

    _pulseController.repeat(reverse: true);

    timer = Timer.periodic(const Duration(seconds: 1), (Timer t) {
      if (countdown == 0) {
        t.cancel();
        _pulseController.stop();
        setState(() => modalVisible = false);
        _triggerAction(selectedMethod ?? 'SMS');
      } else {
        setState(() => countdown--);
      }
    });
  }

  void _cancelCountdown() {
    timer?.cancel();
    _pulseController.stop();
    _pulseController.reset();
    setState(() {
      modalVisible = false;
      countdown = 10;
    });
  }

  Future<void> _triggerAction(String method) async {
    if (method == 'SMS') {
      await _sendSMS();
    } else {
      await _makeCall();
    }
  }

  Future<void> _sendSMS() async {
    if (locationLink == null) {
      _showAlert('Error', 'Location not available. Please try again.');
      return;
    }

    setState(() => loading = true);

    try {
      final message = '🚨 EMERGENCY SOS ALERT! 🚨\n\n'
          'I need immediate help!\n\n'
          '📍 My current location:\n$locationLink\n\n'
          'This is an automated emergency message from RakshaNet.';

      final result = await ApiService.sendSosSms(message);

      if (result['success']) {
        _showAlert('SOS Sent!', 'Emergency SMS has been sent to all your emergency contacts.');
      } else {
        _showAlert('Error', result['error'] ?? 'Failed to send SOS SMS');
      }
    } catch (e) {
      _showAlert('Error', 'Failed to send SOS: ${e.toString()}');
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> _makeCall() async {
    if (locationLink == null) {
      _showAlert('Error', 'Location not available. Please try again.');
      return;
    }

    setState(() => loading = true);

    try {
      final message = 'Emergency SOS Alert! I need immediate help. '
          'My location: $locationLink';

      // For now, we'll use the first emergency contact
      // In a real implementation, you might want to get contacts from storage
      final result = await ApiService.makeSosCall('+1234567890', message);

      if (result['success']) {
        _showAlert('SOS Call Initiated!', 'Emergency call has been placed to your primary contact.');
      } else {
        _showAlert('Error', result['error'] ?? 'Failed to make SOS call');
      }
    } catch (e) {
      _showAlert('Error', 'Failed to make SOS call: ${e.toString()}');
    } finally {
      setState(() => loading = false);
    }
  }

  void _showAlert(String title, String content) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(
              title.contains('Error') ? Icons.error : Icons.check_circle,
              color: title.contains('Error') ? Colors.red : Colors.green,
            ),
            const SizedBox(width: 8),
            Text(title),
          ],
        ),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency SOS'),
        backgroundColor: Colors.red[700],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.red[50]!,
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: loading
                ? Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const CircularProgressIndicator(color: Colors.red),
                      const SizedBox(height: 16),
                      Text(
                        'Sending emergency alert...',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  )
                : Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Location status
                      Container(
                        margin: const EdgeInsets.all(16),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: locationLink != null ? Colors.green[50] : Colors.orange[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: locationLink != null ? Colors.green[200]! : Colors.orange[200]!,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              locationLink != null ? Icons.location_on : Icons.location_off,
                              color: locationLink != null ? Colors.green[700] : Colors.orange[700],
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                locationLink != null
                                    ? 'Location tracking active'
                                    : 'Getting your location...',
                                style: TextStyle(
                                  color: locationLink != null ? Colors.green[700] : Colors.orange[700],
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 32),

                      // SOS Button
                      AnimatedBuilder(
                        animation: _pulseAnimation,
                        builder: (context, child) {
                          return Transform.scale(
                            scale: modalVisible ? _pulseAnimation.value : 1.0,
                            child: GestureDetector(
                              onTap: locationLink != null ? _startCountdown : null,
                              child: Container(
                                width: 200,
                                height: 200,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: locationLink != null ? Colors.red : Colors.grey,
                                  boxShadow: [
                                    BoxShadow(
                                      color: (locationLink != null ? Colors.red : Colors.grey).withOpacity(0.3),
                                      blurRadius: 20,
                                      spreadRadius: 5,
                                    ),
                                  ],
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(
                                      Icons.warning,
                                      size: 60,
                                      color: Colors.white,
                                    ),
                                    const SizedBox(height: 8),
                                    const Text(
                                      'SOS',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 32,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    if (modalVisible)
                                      Text(
                                        '$countdown',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 24,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),

                      const SizedBox(height: 32),

                      Text(
                        'Press and hold to activate emergency SOS',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                        textAlign: TextAlign.center,
                      ),

                      // Method selection modal
                      if (modalVisible)
                        Container(
                          margin: const EdgeInsets.all(16),
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 10,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Choose SOS Method ($countdown s)',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Emergency contacts will be notified',
                                style: TextStyle(color: Colors.grey),
                              ),
                              const SizedBox(height: 20),
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.blue,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                      ),
                                      icon: const Icon(Icons.sms),
                                      label: const Text('Send SMS'),
                                      onPressed: () {
                                        timer?.cancel();
                                        _pulseController.stop();
                                        setState(() => modalVisible = false);
                                        _triggerAction('SMS');
                                      },
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.green,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                      ),
                                      icon: const Icon(Icons.call),
                                      label: const Text('Make Call'),
                                      onPressed: () {
                                        timer?.cancel();
                                        _pulseController.stop();
                                        setState(() => modalVisible = false);
                                        _triggerAction('Call');
                                      },
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              TextButton(
                                onPressed: _cancelCountdown,
                                child: const Text(
                                  'Cancel',
                                  style: TextStyle(color: Colors.red),
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
