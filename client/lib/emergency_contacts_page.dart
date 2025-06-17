import 'package:flutter/material.dart';
import 'dashboard_page.dart';

class EmergencyContactsPage extends StatefulWidget {
  final VoidCallback toggleTheme;

  const EmergencyContactsPage({super.key, required this.toggleTheme});

  @override
  State<EmergencyContactsPage> createState() => _EmergencyContactsPageState();
}

class _EmergencyContactsPageState extends State<EmergencyContactsPage> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final List<String> _contacts = [];
  bool _showOtpField = false;
  bool _isVerifying = false;
  String _currentPhone = '';

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _addContact() {
    if (_phoneController.text.isNotEmpty) {
      setState(() {
        _currentPhone = _phoneController.text;
        _showOtpField = true;
      });
    }
  }

  void _verifyOtp() async {
    if (_otpController.text.length == 4) {
      setState(() {
        _isVerifying = true;
      });

      // Simulate OTP verification
      await Future.delayed(const Duration(seconds: 2));

      setState(() {
        _isVerifying = false;
        _contacts.add(_currentPhone);
        _phoneController.clear();
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
    }
  }

  void _removeContact(int index) {
    setState(() {
      _contacts.removeAt(index);
    });
  }

  void _continueToApp() {
    if (_contacts.isNotEmpty) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => DashboardPage(toggleTheme: widget.toggleTheme),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please add at least one emergency contact'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency Contacts'),
        automaticallyImplyLeading: false,
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
                'Add trusted contacts who will be notified in case of emergency',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.grey[600],
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Phone Number Input
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                  prefixIcon: Icon(Icons.phone),
                  hintText: '+1234567890',
                ),
                enabled: !_showOtpField,
              ),
              const SizedBox(height: 16),

              // Add/Verify Button
              if (!_showOtpField)
                ElevatedButton(
                  onPressed: _addContact,
                  child: const Text('Add Contact'),
                )
              else ...[
                // OTP Field
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
                      : const Text('Verify'),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _showOtpField = false;
                      _phoneController.clear();
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
                      return Card(
                        child: ListTile(
                          leading: const Icon(Icons.person),
                          title: Text(_contacts[index]),
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
                child: const Text('Continue to App'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
