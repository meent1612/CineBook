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


INSERT INTO movies (title, description, genre, category, language, duration_mins, release_date, poster_url,trailer_url, status, is_active) VALUES
(
    'Avatar: Fire and Ash',
    'The next chapter in the Avatar saga.',
    'Action, Fantasy, Adventure',
    '2D',
    'English',
     150,
    '2025-12-19',
    '/posters/avatar.jpg',
    'https://youtu.be/nb_fFj_0rq8?si=yNL5337zQUzm7Q3J',
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
    '/posters/avatar.jpg',
    'https://youtu.be/nb_fFj_0rq8?si=yNL5337zQUzm7Q3J',
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
    '/posters/anaconda.jpg',
    'https://youtu.be/az8M5Mai0X4?si=VzV9ghsMMP_BOm8b',
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
    '/posters/rajnoitik.jpeg',
    'https://youtu.be/pHHttaMky2o?si=fJkZQ1k3fsQ6zCFh',
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
    '/posters/sultana.jpg',
    'https://youtu.be/B0ObVv3QYag?si=f9v8EB_htD5Lx205',
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
    '/posters/spongebob.jpg',
    'https://youtu.be/XdPt8QWTypI?si=2QXY_D87awvZEoJ5',
    'now_showing',
    true
);
