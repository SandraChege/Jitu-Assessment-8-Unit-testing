"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const user_router = (0, express_1.default)();
user_router.post("/register", userController_1.registerUser);
user_router.post("/login", userController_1.loginUser);
user_router.get("/getoneuser/:id", userController_1.getOneUser);
user_router.put("/updateuser/:id", userController_1.updateUser);
user_router.delete("/deleteuser/:id", userController_1.deleteUser);
exports.default = user_router;
