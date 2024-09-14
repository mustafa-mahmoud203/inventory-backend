import dynamoose from "dynamoose";

const HistoricalSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      // hashKey: true,
      required: true,
    },
    productID: {
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
const HistoricalStock = dynamoose.model("HistoricalStock", HistoricalSchema);
export default HistoricalStock;
