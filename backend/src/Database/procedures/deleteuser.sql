CREATE OR ALTER PROCEDURE deleteUser
(@userID VARCHAR(200))
AS
BEGIN
    UPDATE Users
    SET isDeleted = 1
    WHERE userID = @userID
END 