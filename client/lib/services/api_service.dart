import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

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
        Uri.parse('https://rakshanetapp.onrender.com/send-sms'),
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
        Uri.parse('https://rakshanetapp.onrender.com/make-call'),
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
}
