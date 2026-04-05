import { Router,Response, Request } from "express";
import { LoggerService } from "../services/logger.service";
import { UsersService } from "../services/users.service";
import { UsersMapper } from "../mappers/users.mapper";
import { NewUserDTO, User, UserDTO, UserShortDTO } from "../models/user.models";
import { isNewUserDTO } from "../utils/guards";

export const usersController = Router();

usersController.get('/',(req:Request, res: Response)=>{
    LoggerService.info('[GET] /users/');
    const users = UsersService.getAll(); 
    const usersDTO : UserShortDTO [] = []
    for (let i = 0; i < users.length; i++) {
        usersDTO.push(UsersMapper.toShortDTO(users[i]))
        
    
        
    }
    return res.status(200).json(usersDTO);

})


usersController.post('/',(req:Request, res:Response)=>{
        LoggerService.info('[POST] /users/');
        const userDTO: NewUserDTO = req.body

        if(!isNewUserDTO(userDTO)){
            LoggerService.error("Bad request")
            return res.status(400).send();
        }

        const user : User | undefined = UsersService.create(UsersMapper.fromNewUserDTO(userDTO))
        

        

        return res.status(200).json()
        

        

})

