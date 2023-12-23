const express = require("express");
const { registerController } = require("../controllers/user.controller");
const upload = require("../middlewares/uploader");
const router = express.Router();


router.post("/register", upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), registerController)


module.exports = router 