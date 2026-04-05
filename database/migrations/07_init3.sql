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