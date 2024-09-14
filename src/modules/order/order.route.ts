import { Router } from "express";
import OrderController from "./order.controller";

class OrdersRouter {
  public router: Router;
  private orderController: OrderController;
  constructor() {
    this.router = Router();
    this.orderController = new OrderController();
    this.initRoutes();
  }
  private initRoutes() {
    this.router.post("/", this.orderController.createOrder);
    this.router.get("/", this.orderController.getOrders);
    this.router.get("/trends/", this.orderController.getTrends);
    this.router.get("/users/:userId", this.orderController.getOrdersByUser);
    this.router.get("/:id", this.orderController.getOrder);
    this.router.delete("/:id", this.orderController.deleteOrder);
  }
}

export default new OrdersRouter().router;
