import Notification from "./notification.model";
import { Request, Response } from "express";

class NotificationsController {
  //   public async createNotification(
  //     data: INotifaction
  //   ): Promise<APIGatewayProxyResult> {
  //     try {
  //       const notification = new Notification({
  //         id: data.id,
  //         text: data.text,
  //         productID: data.productID,
  //       });
  //       await notification.save();

  //       return {
  //         statusCode: 201,
  //         body: JSON.stringify(notification),
  //       };
  //     } catch (err) {
  //       console.error("Error creating notification:", err);
  //       return {
  //         statusCode: 500,
  //         body: JSON.stringify({
  //           message: "Error creating notification",
  //           error: err,
  //         }),
  //       };
  //     }
  //   }
  public async getNotifications(req: Request, res: Response) {
    try {
      const notifications = await Notification.scan().exec();
      if (!notifications) {
        return res.status(404).json({ message: "No notifications found" });
      }
      return res.status(200).json({
        result: notifications.length,
        notifications,
      });
    } catch (error) {
      console.error("Error retrieving notifications:", error);
      return res
        .status(500)
        .json({ message: "Error retrieving notifications", error });
    }
  }
}

export default NotificationsController;
