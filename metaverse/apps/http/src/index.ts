import express from "express";
import { router } from "./routes/v1";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json())

app.use("/api/v1", router)

app.listen(process.env.PORT || 3003 , () => {
    console.log("Server is running on port 3000 -- http://localhost:3003")
})