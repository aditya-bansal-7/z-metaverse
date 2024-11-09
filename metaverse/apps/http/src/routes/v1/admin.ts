import { Router } from "express";
import { adminMiddlware } from "../../middleware/admin";
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types";
import client from "@repo/db/client"

export const adminRouter = Router();

adminRouter.post("/element", adminMiddlware, async (req, res) => {
    const parsedData = CreateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data" })
    }
    const element = await client.element.create({
        data: {
            imageUrl: req.body.imageUrl,
            width: req.body.width,
            height: req.body.height,
            static: req.body.static,
        }
    })
    res.json({
        id: element.id
    })
})

adminRouter.post("/avatar", adminMiddlware, async (req, res) => {
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data" })
    }
    const avatar = await client.avatar.create({
        data: {
            name: req.body.name,
            imageUrl: req.body.imageUrl,
        }
    })
    res.json({
        avatarId: avatar.id
    })
})

adminRouter.post("/map", adminMiddlware, async (req, res) => {
    const parsedData = CreateMapSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data" })
    }
    const map = await client.map.create({
        data: {
            name: req.body.name,
            width: parseInt(req.body.dimensions.split("x")[0]),
            height: parseInt(req.body.dimensions.split("x")[1]),
            thumbnail: req.body.thumbnail,
            elements: {
                create: req.body.defaultElements.map((e: { elementId: any; x: any; y: any; }) => {
                    return {
                        elementId: e.elementId,
                        x: e.x,
                        y: e.y
                    }
                })
            }
        }
    })
    res.json({
        id: map.id
    })
})

adminRouter.put("/element/:elementId", adminMiddlware, async (req, res) => {
    const parsedData = UpdateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data" })
    }
    const element = await client.element.findUnique({
        where: {
            id: req.params.elementId
        }
    })
    if (!element) {
        res.status(400).json({
            message: "Element not found"
        })
        return
    }
    await client.element.update({
        where: {
            id: req.params.elementId
        },
        data: {
            imageUrl: req.body.imageUrl
        }
    })
    res.json({
        message: "Successfully updated element"
    })
})

