-- Update the role enum to include ADMIN
ALTER TABLE users MODIFY COLUMN role ENUM('STORE_OWNER', 'CUSTOMER', 'ADMIN') NOT NULL;
