const asyncHandler = require("../helper/asyncHandler");

const verifyJWT =   asyncHandler = (  async(req, res, next) => {
    const acessToken = req.cookies?.accessToken || req.header("Authorization")
}) 