const  cloudinary  = require('cloudinary').v2;
const fs = require("fs")

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const uploadFileToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) 
        return null;
    }
}
module.exports = uploadFileToCloudinary;


// const cloudinary = require('cloudinary').v2;
// const fs = require('fs');

// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUD_API_KEY,
//     api_secret: process.env.CLOUD_API_SECRET
// });

// const uploadFileToCloudinary = async (filePath) => {
//     try {
//         const response = await cloudinary.v2.uploader.upload(filePath, { resource_type: 'auto' });
//         fs.unlinkSync(filePath);
//         console.log('response', response);
//         return response;
//     } catch (error) {
//         fs.unlinkSync(filePath);
//         throw error; // Throw the error to be caught in the calling function
//     }
// };

// module.exports = uploadFileToCloudinary;


