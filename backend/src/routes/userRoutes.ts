import Router from "express";
import {registerUser, loginUser, deleteUser, getOneUser, updateUser} from "../controllers/userController";


const user_router = Router();



user_router.post("/register", registerUser);
user_router.post("/login", loginUser);

user_router.get("/getoneuser/:id", getOneUser);
user_router.put("/updateuser/:id", updateUser);
user_router.delete("/deleteuser/:id", deleteUser);


export default user_router;
