import { NextFunction, Request, Response } from "express";
import { JWT_PASSWORD } from "../config";
import jwt from "jsonwebtoken";


export const userMiddlware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];

    if (!token) {
        console.log("No token found");
        res.status(403).json({message:"Unauthorized"});
        return;
    }
    try {
        const decoded = jwt.verify(token,JWT_PASSWORD) as {role:string, userId:string};
        if(decoded.role !== "Admin" && decoded.role !== "User"){
            res.status(403).json({message:"Unauthorized"})
            return
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (e) {
        console.log("Error", e); 
        res.status(403).json({message:"Unauthorized"});
    }
}