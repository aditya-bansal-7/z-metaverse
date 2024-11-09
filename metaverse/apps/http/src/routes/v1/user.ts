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

    res.json({
        avatars: query.map(user => {
            userId: user.id
            imageUrl: user.avatar?.imageUrl
        })
    })
})