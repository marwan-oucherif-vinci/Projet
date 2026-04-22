import { NextFunction, Response } from "express";
import { AuthenficatedRequest } from "../models/auth.model";
import { validateFakeToken } from "../utils/auth";
import { AuthentificatedUser, User } from "../models/user.models";
import { UsersService } from "./users.service";

export class AuthService{

   public static authorize (req : AuthenficatedRequest, res:Response, next : NextFunction){
        const token = req.get("authorization")
        
        if(!token){ // si c pas un token
            res.sendStatus(401);
        }

        const username = validateFakeToken(token);
        
        if(!username) {
            return res.status(401).send('Unauthorized');
        }
        
        const existingUser : User | undefined = UsersService.getByUsername(username);

        if(!existingUser){ // ça veut dire il existe pas ? 
            return res.sendStatus(401); //  pq on spécifie pas le message et ça veut dire quoi le 401
        }
        req.user = existingUser; // jcapte pas trop les 2 dernieres lignes
        return next();
    }
    
   public static login(username : string, password : string) : AuthentificatedUser | undefined {
    const userFound = UsersService.getByUsername(username);
    if(!userFound) return undefined;

   }
}