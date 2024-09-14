import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import Order from "./order.model";
import Product from "../product/product.model";
import Notification from "../notification/notification.model";
import jwt from "jsonwebtoken";
import IUser from "../../interfaces/user.interface";
import ApiError from "../../utils/apiError";
import { Annotation } from "aws-sdk/clients/configservice";


interface Order_ {
  id: string;
  productID: string;
  userID: string;
  quantity: number;
  createdAt: string; // ISO 8601 date string
}

interface Product_ {
  id: string;
  price: number;
}

interface ProductTotals_ {
  quantity: number;
  totalPrice: number;
}

interface AggregatedProductData_ {
  [productID: string]: ProductTotals_;
}


class OrderController {
  public async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data: any = req.body;

      const { authorization }: any = req.headers;
      const tokenData: any = jwt.decode(authorization, { complete: true });
      
      const payload: IUser = {
        id: tokenData.payload.sub,
        name: tokenData.payload.name,
        email: tokenData.payload.email,
        phone: tokenData.payload.phone_number,
        isAdmin: tokenData.payload["custom:isAdmin"],
      };
      if (!payload) {
        throw new ApiError("Invalid token data", 400);
      }

      const product = await Product.get(data.productID);
      if (!product) {
        throw new ApiError("Product not found", 404);
      }

      if (product.quantity < data.quantity) {
        throw new ApiError("Insufficient stock", 400);
      }

      const order = new Order({
        id: uuidv4(),
        productID: data.productID,
        userID: payload.id,
        quantity: Number(data.quantity),
      });
      await order.save();

      const updates = {
        quantity: Number(product.quantity) - Number(data.quantity),
        sold: Number(product.sold) + Number(data.quantity),
      };

      await Product.update({ id: product.id }, updates);

      if (product.quantity <= product.threshold) {
        const notifiction = new Notification({
          id: uuidv4(),
          text: `Low stock for product ${product.name}`,
          productID: product.id,
        });
        await notifiction.save();
      }

      return res.status(201).json({
        message: "Order created",
        order,
      });
    } catch (error: any) {
      next(error.message);
    }
  }

  public async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await Order.scan().exec();
      if (!orders || orders.length === 0) {
        return res.status(404).json({
          message: "No orders found",
        });
      }

      const productIds = [...new Set(orders.map((order) => order.productID))];
      const products = await Product.batchGet(productIds.map((id) => ({ id })));
      const productMap = new Map(products.map((product) => [product.id, product]));

      const ordersWithDetails = orders.map((order) => ({
        ...order.toJSON(),
        product: productMap.get(order.productID) || null,
      }));

      return res.status(200).json({
        result: orders.length,
        orders: ordersWithDetails,
      });
    } catch (error: any) {
      next(error.message);
    }
  }

  public async getOrdersByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const orders = await Order.scan('userID').eq(userId).exec();
      if (orders.length === 0) {
        return res.status(404).json({
          message: "No orders found for this user",
        });
      }

      const productIds = [...new Set(orders.map(order => order.productID))];
      const products = await Product.batchGet(productIds.map(id => ({ id })));
      const productMap = new Map(products.map(product => [product.id, product]));

      const ordersWithDetails = orders.map(order => ({
        ...order.toJSON(),
        product: productMap.get(order.productID) || null,
      }));

      return res.status(200).json({
        orders: ordersWithDetails,
      });
    } catch (error: any) {
      next(error.message);
    }
  }

  public async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id }: any = req.params;

      const order: any = await Order.get(id);
      if (!order) {
        throw new ApiError("Order not found", 404);
      }

      return res.status(200).json({
        order,
      });
    } catch (error: any) {
      next(error.message);
    }
  }

  public async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id }: any = req.params;

      const order: any = await Order.get(id);
      if (!order) {
        throw new ApiError("Order not found", 404);
      }

      await order.delete(id);

      return res.status(204).json({
        message: "Order deleted",
      });
    } catch (error: any) {
      next(error.message);
    }
  }

  // New method to get trends
  public async getTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const getLast7DaysTimestamp = (): number => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return sevenDaysAgo.getTime();
      };


      const fetchRecentOrders = async (): Promise<any[]> => {
        const last7DaysTimestamp = getLast7DaysTimestamp();
        
        try {
            // Fetch the orders
            const orders: any = await Order.scan()
              .where("createdAt").gt(last7DaysTimestamp)
              .exec();
    
            // Access and log the items
            // const orders = result.Items || [];
            console.log("Fetched Orders:", orders);
    
            // If you need to populate related data, you would typically do it per item
            // This step assumes that 'populate' is needed and valid for each order
            // Example of populating each order individually if necessary
            // const populatedOrders = await Promise.all(
            //     orders.map(async (order) => await order.populate())
            // );
    
            // Return the fetched orders (or populated orders if applicable)
            return orders;
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error;
        }
    };
    


    const aggregateProductData = async (orders: any[]): Promise<AggregatedProductData_> => {
      const productTotals: AggregatedProductData_ = {};
    
      for (const order of orders) {
        // Initialize the productTotals entry if it doesn't exist
        if (!productTotals[order.productID]) {
          productTotals[order.productID] = { quantity: 0, totalPrice: 0 };
        }
    
        // Fetch the product details
        const product = await Product.get(order.productID);
    
        if (product) {
          // Ensure the product price is a number
          const productPrice = parseFloat(product.price);
          if (isNaN(productPrice)) {
            console.error(`Invalid price for product ${order.productID}: ${product.price}`);
            continue; // Skip this product if price is invalid
          }
    
          // Calculate totalPrice based on quantity and product price
          const totalPrice = order.quantity * productPrice;
    
          // Update product totals
          productTotals[order.productID].quantity += order.quantity;
          productTotals[order.productID].totalPrice += totalPrice;
        } else {
          console.warn(`Product not found for productID ${order.productID}`);
        }
      }
    
      return productTotals;
    };

      const orders = await fetchRecentOrders();
      console.log("1111111111111111111111111");
            
      const productTotals = await aggregateProductData(orders);
      console.log("22222222222222222222222222");

      const sortedProducts = Object.entries(productTotals)
        .map(([productID, { quantity, totalPrice }]) => ({
          productID,
          quantity,
          totalPrice,
        }))
        .sort((a, b) => b.quantity - a.quantity);

      console.log("333333333333333333333333333");

      const top10Products = sortedProducts.slice(0, 10);
      console.log("44444444444444444444444444444");

      res.json(top10Products);
    } catch (error: any) {
      next(error.message);
    }
  }
}

export default OrderController;
