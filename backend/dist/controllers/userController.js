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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getOneUser = exports.deleteUser = exports.loginUser = exports.registerUser = void 0;
const mssql_1 = __importDefault(require("mssql"));
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sqlConfig_1 = require("../config/sqlConfig");
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { userName, email, password, cohort } = req.body;
        let userID = (0, uuid_1.v4)();
        const hashedPwd = yield bcrypt_1.default.hash(password, 8);
        const pool = yield mssql_1.default.connect(sqlConfig_1.sqlConfig);
        // console.log("here");
        let result = yield pool
            .request()
            .input("userID", mssql_1.default.VarChar, userID)
            .input("userName", mssql_1.default.VarChar, userName)
            .input("email", mssql_1.default.VarChar, email)
            .input("cohort", mssql_1.default.VarChar, cohort)
            .input("password", mssql_1.default.VarChar, hashedPwd)
            .execute("registerUser");
        // console.log("here");
        return res.status(200).json({
            message: "User registered successfully",
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const pool = yield mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let user = yield (yield pool
            .request()
            .input("email", mssql_1.default.VarChar, email)
            .input("password", mssql_1.default.VarChar, password)
            .execute("loginUser")).recordset;
        if (user.length === 1) {
            const correctPwd = yield bcrypt_1.default.compare(password, user[0].password);
            if (!correctPwd) {
                return res.status(401).json({
                    message: "Incorrect password",
                });
            }
            const loginCredentials = user.map((record) => {
                const { phone_no, id_no, password } = record, rest = __rest(record, ["phone_no", "id_no", "password"]);
                console.log("rest is", rest);
                console.log("record is", record);
                return rest;
            });
            const token = jsonwebtoken_1.default.sign(loginCredentials[0], process.env.SECRET, {
                expiresIn: "86400s",
            });
            return res.status(200).json({
                message: "Logged in successfully",
                token,
            });
        }
        else {
            return res.status(401).json({
                message: "Email not found",
            });
        }
    }
    catch (error) {
        console.log(error);
    }
});
exports.loginUser = loginUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.id;
        if (!userID) {
            return res.send({ message: "enter id" });
        }
        const pool = yield mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let user = (yield pool.request().input("userID", userID).execute("deleteUser")).recordset;
        return res.status(200).json({
            message: "User deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error,
        });
    }
});
exports.deleteUser = deleteUser;
const getOneUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userID = req.params.id;
        const pool = yield mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let user = (yield pool.request().input("userID", userID).execute("fetchOneEmployee")).recordset;
        return res.status(200).json({
            user: user,
        });
    }
    catch (error) {
        return res.json({
            error: error,
        });
    }
});
exports.getOneUser = getOneUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName, password, cohort } = req.body;
        const userID = req.params.id;
        if (!userID) {
            return res.send({ message: "enter id" });
        }
        // const hashedPwd = password ? await bcrypt.hash(password, 8) : null;
        const hashedPwd = yield bcrypt_1.default.hash(password, 8);
        const pool = yield mssql_1.default.connect(sqlConfig_1.sqlConfig);
        let result = yield pool
            .request()
            .input("userID", mssql_1.default.VarChar, userID)
            .input("userName", mssql_1.default.VarChar, userName)
            .input("cohort", mssql_1.default.VarChar, cohort)
            .input("password", mssql_1.default.VarChar, hashedPwd)
            .execute("updateUser");
        return res.status(200).json({
            message: "User updated successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error,
        });
    }
});
exports.updateUser = updateUser;
