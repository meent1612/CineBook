USE cinebook_db;
GO

IF NOT EXISTS (SELECT 1 FROM users)
BEGIN
    INSERT INTO users (name, email, mobile_number, gender, password, role) VALUES 
    ('Admin','admin.cinebook@gmail.com','+8801836329304','Female','$2y$10$yHSRC.rS0qpGc06afjQJI.6n2WSd0azhKyjsQYSO4O5K6UeehbdLq','admin'),

    ('Farin','farin.cse.20230104001@aust.edu','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Akif','akif.cse.20230104005@aust.edu','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Shahadat','shahadat.cse.20230104008@aust.edu','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Anika','anika.cse.20230104018@aust.edu','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Rahnuma','rahnuma.cse.20230104028@aust.edu','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Farzana','farzana.cse.20230104032@aust.edu','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Shayma','shayma.cse.20230104043@aust.edu','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Zumaina','zumaina.cse.20220204020@aust.edu','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    
    ('Rahnuma Azra Mahjabin','mahjabin3619@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Farzana Mim','mimmysha1417@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Shayma Sharmeen','sshayma1612@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Farin Maisha','farinmaishaa110@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Anika','sultanaanika131@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    
    ('Zumaina Tahsin','zumainatahsincat@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Tahsin','tahsin.011820283243@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Sakina Anwar','sakinaanwar667@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('ZT','zumaina.t.22@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'); 
END
GO

-- theaters must be seeded before halls
IF NOT EXISTS (SELECT 1 FROM theaters)
BEGIN
    INSERT INTO theaters (name, address, city, is_active) VALUES
    ('Dhanmondi',   'Road 27, Dhanmondi, Dhaka',            'Dhaka', 1),
    ('Shantinagar', 'Shantinagar Road, Shantinagar, Dhaka', 'Dhaka', 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM halls)
BEGIN
    INSERT INTO halls (name, capacity, theater_id) VALUES
    ('Hall 1', 397, 1),
    ('Hall 2', 427,  1),
    ('Hall 3', 457, 1),
    ('Hall 1', 397, 2),
    ('Hall 2', 427,  2),
    ('Hall 3', 457, 2);
END
GO

IF NOT EXISTS (SELECT 1 FROM movies)
BEGIN
    INSERT INTO movies (title, description, genre, category, language, duration_mins, release_date, poster_url, carasol_url, trailer_url, status, is_active) VALUES
    (
        'Avatar: Fire and Ash',
        'The next chapter in the Avatar saga.',
        'Action, Fantasy, Adventure',
        '3D',
        'English',
        150,
        '2025-12-19',
        '/posters/avatar.jpg',
        '/carasols/avatar_carasol.jpg',
        'https://youtu.be/nb_fFj_0rq8?si=yNL5337zQUzm7Q3J',
        'now_showing',
        1
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
        '/carasols/anaconda_carasol.jpg',
        'https://youtu.be/az8M5Mai0X4?si=VzV9ghsMMP_BOm8b',
        'now_showing',
        1
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
        '/carasols/rajnoitik_carasol.jpg',
        'https://youtu.be/pHHttaMky2o?si=fJkZQ1k3fsQ6zCFh',
        'now_showing',
        1
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
        '/carasols/sultana_carasol.jpg',
        'https://youtu.be/B0ObVv3QYag?si=f9v8EB_htD5Lx205',
        'now_showing',
        1
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
        '/carasols/spongebob_carasol.jpg',
        'https://youtu.be/XdPt8QWTypI?si=2QXY_D87awvZEoJ5',
        'now_showing',
        1
    ),
    (
        'Crime 101',
        'A detective hunts a meticulous freeway jewel thief..',
        'Thriller',
        '2D',
        'English',
        139,
        '2026-02-13',
        '/posters/crime101.jpg',
        '/carasols/crime101_carasol.jpg',
        'https://www.youtube.com/watch?v=f5y-cziwmMw',
        'now_showing',
        1
    ),
    (
        'Domm',
        'A man fights for survival against abductors to reunite with his family in this true-story thriller. ',
        'Thriller',
        '2D',
        'Bangla',
        139,
        '2026-03-21',
        '/posters/domm.jpg',
        '/carasols/domm_carasol.jpg',
        'https://www.youtube.com/watch?v=lK01xRLuo54',
        'now_showing',
        1
    ),
    (
        'Project Hail Mary',
        'A science teacher wakes up alone on a spaceship. As his memory returns, he uncovers a mission to stop a mysterious substance killing Earths sun and that an unexpected friendship may be the key.',
        'Sci-Fi',
        '2D',
        'English',
        156,
        '2026-03-27',
        '/posters/projecthailmary.jpg',
        '/carasols/projecthailmary_carasol.jpg',
        'https://www.youtube.com/watch?v=m08TxIsFTRI',
        'now_showing',
        1
    ),
    (
        'The Super Mario Galaxy Movie',
        'Mario ventures into space, exploring cosmic worlds and tackling galactic challenges far from the familiar Mushroom Kingdom.',
        'Adventure,Animation',
        '3D',
        'English',
        99,
        '2026-04-01',
        '/posters/supermario.jpg',
        '/carasols/supermario_carasol.jpg',
        'https://www.youtube.com/watch?v=GuCejewteF8',
        'now_showing',
        1
    ),
    (
        'Bonolota Express',
        'On a foggy winter night, strangers with secrets collide aboard the Bonolota Express. Personal and political crises erupt, revealing hidden grief, moral decay, and unexpected compassion. By dawn, passengers emerge forever changed.',
        'Drama',
        '2D',
        'Bangla',
        150,
        '2025-12-19',
        '/posters/bonolotaexpress.jpg',
        '/carasols/bonolotaexpress_carasol.jpg',
        'https://www.youtube.com/watch?v=ZTZUaHsfR8o',
        'coming_soon',
        1
    );
END
GO