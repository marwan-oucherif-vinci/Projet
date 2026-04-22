import { NextFunction, Response } from "express";
import { AuthenficatedRequest } from "../models/auth.model";
import { generateFakeToken, validateFakeToken } from "../utils/auth";
import { AuthentificatedUser, Erole, User } from "../models/user.models";
import { UsersService } from "./users.service";

export class AuthService{

   public static authorize (req : AuthenficatedRequest, res:Response, next : NextFunction){
        const token = req.get("authorization")
        
        if(!token){ // si c pas un token
           return res.sendStatus(401);
        }

       const username = validateFakeToken(token);
        
         if(!username) {
            return res.status(401).send('Unauthorized');
      }
      
        const existingUser : User | undefined = UsersService.getByUsername(username);

        if(!existingUser){
            return res.sendStatus(401); 
        }
        req.user = existingUser; 
        return next();
    }

    
   public static login(username : string, password : string) : AuthentificatedUser | undefined {
    const userFound = UsersService.getByUsername(username);
    if(!userFound) return undefined;

    if(!UsersService.validateUser(password,userFound.password)) return undefined;

    const token = generateFakeToken(username);
    if(!token) return undefined;

    const result : AuthentificatedUser = {
        username : username,
        token : token,
        role : userFound.role
    };
    return result;

   }
}