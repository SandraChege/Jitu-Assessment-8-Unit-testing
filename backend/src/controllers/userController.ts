import { Request, Response } from "express";
import mssql from "mssql";

import { v4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sqlConfig } from "../config/sqlConfig";


export const registerUser = async (req: Request, res: Response) => {
  try {
    let { userName, email, password, cohort } = req.body;

    let userID = v4();

    const hashedPwd = await bcrypt.hash(password, 8);

    const pool = await mssql.connect(sqlConfig);

    // console.log("here");

    let result = await pool
      .request()
      .input("userID", mssql.VarChar, userID)
      .input("userName", mssql.VarChar, userName)
      .input("email", mssql.VarChar, email)
      .input("cohort", mssql.VarChar, cohort)
      .input("password", mssql.VarChar, hashedPwd)
      .execute("registerUser");

    // console.log("here");

    return res.status(200).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export const loginUser = async (req: Request, res: Response) => { 
  try {
    const { email, password } = req.body;
    const pool = await mssql.connect(sqlConfig);
    let user = await(
      await pool
        .request()
        .input("email", mssql.VarChar, email)
        .input("password", mssql.VarChar, password)
        .execute("loginUser")
    ).recordset;

    if (user.length === 1) {
      const correctPwd = await bcrypt.compare(password, user[0].password);

      if (!correctPwd) {
        return res.status(401).json({
          message: "Incorrect password",
        });
      }

      const loginCredentials = user.map((record) => {
        const { phone_no, id_no, password, ...rest } = record;
        console.log("rest is", rest);
        console.log("record is", record);

        return rest;
      });

      const token = jwt.sign(
        loginCredentials[0],
        process.env.SECRET as string,
        {
          expiresIn: "86400s",
        }
      );

      return res.status(200).json({
        message: "Logged in successfully",
        token,
      });
    } else {
      return res.status(401).json({
        message: "Email not found",
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export const deleteUser = async (req: Request, res: Response) => { 
  try {
    const userID = req.params.id;

    if (!userID) {
      return res.send({ message: "enter id" });
    }

    const pool = await mssql.connect(sqlConfig);

    let user = (
      await pool.request().input("userID", userID).execute("deleteUser")
    ).recordset;

    return res.status(200).json({
      message: "User deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
}

export const getOneUser = async (req: Request, res: Response) => {
   try {
     let userID = req.params.id;

     const pool = await mssql.connect(sqlConfig);

     let user = (
       await pool.request().input("userID", userID).execute("fetchOneEmployee")
     ).recordset;

     return res.status(200).json({
       user: user,
     });
   } catch (error) {
     return res.json({
       error: error,
     });
   }
}; 

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userName, password, cohort } = req.body;
    const userID = req.params.id;

    if (!userID) {
      return res.send({ message: "enter id" });
    }

    // const hashedPwd = password ? await bcrypt.hash(password, 8) : null;
    const hashedPwd = await bcrypt.hash(password, 8);

    const pool = await mssql.connect(sqlConfig);

    let result = await pool
      .request()
      .input("userID", mssql.VarChar, userID)
      .input("userName", mssql.VarChar, userName)
      .input("cohort", mssql.VarChar, cohort)
      .input("password", mssql.VarChar, hashedPwd)
      .execute("updateUser");

    return res.status(200).json({
      message: "User updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
}
