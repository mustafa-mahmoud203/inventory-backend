// import uploadImageToS3 from "../utils/s3-images-uploads";
import { v4 as uuidv4 } from "uuid";
import Product from "./product.model";
import IProduct from "../../interfaces/product.interface";
import { Request, Response } from "express";
import HistoricalStock from "../historicalSotck/historicalSotck.model";
// import { nanoid } from "nanoid";
import uploadImageToS3 from "../../utils/s3ImagesUploads";
import { S3 } from "aws-sdk";
import ApiError from "../../utils/apiError";
class ProductController {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: "us-west-2", // Specify your desired region
      accessKeyId: process.env.IAM_USER_ACCESS_KEY,
      secretAccessKey: process.env.IAM_USER_SECRET_KEY,
    });
    this.getProductImage = this.getProductImage.bind(this);
  }

  public async createProduct(req: Request, res: Response) {
    try {
      const data: IProduct = req.body;
      if (!data) {
        return res.status(400).json({
          message: "Invalid product data",
        });
      }
      data["price"] = parseFloat(data.price.toString());
      data["quantity"] = parseInt(data.quantity.toString());
      data["threshold"] = parseInt(data.threshold.toString());
      let imageUrl: string = "";
      if (req.file) {
        const imageBuffer = req.file.buffer;
        const imageName = `${Date.now()}_${req.file.originalname}`;
        imageUrl = await uploadImageToS3(imageName, imageBuffer, req.file.mimetype);
    }
    

      const product = new Product({
        id: uuidv4(),
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        threshold: data.threshold,
        imageUrl,
      });
      await product.save();

      // Save historical stock record for the newly created product
      const historicalStock = await new HistoricalStock({
        id: uuidv4(),
        productID: product.id,
        quantity: product.quantity,
      }).save();

      return res.status(201).json({
        message: "product created",
        product,
        historicalStock,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error creating product",
        error,
      });
    }
  }
  public async getProducts(req: Request, res: Response) {
    try {
      const products = await Product.scan().exec();
      if (!products) {
        return res.status(404).json({
          message: "No products found",
        });
      }
      return res.status(200).json({
        result: products.length,
        products,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error in retrieving  product",
        error,
      });
    }
  }
  public async getProduct(req: Request, res: Response) {
    try {
      const { id }: any = req.params;

      const product: any = await Product.get(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json({
        product,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error in retrieving product",
        error,
      });
    }
  }
  // public async getProductImage(req: Request, res: Response) {
  //   try {
  //     const { id }: any = req.params;

  //     const product: any = await Product.get(id);
  //     if (!product) {
  //       return res.status(404).json({ message: "Product not found" });
  //     }
  //     return res.sendFile(product.imageUrl);
  //   } catch (error) {
  //     console.log(error);

  //     return res.status(500).json({
  //       message: "Error in retrieving product image",
  //       error,
  //     });
  //   }
  // }

  public async getProductImage(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Fetch the product from your database
      const product: any = await Product.get(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if the product has an image URL
      if (!product.imageUrl) {
        return res.status(404).json({ message: "Product image not found" });
      }
      // Extract and decode the S3 key from the image URL

      const imageUrl = product.imageUrl;
      const url = new URL(imageUrl);
      const s3Key = decodeURIComponent(url.pathname.substring(1)); // Remove leading slash and decode

      // Generate a pre-signed URL for the image
      const signedUrl = this.s3.getSignedUrl("getObject", {
        Bucket: "inventory--images", // Your S3 bucket name
        Key: s3Key, // The S3 key for the image
        Expires: 60 * 5, // URL expires in 5 minutes
      });

      // Redirect the client to the pre-signed URL
      return res.redirect(signedUrl);
    } catch (error) {
      console.error("Error retrieving product image:", error);

      return res.status(500).json({
        message: "Error in retrieving product image",
        error,
      });
    }
  }


  public async updateProduct(req: Request, res: Response, next: Function) {
    try {
      const { id } = req.params;
      const updates = {
        name: req.body.name,
        price: Number(req.body.price),
        quantity: Number(req.body.quantity),
        threshold: Number(req.body.threshold),
      };
  
      // Fetch the existing product
      const oldProduct = await Product.get(id);
      if (!oldProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Update the product
      const product = await Product.update({ id }, updates);
      if (!product) {
        return res.status(400).json({ message: "Product not updated" });
      }
  
      // Handle historical stock
      let historicalStock: any = {};
      if (updates.quantity && oldProduct.quantity < updates.quantity) {
        historicalStock = await new HistoricalStock({
          id: uuidv4(),
          productID: product.id,
          quantity: updates.quantity - oldProduct.quantity,
        }).save();
      }
  
      return res.status(200).json({
        message: "Product updated successfully",
        product,
        historicalStock,
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      next(error); // Pass the error to the global error handler
    }
  }
  public async deleteProduct(req: Request, res: Response) {
    try {
      const { id }: any = req.params;

      const product: any = await Product.get(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await Product.delete(id);

      return res.status(204).json({
        message: "Product deleted",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error deleting product",
        error,
      });
    }
  }
}

export default ProductController;
