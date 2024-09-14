import dynamoose from "dynamoose";

const OrderSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    productID: {
      type: String,
      required: true,
    },
    userID: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const Order = dynamoose.model("Order", OrderSchema);
export default Order;
