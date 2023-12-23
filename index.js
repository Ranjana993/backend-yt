require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database/dbConnect");
const router = require("./routes/user.route");

const app = express();
const PORT = process.env.PORT || 8000;


//! Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/", router)

connectDB()   //! Connect to the database

// Routes
app.get('/', (req, res) => {
    res.send("<h1>Hello from backend </h1>");
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});
