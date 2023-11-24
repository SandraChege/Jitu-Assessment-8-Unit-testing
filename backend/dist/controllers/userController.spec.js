"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userController_1 = require("./userController");
const mssql_1 = __importDefault(require("mssql"));
describe("Register a new User", () => {
    it("registers a new user", () => __awaiter(void 0, void 0, void 0, function* () {
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
        jest.spyOn(bcrypt_1.default, "hash").mockResolvedValueOnce("hashedPassword");
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
        jest.spyOn(mssql_1.default, "connect").mockResolvedValue(mockedPool);
        yield (0, userController_1.registerUser)(req, res);
        //ASSERTIONS
        expect(res.json).toHaveBeenCalledWith({
            message: "User registered successfully",
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockedInput).toHaveBeenCalledWith("userName", mssql_1.default.VarChar, "Sandra Chege");
        expect(mockedInput).toHaveBeenCalledWith("email", mssql_1.default.VarChar, "9superbikes@gmail.com");
        expect(mockedInput).toHaveBeenCalledWith("password", mssql_1.default.VarChar, "hashedPassword");
        expect(mockedInput).toHaveBeenCalledWith("phone_no", mssql_1.default.VarChar, "0700123456");
    }));
});
describe("Login user", () => {
    let res;
    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });
    it("checks if user exists", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {
            body: {
                email: "correctEmail@gmail.com",
                password: "correctPassword",
            },
        };
    }));
    it("checks if password is correct", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {
            body: {
                email: "correctEmail@gmail.com",
                password: "wrongPassword",
            },
        };
        jest.spyOn(mssql_1.default, "connect").mockResolvedValueOnce({
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
        });
        jest.spyOn(bcrypt_1.default, "compare").mockResolvedValueOnce(false);
        yield (0, userController_1.loginUser)(req, res);
        expect(res.json).toHaveBeenCalledWith({
            message: "Incorrect password",
        });
    }));
    it("logs a user and returns a token", () => __awaiter(void 0, void 0, void 0, function* () {
        let expectedUser = {
            userID: "9a055430-5a71-4645-b949-d38732244269",
            userName: "Jane Doe",
            email: "janr@gmail.com",
            phone_no: "0710000000",
            password: "$2b$08$THljbFjhzknBoGrm0.UnXegBeKjb/ks/r8GvyNFw3k4gMAQ.zzvB2",
            role: "admin",
            isDeleted: false,
            Welcomed: false,
        };
        const req = {
            body: {
                email: "expectedUser.email",
                password: false,
            },
        };
        jest.spyOn(mssql_1.default, "connect").mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ recordset: [expectedUser] }),
        });
        jest.spyOn(bcrypt_1.default, "compare").mockResolvedValueOnce(true);
        jest
            .spyOn(jsonwebtoken_1.default, "sign")
            .mockReturnValueOnce("generate-token-jghjg-jyiugjxz-mmhjruyiu");
        yield (0, userController_1.loginUser)(req, res);
        expect(res.json).toHaveBeenCalledWith({
            message: "Logged in successfully",
            token: "generate-token-jghjg-jyiugjxz-mmhjruyiu",
        });
    }));
});
