import { Router } from "express"
import { SigninSchema, SignUpSchema } from "../../types";
import client from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../../config";
import { compare, hash } from "../../scrypt";

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
    console.log(req.body);
    const passedData = SignUpSchema.safeParse(req.body);
    if (!passedData.success) {
        res.status(400).json({
            message: "Invalid data",
        });
        return;
    }

    const hashedPassword = await hash(passedData.data.password)
    try {
        const user = await client.user.create({
            data: {
                username: passedData.data.username,
                password: hashedPassword,
                role: passedData.data.type === "admin" ? "Admin" : "User",
            },
        });
        res.json({
            userId: user.id,
        })
    } catch (error) {
        res.status(400).json({
            message: "User already exists",
        });
    }
})

authRouter.post("/signin", async (req, res) => {


    const parsedData = SigninSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(403).json({
            message:"Validation failed"
        })
        return
    }

    try {
        const user = await client.user.findUnique({
            where:{
                username: parsedData.data.username,
            }
        })
        if (!user) {
            res.status(403).json({message:"User not found"})
            return
        }
        const isValid = await compare(parsedData.data.password, user.password)
        if (!isValid) {
            res.status(403).json({message:"Invalid password"})
            return
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_PASSWORD)

        res.json({
            token
        })
    } catch (e) {
        res.status(400).json({
            message:"Internal Server Error"
        })
    }
})