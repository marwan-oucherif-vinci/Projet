import { Router, Request, Response} from "express";
import { isNonEmptyString, isString, isUserLoginDTO } from "../utils/guards";
import { LoggerService } from "../services/logger.service";


export const authController = Router();

authController.post("/login", (req:Request, res:Response)=>{
    const username = req.body.username;
    const password = req.body.password;

    if(!isUserLoginDTO(username) || !isUserLoginDTO(password)){
        LoggerService.error("Missing or empty username / password");
        res.status(400).json("Missing or empty username / password")
    }

    const authUser = AuthService.login(username,password);

})
