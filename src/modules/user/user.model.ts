import dynamoose from "dynamoose";

const UserSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    phone: String,
    isAdmin: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = dynamoose.model("User", UserSchema);
export default User;
