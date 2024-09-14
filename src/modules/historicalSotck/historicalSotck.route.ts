import { Router } from "express";
import HistoricalController from "./historicalSotck.controller";

class HistoricalRouter {
  public router: Router;
  private historicalController: HistoricalController;
  constructor() {
    this.router = Router();
    this.historicalController = new HistoricalController();
    this.initRoutes();
  }
  private initRoutes() {
    this.router.get("/", this.historicalController.getHistoricals);
  }
}

export default new HistoricalRouter().router;
