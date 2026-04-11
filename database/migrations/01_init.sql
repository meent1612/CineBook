CREATE DATABASE IF NOT EXISTS cinebook_db;
USE cinebook_db;

CREATE TABLE IF NOT EXISTS users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    mobile_number VARCHAR(20)  NULL,
    gender        VARCHAR(10)  NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    password      VARCHAR(255) NOT NULL,
    role          VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at    DATETIME DEFAULT NOW(),
    updated_at    DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movies (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT NULL,
    genre         VARCHAR(255) NULL,
    category      VARCHAR(5)   NOT NULL DEFAULT '2D' CHECK (category IN ('2D', '3D')),
    language      VARCHAR(100) NOT NULL DEFAULT 'English',
    duration_mins INT          NULL,
    release_date  DATE         NULL,
    poster_url    VARCHAR(500) NULL,
    carasol_url   VARCHAR(500) NULL,
    trailer_url   VARCHAR(500) NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'now_showing' CHECK (status IN ('now_showing', 'coming_soon')),
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    DATETIME DEFAULT NOW(),
    updated_at    DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS theaters (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    address    VARCHAR(500) NOT NULL,
    city       VARCHAR(100) NOT NULL DEFAULT 'Dhaka',
    is_active  TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS halls (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    capacity   INT          NOT NULL,
    theater_id BIGINT       NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    CONSTRAINT fk_halls_theater FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS screenings (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id   BIGINT NOT NULL,
    hall_id    BIGINT NOT NULL,
    start_time TIME   NOT NULL,
    show_date  DATE   NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    CONSTRAINT unique_screening UNIQUE (hall_id, show_date, start_time),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (hall_id)  REFERENCES halls(id)  ON DELETE CASCADE
);