IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'cinebook_db')
    CREATE DATABASE cinebook_db;
GO
USE cinebook_db;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    mobile_number NVARCHAR(20) NULL,
    gender NVARCHAR(10) NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='movies' AND xtype='U')
CREATE TABLE movies (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    genre NVARCHAR(255) NULL,
    category NVARCHAR(5) NOT NULL DEFAULT '2D' CHECK (category IN ('2D', '3D')),
    language NVARCHAR(100) NOT NULL DEFAULT 'English',
    duration_mins INT NULL,
    release_date DATE NULL,
    poster_url NVARCHAR(500) NULL,
    trailer_url NVARCHAR(500) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'now_showing' CHECK (status IN ('now_showing', 'coming_soon')),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='halls' AND xtype='U')
CREATE TABLE halls (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='screenings' AND xtype='U')
CREATE TABLE screenings (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    hall_id BIGINT NOT NULL,
    start_time TIME NOT NULL,
    show_date DATE NOT NULL,
    available_seats INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);
GO