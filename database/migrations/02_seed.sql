USE cinebook_db;
GO

IF NOT EXISTS (SELECT 1 FROM users)
BEGIN
    INSERT INTO users (name, email, mobile_number, gender, password, role) VALUES 
    ('Admin','admin@cinebook.com','+8801836329304','Female','$2y$10$yHSRC.rS0qpGc06afjQJI.6n2WSd0azhKyjsQYSO4O5K6UeehbdLq','admin'),
    ('Farin','farin01@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Mugdho','mugdho02@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Nahin','nahin03@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Apurbo','apurbo01@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Akif','akif05@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Auniruddho','auniruddho06@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Arpita','arpita07@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Shahadat','shahadat08@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Ratul','ratul09@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Pantha','pantha10@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Arko','arka11@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Arnab','arnab12@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Taisha','taisha13@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Dhrubo','dhrubo14@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Rianto','rianto15@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Erin','erin16@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Partha','partha17@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Anika','anika18@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Adnan','adnan19@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Tonima','tonima20@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Raihan','raihan21@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Rashedul','rashedul22@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Fuad','fuad23@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Hrittika','hrittika24@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Sajid','sajid25@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Shreoshi','shreoshi26@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Tayeb','tayeb27@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Rahnuma','rahnuma28@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Sporshita','sporshita29@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Ashraful','ashraful30@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Shoaib','shoaib31@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Farzana','farzana32@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Rabeya','rabeya33@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Silvia','silvia34@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Abir','abir35@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Turja','turja36@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Shuvrato','shuvrato37@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Prapty','prapty38@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Fardin','fardin39@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Ishmam','ishmam40@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Tanjim','tanjim41@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Ratul','ratul42@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Shayma','shayma43@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Tamjid','tamjid44@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Imtiaz','imtiaz45@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Fahmid','fahmid46@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Enid','enid47@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Obonti','obonti48@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Shehab','shehab49@gmail.com','+8801836329304','Male','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user'),
    ('Zumaina','zumaina20@gmail.com','+8801836329304','Female','$2y$10$ac393V6L80itGe5JuoIOeOMV9ogvbWp1a4nwe7JlxGNFepZS5Knum','user');
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
    ('Hall 1', 100, 1),
    ('Hall 2', 80,  1),
    ('Hall 3', 120, 1),
    ('Hall 1', 100, 2),
    ('Hall 2', 80,  2),
    ('Hall 3', 120, 2);
END
GO

IF NOT EXISTS (SELECT 1 FROM movies)
BEGIN
    INSERT INTO movies (title, description, genre, category, language, duration_mins, release_date, poster_url, trailer_url, status, is_active) VALUES
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
        'https://www.youtube.com/watch?v=ZTZUaHsfR8o',
        'now_showing',
        1
    );
END
GO