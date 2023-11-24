-- SELECT * from Users

CREATE OR ALTER PROCEDURE getOneUser
@userID VARCHAR(200)
AS
BEGIN
    SELECT * FROM Users
    WHERE userID = @userID
END 