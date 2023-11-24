-- USE xploraTours

-- SELECT * FROM Users


create TABLE Users (
    userID VARCHAR(300) NOT NULL PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cohort VARCHAR (250), 
    password VARCHAR(255) NOT NULL, 
    role varchar(20) DEFAULT 'user',
    isDeleted bit DEFAULT 0,   
    Welcomed bit DEFAULT 0,
);