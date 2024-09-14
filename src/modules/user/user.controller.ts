import Token from "../../utils/token";
import IUser from "../../interfaces/user.interface";
import User from "./user.model";
import { Request, Response } from "express";
// import User from "../modules/user/user.model";
import jwt from "jsonwebtoken";

class UserController {
  // private jwtFun: Token;

  // constructor() {
  //   this.jwtFun = new Token();
  // }

  public async createUser(req: Request, res: Response) {
    try {

      const payload = req.body.user;
      // return res.send(payload);
      const user_: IUser = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        isAdmin: payload.isAdmin? 1 : 0,
        id: payload.sub
      }
      const user = new User(user_);
      await user.save();

      return res.status(201).json({
        message: "user created",
        user,
      });
    } catch (err: any) {
      return res.status(500).json({
        message: "Error",
        Error: err.message,
      });
    }
  }
  public async users(req: Request, res: Response) {
    try {
      const users = await User.scan().exec();

      return res.status(200).json({
        result: users.length,
        users,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error in retrieving users",
        error,
      });
    }
  }
  public async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params; // Get the ID from the request parameters

      // Query DynamoDB for the user with the specified ID
      const user = await User.get(id);

      if (!user) {
        return res.status(210).json({
          user: "",
        });
      }

      return res.status(200).json({
        user,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Error in retrieving user",
        error: error.message,
      });
    }
  }
}

export default UserController;
