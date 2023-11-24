CREATE OR ALTER PROCEDURE updateUser(
    @userID varchar(100),
    @userName varchar(200),
    @cohort VARCHAR(300),
    @password VARCHAR(200)
)
AS
BEGIN
    UPDATE Users
    SET userName = @userName, cohort = @cohort, password = @password
    WHERE userID = @userID
END