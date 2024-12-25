import { Router } from "express"
import { SigninSchema, SignUpSchema } from "../../types";
import client from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../../config";
import { compare, hash } from "../../scrypt";

export const authRouter = Router();
authRouter.post("/signin", async (req, res) => {

    const { username, email, type } = req.body;
  
    if (!username || !email) {
      res.status(400).json({
        message: "Username and email are required",
      });
      return;
    }
  
    try {
    
      let user = await client.user.findUnique({
        where: { email },
      });

  
      if (!user) {
        user = await client.user.create({
          data: {
            username,
            email,
            role: type === "admin" ? "Admin" : "User",
          },
        });
      }
  
      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        JWT_PASSWORD
      );
        
      res.json({
        token,
        userId: user.id,
      });
    } catch (error) {
      console.error("Error in auth route:", error);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  });
  