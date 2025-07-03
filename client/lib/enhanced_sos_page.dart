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
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
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
        _showAlert(
          'Permission Denied',
          'Location access is required for SOS functionality.',
        );
        return;
      }

      currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        locationLink =
            'https://www.google.com/maps?q=${currentPosition!.latitude},${currentPosition!.longitude}';
      });

      Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
        ),
      ).listen((Position position) {
        setState(() {
          currentPosition = position;
          locationLink =
              'https://www.google.com/maps?q=${position.latitude},${position.longitude}';
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
      final message =
          '🚨 EMERGENCY SOS ALERT! 🚨\n\n'
          'I need immediate help!\n\n'
          '📍 My current location:\n$locationLink\n\n'
          'This is an automated emergency message from RakshaNet.';

      final result = await ApiService.sendSosSms(message);

      if (result['success']) {
        _showAlert(
          'SOS Sent!',
          'Emergency SMS has been sent to all your emergency contacts.',
        );
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
      final message =
          'Emergency SOS Alert! I need immediate help. '
          'My location: $locationLink';

      final result = await ApiService.makeSosCall('+1234567890', message);

      if (result['success']) {
        _showAlert(
          'SOS Call Initiated!',
          'Emergency call has been placed to your primary contact.',
        );
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
      builder:
          (context) => AlertDialog(
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
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Emergency SOS'),
        backgroundColor: const Color(0xFFEF4444),
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight:
                  MediaQuery.of(context).size.height -
                  MediaQuery.of(context).padding.top -
                  MediaQuery.of(context).padding.bottom -
                  kToolbarHeight -
                  48, // AppBar height + padding
            ),
            child:
                loading
                    ? Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const CircularProgressIndicator(
                          color: Color(0xFFEF4444),
                          strokeWidth: 3,
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'Sending emergency alert...',
                          style: Theme.of(context).textTheme.titleMedium,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Please wait while we notify your emergency contacts',
                          style: Theme.of(context).textTheme.bodyMedium,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    )
                    : Column(
                      children: [
                        // Location status
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color:
                                locationLink != null
                                    ? const Color(0xFF10B981).withOpacity(0.05)
                                    : const Color(0xFFF59E0B).withOpacity(0.05),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color:
                                  locationLink != null
                                      ? const Color(0xFF10B981).withOpacity(0.2)
                                      : const Color(
                                        0xFFF59E0B,
                                      ).withOpacity(0.2),
                              width: 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: (locationLink != null
                                          ? const Color(0xFF10B981)
                                          : const Color(0xFFF59E0B))
                                      .withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  locationLink != null
                                      ? Icons.location_on
                                      : Icons.location_searching,
                                  color:
                                      locationLink != null
                                          ? const Color(0xFF10B981)
                                          : const Color(0xFFF59E0B),
                                  size: 24,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      locationLink != null
                                          ? 'Location Ready'
                                          : 'Getting Location...',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color:
                                            locationLink != null
                                                ? const Color(0xFF10B981)
                                                : const Color(0xFFF59E0B),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      locationLink != null
                                          ? 'Your location will be shared with emergency contacts'
                                          : 'Please wait while we get your current location',
                                      style:
                                          Theme.of(context).textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 40),

                        // SOS Button
                        AnimatedBuilder(
                          animation: _pulseAnimation,
                          builder: (context, child) {
                            return Transform.scale(
                              scale: modalVisible ? _pulseAnimation.value : 1.0,
                              child: GestureDetector(
                                onTap:
                                    locationLink != null
                                        ? _startCountdown
                                        : null,
                                child: Container(
                                  width: 200,
                                  height: 200,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color:
                                        locationLink != null
                                            ? const Color(0xFFEF4444)
                                            : Colors.grey[400],
                                    border: Border.all(
                                      color: (locationLink != null
                                              ? const Color(0xFFEF4444)
                                              : Colors.grey[400]!)
                                          .withOpacity(0.3),
                                      width: 6,
                                    ),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(
                                        Icons.warning_rounded,
                                        size: 56,
                                        color: Colors.white,
                                      ),
                                      const SizedBox(height: 12),
                                      const Text(
                                        'SOS',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 32,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 4,
                                        ),
                                      ),
                                      if (modalVisible)
                                        Text(
                                          '$countdown',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 24,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),

                        const SizedBox(height: 40),

                        // Instructions
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Theme.of(context).cardColor,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Theme.of(context).dividerColor,
                              width: 1,
                            ),
                          ),
                          child: Column(
                            children: [
                              const Icon(
                                Icons.info_outline,
                                color: Color(0xFF2563EB),
                                size: 24,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'How to Use',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color:
                                      Theme.of(
                                        context,
                                      ).textTheme.titleMedium?.color,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Tap the SOS button to activate emergency mode. You\'ll have 10 seconds to choose how to alert your contacts.',
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),

                        // Method selection modal
                        if (modalVisible) ...[
                          const SizedBox(height: 24),
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Theme.of(context).cardColor,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: Theme.of(context).dividerColor,
                                width: 1,
                              ),
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Choose Alert Method',
                                  style: Theme.of(context).textTheme.titleLarge,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Sending alert in $countdown seconds',
                                  style: const TextStyle(
                                    color: Color(0xFFEF4444),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 24),
                                Row(
                                  children: [
                                    Expanded(
                                      child: ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(
                                            0xFF3B82F6,
                                          ),
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 16,
                                          ),
                                        ),
                                        icon: const Icon(Icons.sms_outlined),
                                        label: const Text('Send SMS'),
                                        onPressed: () {
                                          timer?.cancel();
                                          _pulseController.stop();
                                          setState(() => modalVisible = false);
                                          _triggerAction('SMS');
                                        },
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(
                                            0xFF10B981,
                                          ),
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 16,
                                          ),
                                        ),
                                        icon: const Icon(Icons.call_outlined),
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
                                const SizedBox(height: 16),
                                TextButton(
                                  onPressed: _cancelCountdown,
                                  child: const Text(
                                    'Cancel',
                                    style: TextStyle(
                                      color: Color(0xFFEF4444),
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
          ),
        ),
      ),
    );
  }
}
