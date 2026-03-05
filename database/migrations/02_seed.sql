USE cinebook_db;


INSERT INTO users (name, email, password, role) VALUES (
    'Admin',
    'admin@cinebook.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'
);


INSERT INTO halls (name, capacity) VALUES
    ('Hall 1', 100),
    ('Hall 2', 80),
    ('Hall 3', 120);


INSERT INTO movies (title, description, genre, category, language, duration_mins, release_date, poster_url, rating, status, is_active) VALUES
(
    'Avatar: Fire and Ash',
    'The next chapter in the Avatar saga.',
    'Action, Fantasy, Adventure',
    '2D',
    'English',
    150,
    '2025-12-19',
    'https://image.tmdb.org/t/p/w1280/cKtDJiU5zjcnDnRTzYpQ5xScKvU.jpg',
    'PG-13',
    'now_showing',
    true
),
(
    'Avatar: Fire and Ash',
    'The next chapter in the Avatar saga.',
    'Action, Fantasy, Adventure',
    '3D',
    'English',
    150,
    '2025-12-19',
    'https://image.tmdb.org/t/p/w1280/cKtDJiU5zjcnDnRTzYpQ5xScKvU.jpg',
    'PG-13',
    'now_showing',
    true
),
(
    'Anaconda',
    'A deadly anaconda terrorizes a group of explorers.',
    'Action, Horror, Adventure',
    '2D',
    'English',
    120,
    '2025-01-25',
    'https://image.tmdb.org/t/p/w1280/AnKpSxBVQSMNFkCELMXLfJMoGj.jpg',
    'R',
    'now_showing',
    true
),
(
    'Ekhane Rajnoitik Alap Joruri',
    'A political drama set in modern Bangladesh.',
    'Drama',
    '2D',
    'Bangla',
    130,
    '2026-01-16',
    '',
    NULL,
    'now_showing',
    true
),
(
    'Sultana''s Dream',
    'An animated adaptation of the classic Bengali feminist story.',
    'Drama, Animation',
    '2D',
    'English',
    110,
    '2026-01-10',
    '',
    NULL,
    'now_showing',
    true
),
(
    'The SpongeBob Movie: Search for SquarePants',
    'SpongeBob goes on an epic adventure.',
    'Animation, Comedy, Adventure',
    '2D',
    'English',
    95,
    '2025-12-25',
    '',
    NULL,
    'now_showing',
    true
);