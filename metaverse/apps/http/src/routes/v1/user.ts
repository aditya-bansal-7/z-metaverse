import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db/client"
import { userMiddlware } from "../../middleware/user";
export const userRouter = Router();

userRouter.post("/metadata",userMiddlware,async (req,res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(400).json({message:"Invalid Data / Validation failed"})
        return
    }

    const avatar = await client.avatar.findUnique({
        where: {
            id: parsedData.data.avatarId
        }
    })
    if(!avatar){
        res.status(400).json({message:"Invalid avatar id"})
        return
    }
    await client.user.update({
        where: {
            id: req.userId
        },
        data: {
            avatarId: parsedData.data.avatarId
        }
    })
    res.json({message:"Success"})
})

userRouter.get("/metadata/bulk", async (req, res) => {
    const { ids } = req.query as {ids:string}
    const userIds = ids.slice(1,-1).split(",")
    console.log(userIds)
    const query = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        },
        select: {
            avatar: true,
            id: true
        }
    })
    console.log(query)

    const avatars = query.map(user => {return {
        
        userId: user.id,
        imageUrl: user.avatar?.imageUrl,
    }})
    console.log(avatars)
    res.json({
       avatars
    })
})

userRouter.get("/:id", async (req, res) => {
    const user = await client.user.findUnique({
        where: {
            id: req.params.id
        }
    })

    if(!user){
        res.status(404).json({message:"User not found"})
        return
    }

    res.json({
        user
    })
})