class User {
  final String id;
  final String name;
  final String email;
  final int? age;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.age,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      age: json['age'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'age': age,
    };
  }
}
