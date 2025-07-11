import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'firebase_service.dart';

class ApiService {
  static const String baseUrl = 'https://rakshanetapp.onrender.com/api';
  
  // Get stored token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
  
  // Store token
  static Future<void> storeToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }
  
  // Remove token
  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }
  
  // Get headers with auth token
  static Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
  
  // Sign up
  static Future<Map<String, dynamic>> signUp({
    required String name,
    required String email,
    required String password,
    int? age,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          if (age != null) 'age': age,
        }),
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 201 && data['success']) {
        // Store token
        await storeToken(data['data']['accessToken']);
      }
      
      return data;
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Sign in
  static Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/signin'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200 && data['success']) {
        // Store token
        await storeToken(data['data']['accessToken']);
      }
      
      return data;
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Send OTP
  static Future<Map<String, dynamic>> sendOtp(String phone) async {
    try {
      final headers = await getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/contacts/send-otp'),
        headers: headers,
        body: jsonEncode({'phone': phone}),
      );
      
      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Verify OTP
  static Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    try {
      final headers = await getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/contacts/verify-otp'),
        headers: headers,
        body: jsonEncode({
          'phone': phone,
          'otp': otp,
        }),
      );
      
      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Add emergency contact
  static Future<Map<String, dynamic>> addContact({
    required String name,
    required String phone,
    required String relationship,
  }) async {
    try {
      final headers = await getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/contacts'),
        headers: headers,
        body: jsonEncode({
          'name': name,
          'phone': phone,
          'relationship': relationship,
        }),
      );
      
      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Get emergency contacts
  static Future<Map<String, dynamic>> getContacts() async {
    try {
      final headers = await getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/contacts'),
        headers: headers,
      );
      
      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }

  // Get dashboard contacts
  static Future<Map<String, dynamic>> getDashboardContacts() async {
    try {
      final headers = await getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/contacts/dashboard'),
        headers: headers,
      );
      
      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Delete emergency contact
  static Future<Map<String, dynamic>> deleteContact(String contactId) async {
    try {
      final headers = await getHeaders();
      final response = await http.delete(
        Uri.parse('$baseUrl/contacts/$contactId'),
        headers: headers,
      );
      
      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Send SOS SMS
  static Future<Map<String, dynamic>> sendSosSms(String message) async {
    try {
      final headers = await getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/send-sms'),
        headers: headers,
        body: jsonEncode({'message': message}),
      );
      
      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }
  
  // Make SOS call
  static Future<Map<String, dynamic>> makeSosCall(String to, String message) async {
    try {
      final headers = await getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/make-call'),
        headers: headers,
        body: jsonEncode({
          'to': to,
          'message': message,
        }),
      );
      
      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }

  // Trigger Voice SOS
  static Future<Map<String, dynamic>> triggerVoiceSos({double? latitude, double? longitude}) async {
    try {
      final headers = await getHeaders();
      final body = <String, dynamic>{};

      // Include location if provided
      if (latitude != null && longitude != null) {
        body['latitude'] = latitude;
        body['longitude'] = longitude;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/sos/voice'),
        headers: headers,
        body: body.isNotEmpty ? jsonEncode(body) : null,
      );

      final result = jsonDecode(response.body);
      print('Voice SOS response: ${response.body}');

      // If SOS was successful, also store in Firebase and start live tracking
      if (result['success'] == true) {
        try {
          final prefs = await SharedPreferences.getInstance();
          final userId = prefs.getString('userId') ?? '';
          final userName = prefs.getString('userName') ?? 'Unknown User';

          // Store SOS event in Firebase with live location tracking
          await FirebaseService.storeSosEventWithLocation(
            userId: userId,
            userName: userName,
            type: 'voice',
            contactsData: [], // Will be populated from backend response if needed
          );

          print('✅ Voice SOS stored in Firebase and live tracking started');
        } catch (e) {
          print('⚠️ Failed to store SOS in Firebase: $e');
        }
      }

      return result;
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }

  // Trigger Motion SOS
  static Future<Map<String, dynamic>> triggerMotionSos({double? latitude, double? longitude}) async {
    try {
      final headers = await getHeaders();
      final body = <String, dynamic>{};

      // Include location if provided
      if (latitude != null && longitude != null) {
        body['latitude'] = latitude;
        body['longitude'] = longitude;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/sos/motion'),
        headers: headers,
        body: body.isNotEmpty ? jsonEncode(body) : null,
      );

      final result = jsonDecode(response.body);
      print('Motion SOS Response: ${response.body}');

      // If SOS was successful, also store in Firebase and start live tracking
      if (result['success'] == true) {
        try {
          final prefs = await SharedPreferences.getInstance();
          final userId = prefs.getString('userId') ?? '';
          final userName = prefs.getString('userName') ?? 'Unknown User';

          // Store SOS event in Firebase with live location tracking
          await FirebaseService.storeSosEventWithLocation(
            userId: userId,
            userName: userName,
            type: 'motion',
            contactsData: [], // Will be populated from backend response if needed
          );

          print('✅ Motion SOS stored in Firebase and live tracking started');
        } catch (e) {
          print('⚠️ Failed to store SOS in Firebase: $e');
        }
      }

      return result;
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }

  // Check authentication status
  static Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null;
  }

  // Logout
  static Future<void> logout() async {
    await removeToken();
  }
}
