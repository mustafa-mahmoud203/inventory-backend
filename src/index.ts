import express, { Express, NextFunction } from "express";
import userRoutes from "./modules/user/user.route";
import productRoutes from "./modules/product/product.route";
import historicalRoutes from "./modules/historicalSotck/historicalSotck.route";
import notificationsRoutes from "./modules/notification/notification.route";
import orderRoutes from "./modules/order/order.route";
import cors from "cors";

class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware(): void {
    this.app.use(
      cors({
        origin: "*", // Adjust as needed; "*" allows all origins
        credentials: true,
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    // Ensure CORS headers are set for all responses
    this.app.use(
      (req: express.Request, res: express.Response, next: NextFunction) => {
        res.header("Access-Control-Allow-Origin", "*"); // Adjust as needed
        res.header(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
        res.header(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        next();
      }
    );
  }

  private configureRoutes(): void {
    this.app.use("/users", userRoutes);
    this.app.use("/orders", orderRoutes);
    this.app.use("/products", productRoutes);
    this.app.use("/historicals", historicalRoutes);
    this.app.use("/notifications", notificationsRoutes);
    this.app.use(
      express.static("https://inventory--images.s3.us-west-2.amazonaws.com/")
    );
  }
}

export default new App().app;
