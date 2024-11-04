import { Router } from "express"

export const authRouter = Router();

authRouter.post("/signup", (req, res) => {
    res.json({
        message:"Sign Up"
    })
})

authRouter.post("/signin", (req,res) => {
    res.json({
        message:"Sign In"
    })
})