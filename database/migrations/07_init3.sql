USE cinebook_db;

CREATE TABLE IF NOT EXISTS contact_messages (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    subject    VARCHAR(255) NOT NULL,
    message    TEXT         NOT NULL,
    is_read    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS discounts (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    theater_id        BIGINT       NOT NULL,
    standard_pct      INT          NOT NULL DEFAULT 0 CHECK (standard_pct BETWEEN 0 AND 100),
    semi_recliner_pct INT          NOT NULL DEFAULT 0 CHECK (semi_recliner_pct BETWEEN 0 AND 100),
    premium_pct       INT          NOT NULL DEFAULT 0 CHECK (premium_pct BETWEEN 0 AND 100),
    vip_pct           INT          NOT NULL DEFAULT 0 CHECK (vip_pct BETWEEN 0 AND 100),
    start_date        DATE         NOT NULL,
    end_date          DATE         NOT NULL,
    is_active         TINYINT(1)   NOT NULL DEFAULT 1,
    created_at        DATETIME DEFAULT NOW(),
    updated_at        DATETIME DEFAULT NOW(),
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS otp_codes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    code       VARCHAR(6)   NOT NULL,
    expires_at DATETIME     NOT NULL,
    used       TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT NOW()
);