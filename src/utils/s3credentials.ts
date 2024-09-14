import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: "AKIA4MTWNLRHC4JAMF6H",
  secretAccessKey: "eNcv9B+SAbXUmecIwJOZJq7Ey5HFE2Z/6Ml6GJgf",
  region: "us-west-2", // Replace with your S3 bucket's region
});

export default s3;
