import { Router } from "express";
import { userRouter } from "./user";
import { authRouter } from "./auth";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import client from "@repo/db/client"

export const router = Router();

router.get("/elements",async (req,res) =>{
    const elements = await client.element.findMany();
    res.json({elements : elements.map(e => {
        return {
            id: e.id,
            imageUrl: e.imageUrl,
            width: e.width,
            height: e.height,
            static: e.static
        }
    })})
})

router.get("/avatars", async (req,res) =>{
    const avatars = await  client.avatar.findMany();
    res.json({avatars : avatars.map(a => {
        return {
            id: a.id,
            imageUrl: a.imageUrl,
    }})})
})

router.use("/user", userRouter)
router.use("/auth" ,authRouter)
router.use("/space", spaceRouter)
router.use("/admin", adminRouter)