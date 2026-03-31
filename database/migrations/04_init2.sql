USE cinebook_db;

CREATE TABLE IF NOT EXISTS theaters (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    address    VARCHAR(500) NOT NULL,
    city       VARCHAR(100) NOT NULL DEFAULT 'Dhaka',
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seats (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hall_id     BIGINT UNSIGNED NOT NULL,
    row_label   VARCHAR(5)  NOT NULL,
    seat_number INT         NOT NULL,
    seat_type   ENUM('standard', 'semi_recliner', 'premium', 'vip') NOT NULL DEFAULT 'standard',
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_seat (hall_id, row_label, seat_number),
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
    id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_group_id VARCHAR(36)  NOT NULL,
    user_id          BIGINT UNSIGNED NOT NULL,
    screening_id     BIGINT UNSIGNED NOT NULL,
    seat_id          BIGINT UNSIGNED NOT NULL,
    seat_label       VARCHAR(10)  NOT NULL,
    seat_type        ENUM('standard', 'semi_recliner', 'premium', 'vip') NOT NULL,
    price            INT          NOT NULL,
    status           ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_booking (screening_id, seat_id),
    FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id)      REFERENCES seats(id)      ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seat_locks (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    screening_id BIGINT UNSIGNED NOT NULL,
    seat_id      BIGINT UNSIGNED NOT NULL,
    user_id      BIGINT UNSIGNED NOT NULL,
    locked_until TIMESTAMP      NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_lock (screening_id, seat_id),
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id)      REFERENCES seats(id)      ON DELETE CASCADE,
    FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE
);