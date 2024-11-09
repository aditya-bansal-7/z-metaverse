import { Router } from "express";
import { userMiddlware } from "../../middleware/user";
import { AddElementSchema, CreateElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../../types";
import client from "@repo/db/client"


export const spaceRouter = Router();

spaceRouter.post("/", userMiddlware, async (req, res) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data" })
    }

    if (!parsedData.data?.mapId) {
        const space = await client.space.create({
            data: {
                name: parsedData.data?.name!,
                width: parseInt(parsedData.data?.dimensions.split("x")[0]!),
                height: parseInt(parsedData.data?.dimensions.split("x")[1]!),
                creatorId: req.userId
            }
        })
        res.json({
            spaceId: space.id
        })
        return
    }

    const map = await client.map.findUnique({
        where: {
            id: parsedData.data.mapId
        }, select: {
            elements: true,
            width: true,
            height: true,
        }
    })
    if (!map) {
        res.status(400).json({
            message: "Invalid map id"
        })
        return
    }

    const space = await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: map.width,
                height: map.height,
                creatorId: req.userId
            }
        })
        await client.spaceElements.createMany({
            data: map.elements.map(element => {
                return {
                    spaceId: space.id,
                    elementId: element.elementId,
                    x: element.x,
                    y: element.y
                }
            })
        })
        return space;
    })

    res.json({
        spaceId: space.id
    })
})

spaceRouter.get("/:spaceId", async (req, res) => {
    if (!req.params.spaceId) {
        res.status(400).json({
            message: "Invalid space id"
        })
        return
    }
    try {
        const space = await client.space.findUnique({
            where: {
                id: req.params.spaceId
            }, include: {
                elements: {
                    include: {
                        element: true
                    }
                }
            }
        })
        if (!space) {
            res.status(400).json({
                message: "Space not found"
            })
            return
        }
        res.json({
            dimensions: `${space.width}x${space.height}`, 
            elements: space.elements.map(e => {return {
                id: e.id,
                element : {
                    id: e.element.id,
                    imageUrl: e.element.imageUrl,
                    width: e.element.width,
                    height: e.element.height,
                    static: e.element.static
                },
                x: e.x,
                y: e.y
            }})
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })  
    }

})

spaceRouter.delete("/:spaceId", userMiddlware, async (req, res) => {
    if (!req.params.spaceId) {
        res.status(400).json({
            message: "Invalid space id"
        })
        return
    }
    try {
        const space = await client.space.findUnique({
            where: {
                id: req.params.spaceId
            }
        })

        if (!space) {
            res.status(400).json({
                message: "Space not found"
            })
            return
        }

        if (space.creatorId !== req.userId) {
            res.status(403).json({
                message: "Unauthorized"
            })
            return
        }
        await client.space.delete({
            where: {
                id: req.params.spaceId
            }
        })
        res.json({
            message: "Successfully deleted space"
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })  
    }

})

spaceRouter.get("/all", userMiddlware, async (req, res) => {
    try {
        const spaces = await client.space.findMany({
            where: {
                creatorId: req.userId
            }
        })
        res.json({
            spaces: spaces.map(space => {
                return {
                    id: space.id,
                    name: space.name,
                    dimensions: `${space.width}x${space.height}`,
                    thumbnail: space.thumbnail,
                }
            })
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server error"
        })  
    }
})

spaceRouter.post("/element",userMiddlware, async (req, res) => {
    const parsedData = AddElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data" })
    }
    const space = client.space.findUnique({
        where: {
            id: parsedData.data?.spaceId,
            creatorId: req.userId
        }, select: {
            id: true,
            elements: true,
            width: true,  
            height: true,
        }
    })
    if (!space) {
        res.status(400).json({
            message: "Space not found"
        })
        return
    }
    await client.spaceElements.create({
        data: {
            spaceId: req.body.spaceId,
            elementId: req.body.elementId,
            x: req.body.x,
            y: req.body.y
        }
    })
    res.json({
        message: "Successfully added element"
    })
})

spaceRouter.delete("/element",userMiddlware, async (req, res) => {
    const parsedData = DeleteElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data" })
    }
    

    const spaceElement = await client.spaceElements.findUnique({
        where: {
            id: parsedData.data?.id
        },
        include: {
            space: true
        }
    })
    if (!spaceElement) {
        res.status(400).json({
            message: "Element not found"
        })
        return
    }

    if (spaceElement.space.creatorId !== req.userId) {
        res.status(403).json({
            message: "Unauthorized"
        })
        return
    }
    
    await client.spaceElements.delete({
        where: {
            id: parsedData.data?.id
        }
    })
    res.json({
        message: "Successfully deleted element"
    })
})