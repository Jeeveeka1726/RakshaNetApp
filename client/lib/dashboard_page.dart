import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:geolocator/geolocator.dart';
import 'background_service.dart';
import 'nearby_stations_page.dart';
import 'enhanced_sos_page.dart';
import 'contacts_management_page.dart';
import 'services/api_service.dart';
import 'models/contact.dart';
import 'login_page.dart';

class DashboardPage extends StatefulWidget {
  final VoidCallback toggleTheme;

  const DashboardPage({super.key, required this.toggleTheme});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage>
    with TickerProviderStateMixin {
  bool _sosActivated = false;
  bool _serviceRunning = false;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  List<Contact> _contacts = [];
  bool _isLoadingContacts = false;

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

    _checkServiceStatus();
    _requestPermissions();
    _loadContacts();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _requestPermissions() async {
    await Permission.activityRecognition.request();
    await Permission.notification.request();
    await Permission.ignoreBatteryOptimizations.request();
    await Permission.microphone.request();
  }

  Future<void> _checkServiceStatus() async {
    final isRunning = await isBackgroundServiceRunning();
    setState(() {
      _serviceRunning = isRunning;
    });
  }

  Future<void> _loadContacts() async {
    setState(() {
      _isLoadingContacts = true;
    });

    try {
      final result = await ApiService.getDashboardContacts();
      if (result['success']) {
        setState(() {
          _contacts =
              (result['data']['contacts'] as List)
                  .map((contact) => Contact.fromJson(contact))
                  .toList();
        });
      } else {
        _showSnackBar(result['error'] ?? 'Failed to load contacts', Colors.red);
      }
    } catch (e) {
      _showSnackBar('Error: ${e.toString()}', Colors.red);
    } finally {
      setState(() {
        _isLoadingContacts = false;
      });
    }
  }

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message), backgroundColor: color));
  }

  void _activateSOS() async {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => EnhancedSOSPage()),
    );
  }

  void _deactivateSOS() {
    setState(() {
      _sosActivated = false;
    });
    _pulseController.stop();
    _pulseController.reset();
  }

  void _testVoiceDetection() async {
    try {
      // Get current location for testing
      Position? position;
      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );
      } catch (e) {
        print('Could not get location for test: $e');
      }

      final result = await ApiService.triggerVoiceSos(
        latitude: position?.latitude,
        longitude: position?.longitude,
      );
      if (result['success']) {
        _showSnackBar('Voice SOS triggered successfully!', Colors.green);
      } else {
        _showSnackBar(
          result['error'] ?? 'Failed to trigger voice SOS',
          Colors.red,
        );
      }
    } catch (e) {
      _showSnackBar('Error: ${e.toString()}', Colors.red);
    }
  }

  void _testMotionDetection() async {
    try {
      // Get current location for testing
      Position? position;
      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );
      } catch (e) {
        print('Could not get location for test: $e');
      }

      final result = await ApiService.triggerMotionSos(
        latitude: position?.latitude,
        longitude: position?.longitude,
      );
      if (result['success']) {
        _showSnackBar('Motion SOS triggered successfully!', Colors.green);
      } else {
        _showSnackBar(
          result['error'] ?? 'Failed to trigger motion SOS',
          Colors.red,
        );
      }
    } catch (e) {
      _showSnackBar('Error: ${e.toString()}', Colors.red);
    }
  }

  void _logout() async {
    await ApiService.logout();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => LoginPage(toggleTheme: widget.toggleTheme),
      ),
    );
  }

  Widget _buildModernActionCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Theme.of(context).dividerColor, width: 1),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 24, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).textTheme.titleMedium?.color,
                height: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('RakshaNet'),
        automaticallyImplyLeading: false,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color:
                  _serviceRunning
                      ? const Color(0xFF10B981).withOpacity(0.1)
                      : const Color(0xFFF59E0B).withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color:
                    _serviceRunning
                        ? const Color(0xFF10B981)
                        : const Color(0xFFF59E0B),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color:
                        _serviceRunning
                            ? const Color(0xFF10B981)
                            : const Color(0xFFF59E0B),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  _serviceRunning ? 'Protected' : 'Offline',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color:
                        _serviceRunning
                            ? const Color(0xFF10B981)
                            : const Color(0xFFF59E0B),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: widget.toggleTheme,
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'test_voice':
                  _testVoiceDetection();
                  break;
                case 'test_motion':
                  _testMotionDetection();
                  break;
                case 'refresh_service':
                  _checkServiceStatus();
                  break;
                case 'refresh_contacts':
                  _loadContacts();
                  break;
                case 'logout':
                  _logout();
                  break;
              }
            },
            itemBuilder:
                (context) => [
                  const PopupMenuItem(
                    value: 'test_voice',
                    child: Row(
                      children: [
                        Icon(Icons.mic),
                        SizedBox(width: 12),
                        Text('Test Voice SOS'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'test_motion',
                    child: Row(
                      children: [
                        Icon(Icons.vibration),
                        SizedBox(width: 12),
                        Text('Test Motion SOS'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'refresh_service',
                    child: Row(
                      children: [
                        Icon(Icons.refresh),
                        SizedBox(width: 12),
                        Text('Refresh Service'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'refresh_contacts',
                    child: Row(
                      children: [
                        Icon(Icons.contacts),
                        SizedBox(width: 12),
                        Text('Refresh Contacts'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'logout',
                    child: Row(
                      children: [
                        Icon(Icons.logout),
                        SizedBox(width: 12),
                        Text('Logout'),
                      ],
                    ),
                  ),
                ],
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Section
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24.0),
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
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(
                        Icons.security,
                        size: 32,
                        color: Color(0xFF2563EB),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Stay Safe with RakshaNet',
                      style: Theme.of(context).textTheme.titleLarge,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Your safety is our priority. Use the SOS button below in case of emergency.',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Status Cards Row
              Row(
                children: [
                  // Emergency Contacts Card
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: const Color(0xFF10B981).withOpacity(0.2),
                          width: 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.contacts,
                                color: Color(0xFF10B981),
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              if (_isLoadingContacts)
                                const SizedBox(
                                  width: 12,
                                  height: 12,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation(
                                      Color(0xFF10B981),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${_contacts.length}',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF10B981),
                            ),
                          ),
                          Text(
                            'Emergency Contacts',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Service Status Card
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: (_serviceRunning
                                ? const Color(0xFF10B981)
                                : const Color(0xFFF59E0B))
                            .withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: (_serviceRunning
                                  ? const Color(0xFF10B981)
                                  : const Color(0xFFF59E0B))
                              .withOpacity(0.2),
                          width: 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            _serviceRunning
                                ? Icons.shield
                                : Icons.shield_outlined,
                            color:
                                _serviceRunning
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFFF59E0B),
                            size: 20,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _serviceRunning ? 'Active' : 'Inactive',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color:
                                  _serviceRunning
                                      ? const Color(0xFF10B981)
                                      : const Color(0xFFF59E0B),
                            ),
                          ),
                          Text(
                            'Background Monitor',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // SOS Button
              Center(
                child: AnimatedBuilder(
                  animation: _pulseAnimation,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: _sosActivated ? _pulseAnimation.value : 1.0,
                      child: GestureDetector(
                        onTap: _sosActivated ? null : _activateSOS,
                        child: Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFFEF4444),
                            border: Border.all(
                              color: const Color(0xFFEF4444).withOpacity(0.3),
                              width: 4,
                            ),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.warning_rounded,
                                size: 48,
                                color: Colors.white,
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'SOS',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 28,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 2,
                                ),
                              ),
                              if (_sosActivated)
                                const Text(
                                  'ACTIVATED',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 1,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 32),

              // Info Section
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20.0),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFF2563EB).withOpacity(0.2),
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
                    const Text(
                      'Emergency Activation',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF2563EB),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Shake your phone vigorously or shout "Raksha" to automatically activate SOS',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Quick Actions
              Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 16),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.1,
                children: [
                  _buildModernActionCard(
                    icon: Icons.contacts_rounded,
                    title: 'Emergency\nContacts',
                    color: const Color(0xFF10B981),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ContactsManagementPage(),
                        ),
                      ).then((_) => _loadContacts());
                    },
                  ),
                  _buildModernActionCard(
                    icon: Icons.local_police_rounded,
                    title: 'Nearby\nPolice',
                    color: const Color(0xFF3B82F6),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => NearbyStationsPage(),
                        ),
                      );
                    },
                  ),
                  _buildModernActionCard(
                    icon: Icons.local_hospital_rounded,
                    title: 'Medical\nInfo',
                    color: const Color(0xFFEF4444),
                    onTap: () {
                      _showSnackBar(
                        'Medical info feature coming soon!',
                        const Color(0xFF3B82F6),
                      );
                    },
                  ),
                  _buildModernActionCard(
                    icon: Icons.history_rounded,
                    title: 'Alert\nHistory',
                    color: const Color(0xFF8B5CF6),
                    onTap: () {
                      _showSnackBar(
                        'Alert history feature coming soon!',
                        const Color(0xFF3B82F6),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
