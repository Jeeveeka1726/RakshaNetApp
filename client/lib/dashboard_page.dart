import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
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
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
    
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
          _contacts = (result['data']['contacts'] as List)
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
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
      ),
    );
  }

  void _activateSOS() async {
    // Navigate to enhanced SOS page
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EnhancedSOSPage(),
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

  void _testVoiceDetection() async {
    try {
      final result = await ApiService.triggerVoiceSos();
      if (result['success']) {
        _showSnackBar('Voice SOS triggered successfully!', Colors.green);
      } else {
        _showSnackBar(result['error'] ?? 'Failed to trigger voice SOS', Colors.red);
      }
    } catch (e) {
      _showSnackBar('Error: ${e.toString()}', Colors.red);
    }
  }

  void _testMotionDetection() async {
    try {
      final result = await ApiService.triggerMotionSos();
      if (result['success']) {
        _showSnackBar('Motion SOS triggered successfully!', Colors.green);
      } else {
        _showSnackBar(result['error'] ?? 'Failed to trigger motion SOS', Colors.red);
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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('RakshaNet'),
        automaticallyImplyLeading: false,
        actions: [
          // Service status indicator
          Container(
            margin: const EdgeInsets.only(right: 8),
            child: Row(
              children: [
                Icon(
                  _serviceRunning ? Icons.security : Icons.security_outlined,
                  color: _serviceRunning ? Colors.green : Colors.orange,
                  size: 20,
                ),
                const SizedBox(width: 4),
                Text(
                  _serviceRunning ? 'Protected' : 'Offline',
                  style: TextStyle(
                    fontSize: 12,
                    color: _serviceRunning ? Colors.green : Colors.orange,
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
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'test_voice',
                child: Row(
                  children: [
                    Icon(Icons.mic),
                    SizedBox(width: 8),
                    Text('Test Voice SOS'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'test_motion',
                child: Row(
                  children: [
                    Icon(Icons.vibration),
                    SizedBox(width: 8),
                    Text('Test Motion SOS'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'refresh_service',
                child: Row(
                  children: [
                    Icon(Icons.refresh),
                    SizedBox(width: 8),
                    Text('Refresh Service Status'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'refresh_contacts',
                child: Row(
                  children: [
                    Icon(Icons.contacts),
                    SizedBox(width: 8),
                    Text('Refresh Contacts'),
                  ],
                ),
              ),
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

              // Emergency Contacts Summary
              if (_contacts.isNotEmpty)
                Card(
                  color: Colors.green[50],
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        Icon(
                          Icons.contacts,
                          color: Colors.green[700],
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            '${_contacts.length} emergency contact${_contacts.length == 1 ? '' : 's'} configured',
                            style: TextStyle(
                              color: Colors.green[700],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        if (_isLoadingContacts)
                          SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation(Colors.green[700]),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 16),

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

              // Info Cards
              Card(
                color: Colors.blue[50],
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info,
                        color: Colors.blue[700],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Shake your phone or shout "Raksha" to auto-activate SOS',
                          style: TextStyle(
                            color: Colors.blue[700],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),
              
              // Service Status Card
              Card(
                color: _serviceRunning ? Colors.green[50] : Colors.orange[50],
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Icon(
                        _serviceRunning ? Icons.check_circle : Icons.warning,
                        color: _serviceRunning ? Colors.green[700] : Colors.orange[700],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _serviceRunning 
                            ? 'Background monitoring is active'
                            : 'Background monitoring is offline',
                          style: TextStyle(
                            color: _serviceRunning ? Colors.green[700] : Colors.orange[700],
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
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ContactsManagementPage(),
                          ),
                        ).then((_) => _loadContacts()); // Refresh contacts when returning
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.local_police,
                      title: 'Nearby\nPolice',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => NearbyStationsPage(),
                          ),
                        );
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.local_hospital,
                      title: 'Medical\nInfo',
                      onTap: () {
                        _showSnackBar('Medical info feature coming soon!', Colors.blue);
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.history,
                      title: 'Alert\nHistory',
                      onTap: () {
                        _showSnackBar('Alert history feature coming soon!', Colors.blue);
                      },
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
