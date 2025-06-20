import 'package:flutter/material.dart';
import 'dashboard_page.dart';
import 'services/api_service.dart';

class EmergencyContactsPage extends StatefulWidget {
  final VoidCallback toggleTheme;

  const EmergencyContactsPage({super.key, required this.toggleTheme});

  @override
  State<EmergencyContactsPage> createState() => _EmergencyContactsPageState();
}

class _EmergencyContactsPageState extends State<EmergencyContactsPage> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _relationshipController = TextEditingController();
  final _otpController = TextEditingController();
  final List<Map<String, dynamic>> _contacts = [];
  bool _showOtpField = false;
  bool _isVerifying = false;
  bool _isLoading = false;
  String _currentPhone = '';

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _relationshipController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _sendOtp() async {
    if (_phoneController.text.isEmpty || 
        _nameController.text.isEmpty || 
        _relationshipController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill all fields'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final result = await ApiService.sendOtp(_phoneController.text.trim());

      setState(() {
        _isLoading = false;
      });

      if (result['success']) {
        setState(() {
          _currentPhone = _phoneController.text.trim();
          _showOtpField = true;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('OTP sent successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['error'] ?? 'Failed to send OTP'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _verifyOtp() async {
    if (_otpController.text.length != 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid 4-digit OTP'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isVerifying = true;
    });

    try {
      // First verify OTP
      final verifyResult = await ApiService.verifyOtp(
        _currentPhone, 
        _otpController.text
      );

      if (verifyResult['success']) {
        // Then add contact
        final addResult = await ApiService.addContact(
          name: _nameController.text.trim(),
          phone: _currentPhone,
          relationship: _relationshipController.text.trim(),
        );

        setState(() {
          _isVerifying = false;
        });

        if (addResult['success']) {
          setState(() {
            _contacts.add({
              'name': _nameController.text.trim(),
              'phone': _currentPhone,
              'relationship': _relationshipController.text.trim(),
            });
            _nameController.clear();
            _phoneController.clear();
            _relationshipController.clear();
            _otpController.clear();
            _showOtpField = false;
            _currentPhone = '';
          });

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Contact verified and added successfully!'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(addResult['error'] ?? 'Failed to add contact'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } else {
        setState(() {
          _isVerifying = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(verifyResult['error'] ?? 'OTP verification failed'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isVerifying = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _removeContact(int index) {
    setState(() {
      _contacts.removeAt(index);
    });
  }

  void _continueToApp() {
    // Always allow continuing to app, even without contacts
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => DashboardPage(toggleTheme: widget.toggleTheme),
      ),
    );
  }

  void _skipForNow() {
    // Allow skipping contact setup
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => DashboardPage(toggleTheme: widget.toggleTheme),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency Contacts'),
        automaticallyImplyLeading: false,
        actions: [
          TextButton(
            onPressed: _skipForNow,
            child: const Text(
              'Skip',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Text(
                'Add Emergency Contacts',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Add trusted contacts who will be notified in case of emergency (Optional)',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.grey[600],
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              if (!_showOtpField) ...[
                // Name Field
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Contact Name',
                    prefixIcon: Icon(Icons.person),
                  ),
                ),
                const SizedBox(height: 16),

                // Phone Number Input
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    prefixIcon: Icon(Icons.phone),
                    hintText: '+1234567890',
                  ),
                ),
                const SizedBox(height: 16),

                // Relationship Field
                TextFormField(
                  controller: _relationshipController,
                  decoration: const InputDecoration(
                    labelText: 'Relationship',
                    prefixIcon: Icon(Icons.family_restroom),
                    hintText: 'e.g., Father, Mother, Friend',
                  ),
                ),
                const SizedBox(height: 16),

                // Send OTP Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _sendOtp,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Send OTP'),
                ),
              ] else ...[
                // OTP Field
                Text(
                  'OTP sent to $_currentPhone',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                
                TextFormField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 4,
                  decoration: const InputDecoration(
                    labelText: 'Enter 4-digit OTP',
                    prefixIcon: Icon(Icons.security),
                    hintText: '1234',
                  ),
                ),
                const SizedBox(height: 16),
                
                ElevatedButton(
                  onPressed: _isVerifying ? null : _verifyOtp,
                  child: _isVerifying
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Verify & Add Contact'),
                ),
                const SizedBox(height: 8),
                
                TextButton(
                  onPressed: () {
                    setState(() {
                      _showOtpField = false;
                      _otpController.clear();
                    });
                  },
                  child: const Text('Cancel'),
                ),
              ],

              const SizedBox(height: 32),

              // Contacts List
              if (_contacts.isNotEmpty) ...[
                Text(
                  'Emergency Contacts',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: ListView.builder(
                    itemCount: _contacts.length,
                    itemBuilder: (context, index) {
                      final contact = _contacts[index];
                      return Card(
                        child: ListTile(
                          leading: const Icon(Icons.person),
                          title: Text(contact['name']),
                          subtitle: Text('${contact['phone']} • ${contact['relationship']}'),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () => _removeContact(index),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ] else
                const Expanded(
                  child: Center(
                    child: Text(
                      'No emergency contacts added yet',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                ),

              // Continue Button
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _continueToApp,
                child: Text(_contacts.isNotEmpty ? 'Continue to App' : 'Continue Without Contacts'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
