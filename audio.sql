USE database image_db;

CREATE TABLE IF NOT EXISTS music(
    name VARCHAR(50) NOT NULL,
    audio BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS images (
    username VARCHAR(50) NOT NULL,
    image_blob LONGBLOB NOT NULL,
    name VARCHAR(255) NOT NULL,
    extension VARCHAR(10) NOT NULL,
    size INT NOT NULL,
    FOREIGN KEY(username) REFERENCES users(username)
);
