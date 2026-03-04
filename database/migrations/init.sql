-- CineBook Database Schema
-- Milestone 1: users, movies, halls, screenings

CREATE DATABASE IF NOT EXISTS cinebook_db;
USE cinebook_db;

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile_number VARCHAR(20) NULL,
    gender ENUM('Male', 'Female', 'Other') NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: movies
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS movies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    genre VARCHAR(255) NULL,
    category ENUM('2D', '3D', 'IMAX') NOT NULL DEFAULT '2D',
    language VARCHAR(100) NULL,
    duration_mins INT NULL,
    release_date DATE NULL,
    poster_url VARCHAR(500) NULL,
    rating VARCHAR(10) NULL,
    status ENUM('now_showing', 'coming_soon') NOT NULL DEFAULT 'now_showing',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: halls
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS halls (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: screenings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS screenings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT UNSIGNED NOT NULL,
    hall_id BIGINT UNSIGNED NOT NULL,
    start_time TIME NOT NULL,
    show_date DATE NOT NULL,
    available_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Seed: Admin user
-- Password is 'admin123' (bcrypt hashed)
-- --------------------------------------------------------
INSERT INTO users (name, email, password, role) VALUES (
    'Admin',
    'admin@cinebook.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'
);

-- --------------------------------------------------------
-- Seed: Halls
-- --------------------------------------------------------
INSERT INTO halls (name, capacity) VALUES
    ('Hall 1', 100),
    ('Hall 2', 80),
    ('Hall 3', 120);