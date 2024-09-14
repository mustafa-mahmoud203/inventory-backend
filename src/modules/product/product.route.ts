import { Router } from "express";
import ProductController from "./product.controller";
import multer from "multer";
class ProductRouter {
  public router: Router;
  private productController: ProductController;
  private upload: any;
  constructor() {
    this.router = Router();
    this.productController = new ProductController();
    this.upload = multer();
    this.initRoutes();
  }
  private initRoutes() {
    this.router.post(
      "/",
      this.upload.single("imageUrl"),
      this.productController.createProduct
    );
    this.router.get("/", this.productController.getProducts);
    this.router.get(
      "/static-files/:id",
      this.productController.getProductImage
    );
    this.router.get("/:id", this.productController.getProduct);
    this.router.delete("/:id", this.productController.deleteProduct);
    this.router.put("/:id", this.productController.updateProduct);
  }
}

export default new ProductRouter().router;
