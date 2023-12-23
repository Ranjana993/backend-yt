const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/chai-aur-backend-practice')
        console.log("successfully connected to MongoDB . ");
    } catch (error) {
        console.log("error while connnecting to database", error.message);
    }
}

module.exports = connectDB