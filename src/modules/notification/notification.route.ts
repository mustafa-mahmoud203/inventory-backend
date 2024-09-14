import { Router } from "express";
import NotificationsController from "./notification.controller";

class HistoricalRouter {
  public router: Router;
  private notificationsController: NotificationsController;
  constructor() {
    this.router = Router();
    this.notificationsController = new NotificationsController();
    this.initRoutes();
  }
  private initRoutes() {
    this.router.get("/", this.notificationsController.getNotifications);
  }
}

export default new HistoricalRouter().router;
