import { Router } from "express";
import UserController from "./user.controller";

class UserRouter {
  public router: Router;
  private userController: UserController;
  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initRoutes();
  }
  private initRoutes() {
    this.router.post("/", this.userController.createUser);
    this.router.get("/", this.userController.users);
    this.router.get('/:id', this.userController.getUserById)
  }
}

export default new UserRouter().router;
