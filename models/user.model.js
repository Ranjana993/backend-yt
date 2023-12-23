const mongoose = require('mongoose');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        index: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        index: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true
    },
    fullname: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken: {
        type: String
    }
},
    {
        timestamps: true
    }
)


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});


userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, username: this.username, fullname: this.fullname },
        process.env.ACESS_TOKEN_SECRET, { expireIn: "1d" }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expireIn: "10d" })
}


const User = mongoose.model("User", userSchema)
module.exports = User