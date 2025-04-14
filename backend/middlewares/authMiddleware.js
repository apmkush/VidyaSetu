import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
    try {
        // Get token from request headers
        let token = req.headers.authorization;
        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
          }

        if (!token) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded.user);
        req.user = decoded.user; // Attach user data to request object

        next(); // Continue to the next middleware/controller
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(403).json({ success: false, message: "Invalid or expired token." });
    }
};
