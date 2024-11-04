import { Router } from "express";
import { userRouter } from "./user";
import { authRouter } from "./auth";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";

export const router = Router();

router.get("/elements",(req,res) =>{

})

router.get("/avatars",(req,res) =>{

})

router.use("/user",userRouter )
router.use("/auth",authRouter )
router.use("/admin",adminRouter )
router.use("/space",spaceRouter )
