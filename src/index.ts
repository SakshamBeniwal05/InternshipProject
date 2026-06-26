import express from "express";
import type  { Application, Request, Response } from "express";
import routingRouter from "./routes/routing.js";

const app:Application = express()

app.use(express.json())
app.use(express.urlencoded({extended:true,limit:"10kb"}))

app.use('/api',routingRouter)

app.get('/',(req:Request,res:Response)=>{
    res.json("hello")
})

app.listen(3000,():void=>{
    console.log("server is running ");
    
})