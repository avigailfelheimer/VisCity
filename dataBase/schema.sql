CREATE DATABASE IF NOT EXISTS travel_app;
USE travel_app;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS review_helpful;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS favorite_folders;
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS credentials;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

----------------------------------------------------
-- USERS
----------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    user_type VARCHAR(20) NOT NULL,
    CHECK (user_type IN ('user', 'admin'))
);

----------------------------------------------------
-- CREDENTIALS
----------------------------------------------------
CREATE TABLE credentials (
    user_id INT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

----------------------------------------------------
-- PLACES
----------------------------------------------------
CREATE TABLE places (
    place_id INT AUTO_INCREMENT PRIMARY KEY,
    created_by INT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    categories JSON NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    google_place_id VARCHAR(255),
    opening_hours JSON,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

----------------------------------------------------
-- FAVORITE FOLDERS
----------------------------------------------------
CREATE TABLE favorite_folders (
    folder_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

----------------------------------------------------
-- FAVORITES
----------------------------------------------------
CREATE TABLE favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    place_id INT NOT NULL,
    folder_id INT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, place_id),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (place_id)
        REFERENCES places(place_id)
        ON DELETE CASCADE,

    FOREIGN KEY (folder_id)
        REFERENCES favorite_folders(folder_id)
        ON DELETE SET NULL
);

----------------------------------------------------
-- REVIEWS
----------------------------------------------------
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    place_id INT NOT NULL,
    rating INT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (place_id)
        REFERENCES places(place_id)
        ON DELETE CASCADE
);

----------------------------------------------------
-- REVIEW HELPFUL
----------------------------------------------------
CREATE TABLE review_helpful (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    vote ENUM('up', 'down') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_vote (review_id, user_id),

    FOREIGN KEY (review_id)
        REFERENCES reviews(review_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

----------------------------------------------------
-- MEDIA
----------------------------------------------------
CREATE TABLE media (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    place_id INT NULL,
    user_id INT NULL,
    media_type VARCHAR(20) NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (media_type IN ('image', 'video', 'audio')),

    FOREIGN KEY (place_id)
        REFERENCES places(place_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);