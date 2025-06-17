import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'models/contact.dart';

class ContactsManagementPage extends StatefulWidget {
  @override
  State<ContactsManagementPage> createState() => _ContactsManagementPageState();
}

class _ContactsManagementPageState extends State<ContactsManagementPage> {
  List<Contact> _contacts = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadContacts();
  }

  Future<void> _loadContacts() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final result = await ApiService.getContacts();
      if (result['success']) {
        setState(() {
          _contacts = (result['data']['contacts'] as List)
              .map((contact) => Contact.fromJson(contact))
              .toList();
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['error'] ?? 'Failed to load contacts'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteContact(String contactId, String contactName) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Contact'),
        content: Text('Are you sure you want to delete $contactName?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final result = await ApiService.deleteContact(contactId);
        if (result['success']) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Contact deleted successfully'),
              backgroundColor: Colors.green,
            ),
          );
          _loadContacts(); // Refresh the list
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['error'] ?? 'Failed to delete contact'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showAddContactDialog() {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final relationshipController = TextEditingController();
    final otpController = TextEditingController();
    bool showOtpField = false;
    bool isLoading = false;
    String currentPhone = '';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Emergency Contact'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!showOtpField) ...[
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'Name',
                      prefixIcon: Icon(Icons.person),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      labelText: 'Phone Number',
                      prefixIcon: Icon(Icons.phone),
                      hintText: '+1234567890',
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: relationshipController,
                    decoration: const InputDecoration(
                      labelText: 'Relationship',
                      prefixIcon: Icon(Icons.family_restroom),
                      hintText: 'e.g., Father, Mother, Friend',
                    ),
                  ),
                ] else ...[
                  Text('OTP sent to $currentPhone'),
                  const SizedBox(height: 16),
                  TextField(
                    controller: otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 4,
                    decoration: const InputDecoration(
                      labelText: 'Enter OTP',
                      prefixIcon: Icon(Icons.security),
                    ),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            if (!showOtpField)
              ElevatedButton(
                onPressed: isLoading ? null : () async {
                  if (nameController.text.isEmpty ||
                      phoneController.text.isEmpty ||
                      relationshipController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Please fill all fields'),
                        backgroundColor: Colors.orange,
                      ),
                    );
                    return;
                  }

                  setDialogState(() {
                    isLoading = true;
                  });

                  try {
                    final result = await ApiService.sendOtp(phoneController.text.trim());
                    if (result['success']) {
                      setDialogState(() {
                        currentPhone = phoneController.text.trim();
                        showOtpField = true;
                        isLoading = false;
                      });
                    } else {
                      setDialogState(() {
                        isLoading = false;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(result['error'] ?? 'Failed to send OTP'),
                          backgroundColor: Colors.red,
                        ),
                      );
                    }
                  } catch (e) {
                    setDialogState(() {
                      isLoading = false;
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Error: ${e.toString()}'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                },
                child: isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Send OTP'),
              )
            else
              ElevatedButton(
                onPressed: isLoading ? null : () async {
                  if (otpController.text.length != 4) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Please enter a valid 4-digit OTP'),
                        backgroundColor: Colors.orange,
                      ),
                    );
                    return;
                  }

                  setDialogState(() {
                    isLoading = true;
                  });

                  try {
                    // Verify OTP
                    final verifyResult = await ApiService.verifyOtp(
                      currentPhone,
                      otpController.text,
                    );

                    if (verifyResult['success']) {
                      // Add contact
                      final addResult = await ApiService.addContact(
                        name: nameController.text.trim(),
                        phone: currentPhone,
                        relationship: relationshipController.text.trim(),
                      );

                      if (addResult['success']) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Contact added successfully!'),
                            backgroundColor: Colors.green,
                          ),
                        );
                        _loadContacts(); // Refresh the list
                      } else {
                        setDialogState(() {
                          isLoading = false;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(addResult['error'] ?? 'Failed to add contact'),
                            backgroundColor: Colors.red,
                          ),
                        );
                      }
                    } else {
                      setDialogState(() {
                        isLoading = false;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(verifyResult['error'] ?? 'OTP verification failed'),
                          backgroundColor: Colors.red,
                        ),
                      );
                    }
                  } catch (e) {
                    setDialogState(() {
                      isLoading = false;
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Error: ${e.toString()}'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                },
                child: isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Verify & Add'),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency Contacts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showAddContactDialog,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _contacts.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.contacts,
                        size: 64,
                        color: Colors.grey,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'No emergency contacts yet',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Tap the + button to add contacts',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadContacts,
                  child: ListView.builder(
                    itemCount: _contacts.length,
                    itemBuilder: (context, index) {
                      final contact = _contacts[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Theme.of(context).primaryColor,
                            child: Text(
                              contact.name[0].toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          title: Text(
                            contact.name,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(contact.phone),
                              Text(
                                contact.relationship,
                                style: TextStyle(
                                  color: Theme.of(context).primaryColor,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (contact.isVerified)
                                const Icon(
                                  Icons.verified,
                                  color: Colors.green,
                                  size: 20,
                                ),
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                onPressed: () => _deleteContact(contact.id, contact.name),
                              ),
                            ],
                          ),
                          isThreeLine: true,
                        ),
                      );
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddContactDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}
