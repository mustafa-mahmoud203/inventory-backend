import * as AWS from "aws-sdk";
// import mime from "mime-types";

const s3 = new AWS.S3({
  region: "us-west-2",
  // endpoint: new AWS.Endpoint("https://s3.us-west-2.amazonaws.com"),
});

const uploadImageToS3 = async (
  fileName: string,
  fileContent: any,
  fileType: any
): Promise<string> => {
  let name = fileName.split(".")[0];
  let ext = fileName.split(".")[1];
  let fileTypee ="";

  if (ext == "jpg" || ext == "jpeg") ext = "jpeg";
  else if (ext == "png") ext = "png";

  // fileTypee = mime.lookup(fileType) || "image/jpeg";
  if (ext) fileTypee = "image/" + ext;
  else fileTypee = "image/jpeg";
  const params = {
    Bucket: "inventory--images",
    Key: name,
    Body: fileContent,
    ContentType: fileTypee,
  };

  const data = await s3.upload(params).promise();
  return data.Location;
};

export default uploadImageToS3;
