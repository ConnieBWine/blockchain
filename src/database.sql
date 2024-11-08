CREATE TABLE user_settings (
id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT NOT NULL,
notification_preferences TEXT,  -- Changed from JSON to TEXT
theme_preference ENUM('light', 'dark', 'system') DEFAULT 'system',
language_preference VARCHAR(10) DEFAULT 'en',
created_at DATETIME NOT NULL,
updated_at DATETIME NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id),
INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
id INT PRIMARY KEY AUTO_INCREMENT,
email VARCHAR(191) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
name VARCHAR(100) NOT NULL,
phone VARCHAR(20),
avatar_path VARCHAR(255),
rating DECIMAL(3,2) DEFAULT 0.00,
total_ratings INT DEFAULT 0,
join_date DATETIME NOT NULL,
is_verified BOOLEAN DEFAULT FALSE,
last_login DATETIME,
status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
created_at DATETIME NOT NULL,
updated_at DATETIME NOT NULL,
INDEX idx_email (email(191)),
INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vehicles (
id INT PRIMARY KEY AUTO_INCREMENT,
seller_id INT NOT NULL,
title VARCHAR(191) NOT NULL,
make VARCHAR(100) NOT NULL,
model VARCHAR(100) NOT NULL,
year INT NOT NULL,
price DECIMAL(12,2) NOT NULL,
mileage INT,
vin VARCHAR(17),
fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid', 'other'),
transmission ENUM('automatic', 'manual', 'semi-automatic'),
color VARCHAR(50),
body_type VARCHAR(50),
description TEXT,
status ENUM('available', 'pending', 'sold', 'inactive') DEFAULT 'available',
location_city VARCHAR(100),
location_state VARCHAR(100),
location_country VARCHAR(100),
views_count INT DEFAULT 0,
created_at DATETIME NOT NULL,
updated_at DATETIME NOT NULL,
FOREIGN KEY (seller_id) REFERENCES users(id),
INDEX idx_status (status),
INDEX idx_make_model (make(100), model(100)),
INDEX idx_price (price),
INDEX idx_location (location_city(100), location_state(100), location_country(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vehicle_images (
id INT PRIMARY KEY AUTO_INCREMENT,
vehicle_id INT NOT NULL,
image_path VARCHAR(191) NOT NULL,
image_order INT DEFAULT 0,
is_primary BOOLEAN DEFAULT FALSE,
created_at DATETIME NOT NULL,
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
INDEX idx_vehicle_primary (vehicle_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vehicle_listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    make VARCHAR(100),
    model VARCHAR(100),
    year INT,
    mileage INT,
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    color VARCHAR(50),
    location VARCHAR(255),
    sale_type VARCHAR(20),
    auction_duration INT NULL,
    starting_bid DECIMAL(10,2) NULL,
    created_at DATETIME,
    updated_at DATETIME NULL,
    INDEX idx_sale_type (sale_type)
);
CREATE TABLE messages (
id INT PRIMARY KEY AUTO_INCREMENT,
sender_id INT NOT NULL,
receiver_id INT NOT NULL,
vehicle_id INT NOT NULL,
message TEXT NOT NULL,
is_read BOOLEAN DEFAULT FALSE,
created_at DATETIME NOT NULL,
FOREIGN KEY (sender_id) REFERENCES users(id),
FOREIGN KEY (receiver_id) REFERENCES users(id),
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
INDEX idx_conversation (sender_id, receiver_id, vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bookmarks (
id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT NOT NULL,
vehicle_id INT NOT NULL,
created_at DATETIME NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
UNIQUE KEY unique_bookmark (user_id, vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ratings (
id INT PRIMARY KEY AUTO_INCREMENT,
rater_id INT NOT NULL,
rated_user_id INT NOT NULL,
vehicle_id INT NOT NULL,
rating INT NOT NULL,
comment TEXT,
created_at DATETIME NOT NULL,
FOREIGN KEY (rater_id) REFERENCES users(id),
FOREIGN KEY (rated_user_id) REFERENCES users(id),
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
UNIQUE KEY unique_rating (rater_id, rated_user_id, vehicle_id),
CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE service_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    vin VARCHAR(17) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    mileage INT NOT NULL,
    document_paths TEXT,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_vin (vin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Add to your database
ALTER TABLE vehicles ADD INDEX idx_vehicle_id (id);
ALTER TABLE service_records ADD INDEX idx_vehicle_id_created (vehicle_id, created_at);
ALTER TABLE vehicle_images ADD INDEX idx_vehicle_id (vehicle_id);