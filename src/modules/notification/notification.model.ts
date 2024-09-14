import dynamoose from "dynamoose";

const NotificationSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    productID: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

// Create and export the model
const Notification = dynamoose.model("Notification", NotificationSchema);
export default Notification;
