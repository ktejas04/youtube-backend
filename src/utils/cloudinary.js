import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"; //NodeJS File System

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //Upload File on CLoudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully
        // console.log(response); check response object
        console.log("File is uploaded on Cloudinary ", response.url);
        return response
        } catch (error) {
            fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload is failed
            return null;
    }
}

export { uploadOnCloudinary}


/*

Study the below async function and how it differs from above written 

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: "drakg89ni", 
        api_key: "451127237983458", 
        api_secret: "<your_api_secret>" // Click 'View Credentials' below to copy your API secret
    });
    
    // Upload an image
    const uploadResult = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg", {
        public_id: "shoes"
    }).catch((error)=>{console.log(error)});
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url("shoes", {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url("shoes", {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();
*/