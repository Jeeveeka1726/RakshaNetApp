class Contact {
  final String id;
  final String name;
  final String phone;
  final String relationship;
  final bool isVerified;
  final DateTime createdAt;

  Contact({
    required this.id,
    required this.name,
    required this.phone,
    required this.relationship,
    required this.isVerified,
    required this.createdAt,
  });

  factory Contact.fromJson(Map<String, dynamic> json) {
    return Contact(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
      relationship: json['relationship'],
      isVerified: json['isVerified'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'relationship': relationship,
      'isVerified': isVerified,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
