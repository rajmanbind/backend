import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplaodCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("No file path provided");
      return null;
    }
    // Ensure the file exists before attempting to upload
    if (!fs.existsSync(localFilePath)) {
      console.error("File not found at path:", localFilePath);
      return null;
    }

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // File has been uploaded successfully, remove the local file
    // fs.unlinkSync(localFilePath);

    // Log and return the Cloudinary response
    console.log("File uploaded to Cloudinary:", response);
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.message);
    fs.unlinkSync(localFilePath); //remove the locally saved temprory file as the upload operation got  failed
  }
};
export { uplaodCloudinary };
// cloudinary.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );
