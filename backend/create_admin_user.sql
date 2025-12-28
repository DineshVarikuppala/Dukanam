-- Create Admin User
-- Note: Password 'Admin@123' is hashed using BCrypt
-- You can generate the hash using: https://bcrypt-generator.com/ or Spring's BCryptPasswordEncoder

INSERT INTO users (first_name, last_name, email, mobile_number, password, role, email_notifications_enabled, created_at)
VALUES (
    'Admin',
    'User',
    'Admin@123',
    '1234567890',
    '$2a$10$YourBCryptHashedPasswordHere',  -- Replace with actual BCrypt hash of 'Admin@123'
    'ADMIN',
    true,
    NOW()
);

-- To generate the BCrypt hash programmatically in Java:
-- BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
-- String hashedPassword = encoder.encode("Admin@123");
