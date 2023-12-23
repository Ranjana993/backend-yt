const { apiResponse } = require("../helper/apiResponse");
const asyncHandler = require("../helper/asyncHandler");
const apiError = require("../helper/errorHandler");
const User = require("../models/user.model");
const uploadFileToCloudinary = require("../utils/cloudinary");


const registerController = asyncHandler(async (req, res) => {
    const { username, email, fullname, password, avatar } = req.body;
    // console.log(username, email, fullname, password, avatar);

    try {
        if ([username, email, fullname, password].some(fields => !fields || fields.trim() === "")) {
            throw new apiError(400, "All fields are required");
        }

        // Check if user exists with the provided email or username
        const exists = await User.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            throw new apiError(401, "User already exists with this email or username. Please create a new one.");
        }

        const avatarImagePath = req.files?.avatar[0].path;
        const coverImagePath = req.files?.coverImage[0].path;

        if (!avatarImagePath) {
            throw new apiError(400, "Avatar file is required");
        }

        // Uploading files to Cloudinary
        const uploadAvatar = await uploadFileToCloudinary(avatarImagePath);
        const uploadCoverImage = await uploadFileToCloudinary(coverImagePath);

        if (!uploadAvatar || !uploadAvatar.url) {
            throw new apiError(500, "Error uploading avatar file" );
        }

        // Creating a new user in the database
        const newData = await User.create({
            username,
            fullname,
            avatar: uploadAvatar.url,
            coverImage: uploadCoverImage?.url || "",
            email,
            password
        });

        if (!newData) {
            throw new apiError(500, "Something went wrong while registering user" );
        }

        const createdUser = await User.findById(newData._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new apiError(500, "Something went wrong while retrieving user data");
        }

        return res.status(200).json(new apiResponse(200, "Successfully registered", createdUser));
    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        return res.status(error.statusCode || 500).json(new apiResponse(error.statusCode || 500, error.message || "Internal Server Error"));
    }
});


module.exports = { registerController }