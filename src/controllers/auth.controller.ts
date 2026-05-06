import { Router, Request, Response} from "express";
import { isNonEmptyString, isString, isUserLoginDTO } from "../utils/guards";
import { LoggerService } from "../services/logger.service";
import { AuthService } from "../services/auth.service";
import { json } from "node:stream/consumers";
import { AuthentificatedUserDTO } from "../models/user.models";
import { UsersService } from "../services/users.service";


export const authController = Router();

authController.post("/login", (req:Request, res:Response)=>{
    const loginData = req.body

    if(!isUserLoginDTO(loginData)){
        LoggerService.error("Missing or empty username / password");
        return res.status(400).json("Missing or empty username / password")
    }
    const username = loginData.username;
    const password = loginData.password;
    

    const authUser = AuthService.login(username,password); // 
    if(!authUser){
        return res.status(401).send("Unauthorized");
    }

   
    const response : AuthentificatedUserDTO = { 
   
        username : authUser.username,
        token : authUser.token,
        role : authUser.role,
    }
    return res.status(200).json(response);
})
