USE cinebook_db;

CREATE TABLE IF NOT EXISTS seats (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hall_id     BIGINT UNSIGNED NOT NULL,
    row_label   VARCHAR(5)  NOT NULL,
    seat_number INT         NOT NULL,
    seat_type   ENUM('standard', 'semi_recliner', 'premium', 'vip') NOT NULL DEFAULT 'standard',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_seat (hall_id, row_label, seat_number),
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);