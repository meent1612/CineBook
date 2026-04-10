USE cinebook_db;

CREATE TABLE IF NOT EXISTS seats (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    hall_id     BIGINT      NOT NULL,
    row_label   VARCHAR(5)  NOT NULL,
    seat_number INT         NOT NULL,
    seat_type   VARCHAR(20) NOT NULL DEFAULT 'standard'
                CHECK (seat_type IN ('standard', 'semi_recliner', 'premium', 'vip')),
    is_active   TINYINT(1)  NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT NOW(),
    updated_at  DATETIME DEFAULT NOW(),
    CONSTRAINT unique_seat UNIQUE (hall_id, row_label, seat_number),
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_group_id VARCHAR(36) NOT NULL,
    user_id          BIGINT      NOT NULL,
    screening_id     BIGINT      NOT NULL,
    seat_id          BIGINT      NOT NULL,
    seat_label       VARCHAR(10) NOT NULL,
    seat_type        VARCHAR(20) NOT NULL CHECK (seat_type IN ('standard', 'semi_recliner', 'premium', 'vip')),
    price            INT         NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at       DATETIME DEFAULT NOW(),
    updated_at       DATETIME DEFAULT NOW(),
    FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE NO ACTION,
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE NO ACTION,
    FOREIGN KEY (seat_id)      REFERENCES seats(id)      ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS seat_locks (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    screening_id BIGINT   NOT NULL,
    seat_id      BIGINT   NOT NULL,
    user_id      BIGINT   NOT NULL,
    locked_until DATETIME NOT NULL,
    created_at   DATETIME DEFAULT NOW(),
    updated_at   DATETIME DEFAULT NOW(),
    CONSTRAINT unique_lock UNIQUE (screening_id, seat_id),
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE NO ACTION,
    FOREIGN KEY (seat_id)      REFERENCES seats(id)      ON DELETE NO ACTION,
    FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS ticket_prices (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    seat_type  VARCHAR(20) NOT NULL UNIQUE
               CHECK (seat_type IN ('standard', 'semi_recliner', 'premium', 'vip')),
    price      INT         NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_group_id VARCHAR(36) NOT NULL,
    user_id          BIGINT      NOT NULL,
    amount           INT         NOT NULL,
    method           VARCHAR(20) NOT NULL DEFAULT 'bkash'
                     CHECK (method IN ('bkash', 'nagad', 'card')),
    transaction_id   VARCHAR(50) NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'completed', 'failed')),
    paid_at          DATETIME    NULL,
    created_at       DATETIME DEFAULT NOW(),
    updated_at       DATETIME DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
);