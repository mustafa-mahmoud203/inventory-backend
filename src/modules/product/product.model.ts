import dynamoose from "dynamoose";

const ProductSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    threshold: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    // imageUrl: Buffer,
    imageUrl: String,
  },

  {
    timestamps: true,
  }
);

// Create and export the model
const Product = dynamoose.model("Product", ProductSchema);
export default Product;
