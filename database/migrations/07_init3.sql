USE cinebook_db;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contact_messages' AND xtype='U')
CREATE TABLE contact_messages (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id    BIGINT        NOT NULL,
    name       NVARCHAR(255) NOT NULL,
    email      NVARCHAR(255) NOT NULL,
    subject    NVARCHAR(255) NOT NULL,
    message    NVARCHAR(MAX) NOT NULL,
    is_read    BIT           NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='discounts' AND xtype='U')
CREATE TABLE discounts (
    id                BIGINT IDENTITY(1,1) PRIMARY KEY,
    name              NVARCHAR(100) NOT NULL,
    theater_id        BIGINT        NOT NULL,
    standard_pct      INT           NOT NULL DEFAULT 0 CHECK (standard_pct BETWEEN 0 AND 100),
    semi_recliner_pct INT           NOT NULL DEFAULT 0 CHECK (semi_recliner_pct BETWEEN 0 AND 100),
    premium_pct       INT           NOT NULL DEFAULT 0 CHECK (premium_pct BETWEEN 0 AND 100),
    vip_pct           INT           NOT NULL DEFAULT 0 CHECK (vip_pct BETWEEN 0 AND 100),
    start_date        DATE          NOT NULL,
    end_date          DATE          NOT NULL,
    is_active         BIT           NOT NULL DEFAULT 1,
    created_at        DATETIME2 DEFAULT GETDATE(),
    updated_at        DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE NO ACTION
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='otp_codes' AND xtype='U')
CREATE TABLE otp_codes (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    email      NVARCHAR(255) NOT NULL,
    code       NVARCHAR(6)   NOT NULL,
    expires_at DATETIME2     NOT NULL,
    used       BIT           NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO