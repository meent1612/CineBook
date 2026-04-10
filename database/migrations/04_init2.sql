USE cinebook_db;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='seats' AND xtype='U')
CREATE TABLE seats (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    hall_id     BIGINT       NOT NULL,
    row_label   NVARCHAR(5)  NOT NULL,
    seat_number INT          NOT NULL,
    seat_type   NVARCHAR(20) NOT NULL DEFAULT 'standard'
                CHECK (seat_type IN ('standard', 'semi_recliner', 'premium', 'vip')),
    is_active   BIT          NOT NULL DEFAULT 1,
    created_at  DATETIME2 DEFAULT GETDATE(),
    updated_at  DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT unique_seat UNIQUE (hall_id, row_label, seat_number),
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bookings' AND xtype='U')
CREATE TABLE bookings (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_group_id NVARCHAR(36) NOT NULL,
    user_id          BIGINT       NOT NULL,
    screening_id     BIGINT       NOT NULL,
    seat_id          BIGINT       NOT NULL,
    seat_label       NVARCHAR(10) NOT NULL,
    seat_type        NVARCHAR(20) NOT NULL CHECK (seat_type IN ('standard', 'semi_recliner', 'premium', 'vip')),
    price            INT          NOT NULL,
    status           NVARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at       DATETIME2 DEFAULT GETDATE(),
    updated_at       DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE NO ACTION,
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE NO ACTION,
    FOREIGN KEY (seat_id)      REFERENCES seats(id)      ON DELETE NO ACTION
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='seat_locks' AND xtype='U')
CREATE TABLE seat_locks (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    screening_id BIGINT    NOT NULL,
    seat_id      BIGINT    NOT NULL,
    user_id      BIGINT    NOT NULL,
    locked_until DATETIME2 NOT NULL,
    created_at   DATETIME2 DEFAULT GETDATE(),
    updated_at   DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT unique_lock UNIQUE (screening_id, seat_id),
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE NO ACTION,
    FOREIGN KEY (seat_id)      REFERENCES seats(id)      ON DELETE NO ACTION,
    FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE NO ACTION
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ticket_prices' AND xtype='U')
CREATE TABLE ticket_prices (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    seat_type  NVARCHAR(20) NOT NULL UNIQUE
               CHECK (seat_type IN ('standard', 'semi_recliner', 'premium', 'vip')),
    price      INT          NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='payments' AND xtype='U')
CREATE TABLE payments (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_group_id NVARCHAR(36) NOT NULL,
    user_id          BIGINT       NOT NULL,
    amount           INT          NOT NULL,
    method           NVARCHAR(20) NOT NULL DEFAULT 'bkash'
                     CHECK (method IN ('bkash', 'nagad', 'card')),
    transaction_id   NVARCHAR(50)  NULL,
    status           NVARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'completed', 'failed')),
    paid_at          DATETIME2    NULL,
    created_at       DATETIME2 DEFAULT GETDATE(),
    updated_at       DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
);
GO