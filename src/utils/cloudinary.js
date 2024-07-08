import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

 // Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_COULD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


uploadOnCloudinary = async (localFilePath) => {
  if(!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })
    console.log("File is uploaded on cloudinary, ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
    
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
}

export {uploadOnCloudinary}