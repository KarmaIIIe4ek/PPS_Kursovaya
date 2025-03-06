
-- Создание таблицы admin
CREATE TABLE admin (
    id_admin SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    middlename VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT
);

-- Создание таблицы user
CREATE TABLE user (
    id_user SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    middlename VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP NOT NULL DEFAULT NOW(),
    role_name VARCHAR(255) NOT NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Создание таблицы blacklist
CREATE TABLE blacklist (
    id_blacklist SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    date_added TIMESTAMP NOT NULL DEFAULT NOW(),
    reason TEXT,
    FOREIGN KEY (id_user) REFERENCES user(id_user)
);

-- Создание таблицы group
CREATE TABLE group (
    id_group SERIAL PRIMARY KEY,
    group_number VARCHAR(255) NOT NULL,
    hash_code_login VARCHAR(255) NOT NULL,
    id_user INT
);

-- Создание таблицы users_in_group
CREATE TABLE users_in_group (
    id_users_group SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_group INT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES user(id_user),
    FOREIGN KEY (id_group) REFERENCES group(id_group)
);

-- Создание таблицы task
CREATE TABLE task (
    id_task SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Создание таблицы task_for_group
CREATE TABLE task_for_group (
    id_task_for_group SERIAL PRIMARY KEY,
    id_group INT NOT NULL,
    id_task INT NOT NULL,
    is_open BOOLEAN NOT NULL,
    deadline TIMESTAMP,
    FOREIGN KEY (id_group) REFERENCES group(id_group)
    FOREIGN KEY (id_task) REFERENCES task(id_task)
);


-- Создание таблицы user_make_task
CREATE TABLE user_make_task (
    id_result SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_task INT NOT NULL,
    score INT,
    comment_user TEXT,
    comment_teacher TEXT,
    date_start TIMESTAMP NOT NULL DEFAULT NOW(),
    date_finish TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_by int,
    FOREIGN KEY (id_user) REFERENCES user(id_user),
    FOREIGN KEY (id_task) REFERENCES task(id_task) 
);

-- Добавление записи в таблицу admin
INSERT INTO admin (email, password, lastname, firstname, created_at, last_login, is_active)
VALUES ('admin@admin.com', 'elephant', 'admin', 'admin', NOW(), NOW(), TRUE);