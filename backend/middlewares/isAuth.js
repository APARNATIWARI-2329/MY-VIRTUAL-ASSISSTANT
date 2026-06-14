import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {

    console.log("===== AUTH DEBUG =====");
    console.log("Cookies:", req.cookies);
    console.log("Token:", req.cookies?.token);

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Token not found"
      });
    }

    const verifyToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = verifyToken.userId;

    next();

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Invalid token"
    });
  }
};

export default isAuth;