import { Request, Response } from "express";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { deleteUser, getOneUser, loginUser, registerUser, updateUser } from "./userController";
import mssql from "mssql";
import { string } from "joi";

describe("Register a new User", () => {
  it("registers a new user", async () => {
    const req = {
      body: {
        userName: "Sandra Chege",
        email: "9superbikes@gmail.com",
        password: "hashedPassword",
        cohort: "cohort17",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashedPassword" as never);

    //mocking uuid
    jest.mock("uuid", () => ({
      v4: jest.fn(),
    }));

    const mockedInput = jest.fn().mockReturnThis();

    const mockedExecute = jest.fn().mockResolvedValue({ rowsAffected: [1] });

    const mockedRequest = {
      input: mockedInput,
      execute: mockedExecute,
    };

    const mockedPool = {
      request: jest.fn().mockReturnValue(mockedRequest),
    };
    jest.spyOn(mssql, "connect").mockResolvedValue(mockedPool as never);
    await registerUser(req as Request, res as any);

    //ASSERTIONS
    expect(res.json).toHaveBeenCalledWith({
      message: "User registered successfully",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockedInput).toHaveBeenCalledWith(
      "userName",
      mssql.VarChar,
      "Sandra Chege"
    );
    expect(mockedInput).toHaveBeenCalledWith(
      "email",
      mssql.VarChar,
      "9superbikes@gmail.com"
    );
    expect(mockedInput).toHaveBeenCalledWith(
      "password",
      mssql.VarChar,
      "hashedPassword"
    );
    expect(mockedInput).toHaveBeenCalledWith(
      "phone_no",
      mssql.VarChar,
      "0700123456"
    );
  });
});

describe("Login user", () => {
  let res: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("checks if user exists", async () => {
    const req = {
      body: {
        email: "correctEmail@gmail.com",
        password: "correctPassword",
      },
    };

    await loginUser(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      error: "email is not found",
    });
  });

  it("checks if password is correct", async () => {
    const req = {
      body: {
        email: "correctEmail@gmail.com",
        password: "wrongPassword",
      },
    };
    jest.spyOn(mssql, "connect").mockResolvedValueOnce({
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValueOnce({
        recordset: [
          {
            email: "correct@email.com",
            password: "hashedPwd",
          },
        ],
      }),
    } as never);

    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false as never);

    await loginUser(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Incorrect password",
    });
  });

  it("logs a user and returns a token", async () => {
    let expectedUser = {
      userID: "9a055430-5a71-4645-b949-d38732244269",
      userName: "Sandra Chege",
      email: "9superbikes@gmail.com",
      cohort: "cohort17",
      password: "$2b$08$THljbFjhzknBoGrm0.UnXegBeKjb/ks/r8GvyNFw3k4gMAQ.zzvB2",
      role: "user",
      isDeleted: false,
      Welcomed: false,
    };
    const req = {
      body: {
        email: "expectedUser.email",
        password: "correctpassword",
      },
    };
    jest.spyOn(mssql, "connect").mockResolvedValueOnce({
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValueOnce({ recordset: [expectedUser] }),
    } as never);

    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true as never);
    jest
      .spyOn(jwt, "sign")
      .mockReturnValueOnce("generate-token-ccccc-sssssss-mmmmmmm" as never);

    await loginUser(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Logged in successfully",
      token: "generate-token-ccccc-sssssss-mmmmmmm",
    });
  });
});

describe("delete user", () => {
  it("deletes a user", async () => {
    const req = {
      params: {
        id: "9a055430-5a71-4645-b949-d38732244269",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockedRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
    };

    jest.spyOn(mssql, "connect").mockResolvedValue({
      request: jest.fn().mockReturnValue(mockedRequest),
    } as never);

    await deleteUser(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User deleted successfully",
    });

    expect(mockedRequest.input).toHaveBeenCalledWith(
      "id",
      mssql.UniqueIdentifier,
      "9a055430-5a71-4645-b949-d38732244269"
    );
  });
});

describe("get one user", () => {
  it("fetches a user", async () => {
    const req = {
      params: {
        id: "9a055430-5a71-4645-b949-d38732244269",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const expectedUser = {
      userID: "9a055430-5a71-4645-b949-d38732244269",
      userName: "Sandra Chege",
      email: "9superbikes@gmail.com",
      cohort: "cohort17",
      password: "$2b$08$THljbFjhzknBoGrm0.UnXegBeKjb/ks/r8GvyNFw3k4gMAQ.zzvB2",
      role: "user",
      isDeleted: false,
      Welcomed: false,
    };

    const mockedRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValueOnce({ recordset: [expectedUser] }),
    };

    jest.spyOn(mssql, "connect").mockResolvedValue({
      request: jest.fn().mockReturnValue(mockedRequest),
    } as never);
      
      await getOneUser (req as any, res as any);
  });
});

describe("update user", () => {
    it("updates a user", async () => { 
        const req = {
        params: {
          id: "9a055430-5a71-4645-b949-d38732244269"
        },
        body: {
            userName: "Updated Name",
            password: "newHashedPassword",
            cohort: "cohort18",
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockedRequest = {
        input: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ rowsAffected: [1] })
      };

      jest.spyOn(mssql, "connect").mockResolvedValue({
        request: jest.fn().mockReturnValue(mockedRequest)
      } as never);

      await updateUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User updated successfully"
      });

        expect(mockedRequest.input).toHaveBeenCalledWith(
            "id", mssql.UniqueIdentifier, "9a055430-5a71-4645-b949-d38732244");
    })
})
