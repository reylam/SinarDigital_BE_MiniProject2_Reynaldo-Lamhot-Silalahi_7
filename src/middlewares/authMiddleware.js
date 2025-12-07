import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required",
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const user = await prisma.user.findFirst({
      where: {
        token: token,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid token",
        message: "User not found or token expired",
      });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      await prisma.user.update({
        where: { id: user.id },
        data: { token: null },
      });

      return res.status(401).json({
        error: "Token expired",
        message: "Please login again",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Authentication failed",
    });
  }
};

export const authorize = (permissions) => {
  return async (req, res, next) => {
    try {
      const userPermissions = req.user.role.permissions.map(
        (rp) => rp.permission.name
      );

      const hasPermission = permissions.some((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Authorization failed",
      });
    }
  };
};
