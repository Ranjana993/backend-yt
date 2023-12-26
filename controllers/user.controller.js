const { apiResponse } = require("../helper/apiResponse");
const asyncHandler = require("../helper/asyncHandler");
const apiError = require("../helper/errorHandler");
const User = require("../models/user.model");
const uploadFileToCloudinary = require("../utils/cloudinary");


// ! generating access and refresh tokens 
const generatAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        console.log("user =>>>>> ",user);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new apiError(500, "something went wrong while generating access and refresh token ")
    }
}


const registerController = asyncHandler(async (req, res) => {
    const { username, email, fullname, password, avatar } = req.body;
    try {
        if ([username, email, fullname, password].some(fields => !fields || fields.trim() === "")) {
            throw new apiError(400, "All fields are required");
        }

        // Check if user exists with the provided email or username
        const exists = await User.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            throw new apiError(401, "User already exists with this email or username. Please create a new one.");
        }
        // console.log(req.files);
        const avatarImagePath = req.files?.avatar[0].path;


        if (!avatarImagePath) {
            throw new apiError(400, "Avatar file is required");
        }
        let coverImagePath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImagePath = req.files?.coverImage[0].path;
        }

        // Uploading files to Cloudinary
        const uploadAvatar = await uploadFileToCloudinary(avatarImagePath);
        const uploadCoverImage = await uploadFileToCloudinary(coverImagePath);

        if (!uploadAvatar || !uploadAvatar.url) {
            throw new apiError(500, "Error uploading avatar file");
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
            throw new apiError(500, "Something went wrong while registering user");
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



const loginUserController = asyncHandler(async (req, res) => {
    try {
        const { email, username, password } = req.body
        console.log(email, username, password);
        if (!username || !email) {
            throw new apiError(400, "Username or email required . ")
        }
        const user = await User.findOne({ $or: [{ username }, { email }] })

        if (!user) {
            throw new apiError(404, "user does not exist ")
        }
        const isPasswordValid = await user.comparePassword(password)

        if (!isPasswordValid) {
            throw new apiError(401, "password incorrect ")
        }

        const { accessToken, refreshToken } = await generatAccessAndRefreshTokens(user._id)


        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true,
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new apiResponse(200, {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                    "user logged in successfully"
                )
            )
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json(new apiResponse(error.statusCode || 500, error.message || "Internal Server Error"));
    }
})



const logoutController = asyncHandler(async (req, res) => {

})

module.exports = {
    registerController,
    loginUserController,
    logoutController
}