import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'services/api_service.dart';
import 'models/contact.dart';
import 'contacts_management_page.dart';

class DashboardPage extends StatefulWidget {
  final VoidCallback toggleTheme;

  const DashboardPage({super.key, required this.toggleTheme});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage>
    with TickerProviderStateMixin {
  bool _sosActivated = false;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  List<Contact> _emergencyContacts = [];
  bool _isLoadingContacts = false;

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
    
    _loadEmergencyContacts();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _loadEmergencyContacts() async {
    setState(() {
      _isLoadingContacts = true;
    });

    try {
      final result = await ApiService.getContacts();
      if (result['success']) {
        setState(() {
          _emergencyContacts = (result['data']['contacts'] as List)
              .map((contact) => Contact.fromJson(contact))
              .toList();
        });
      }
    } catch (e) {
      print('Error loading contacts: $e');
    } finally {
      setState(() {
        _isLoadingContacts = false;
      });
    }
  }

  Future<String> _getCurrentLocation() async {
    try {
      // Check location permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return 'Location permission denied';
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return 'Location permissions are permanently denied';
      }

      // Get current position
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      return 'https://maps.google.com/?q=${position.latitude},${position.longitude}';
    } catch (e) {
      return 'Unable to get location: ${e.toString()}';
    }
  }

  void _activateSOS() async {
    setState(() {
      _sosActivated = true;
    });
    _pulseController.repeat(reverse: true);
    
    // Vibrate
    HapticFeedback.heavyImpact();
    
    // Get current location
    String location = await _getCurrentLocation();
    
    // Create SOS message
    String sosMessage = '''
🚨 EMERGENCY ALERT 🚨
This is an automated SOS message from RakshaNet.

I need immediate help!

My current location: $location

Please contact me or emergency services immediately.

Time: ${DateTime.now().toString()}
''';

    // Send SOS to all emergency contacts
    bool anySuccess = false;
    for (Contact contact in _emergencyContacts) {
      try {
        // Send SMS
        final smsResult = await ApiService.sendSosSms(sosMessage);
        if (smsResult['success']) {
          anySuccess = true;
        }

        // Make call
        final callResult = await ApiService.makeSosCall(contact.phone, sosMessage);
        if (callResult['success']) {
          anySuccess = true;
        }
      } catch (e) {
        print('Error sending SOS to ${contact.name}: $e');
      }
    }
    
    // Show confirmation dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('SOS Activated!'),
        content: Text(
          anySuccess 
            ? 'Emergency alert has been sent to your contacts. Help is on the way.'
            : 'SOS activated but there was an issue sending alerts. Please call emergency services directly.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _deactivateSOS();
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _deactivateSOS() {
    setState(() {
      _sosActivated = false;
    });
    _pulseController.stop();
    _pulseController.reset();
  }

  void _logout() async {
    await ApiService.removeToken();
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('RakshaNet'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: widget.toggleTheme,
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') {
                _logout();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout),
                    SizedBox(width: 8),
                    Text('Logout'),
                  ],
                ),
              ),
            ],
            child: const Icon(Icons.more_vert),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Header Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Icon(
                        Icons.security,
                        size: 48,
                        color: Theme.of(context).primaryColor,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Stay Safe with RakshaNet',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Your safety is our priority. Use the SOS button below in case of emergency.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // SOS Button
              AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _sosActivated ? _pulseAnimation.value : 1.0,
                    child: GestureDetector(
                      onTap: _sosActivated ? null : _activateSOS,
                      child: Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _sosActivated ? Colors.red[700] : Colors.red,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.red.withOpacity(0.3),
                              blurRadius: 20,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.warning,
                              size: 60,
                              color: Colors.white,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'SOS',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (_sosActivated)
                              Text(
                                'ACTIVATED',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
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
              const SizedBox(height: 24),

              // Emergency Contacts Status
              Card(
                color: _emergencyContacts.isNotEmpty ? Colors.green[50] : Colors.orange[50],
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Icon(
                        _emergencyContacts.isNotEmpty ? Icons.check_circle : Icons.warning,
                        color: _emergencyContacts.isNotEmpty ? Colors.green[700] : Colors.orange[700],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _emergencyContacts.isNotEmpty 
                            ? '${_emergencyContacts.length} emergency contact(s) configured'
                            : 'No emergency contacts configured',
                          style: TextStyle(
                            color: _emergencyContacts.isNotEmpty ? Colors.green[700] : Colors.orange[700],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Quick Actions
              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  children: [
                    _buildQuickActionCard(
                      icon: Icons.contacts,
                      title: 'Emergency\nContacts',
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ContactsManagementPage(),
                          ),
                        );
                        _loadEmergencyContacts(); // Refresh contacts when returning
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.location_on,
                      title: 'Share\nLocation',
                      onTap: () async {
                        String location = await _getCurrentLocation();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Current location: $location'),
                            duration: const Duration(seconds: 3),
                          ),
                        );
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.local_hospital,
                      title: 'Emergency\nNumbers',
                      onTap: () {
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Emergency Numbers'),
                            content: const Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Police: 100'),
                                Text('Fire: 101'),
                                Text('Ambulance: 108'),
                                Text('Women Helpline: 1091'),
                                Text('Child Helpline: 1098'),
                              ],
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('Close'),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.refresh,
                      title: 'Refresh\nContacts',
                      onTap: _loadEmergencyContacts,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 40,
                color: Theme.of(context).primaryColor,
              ),
              const SizedBox(height: 8),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
