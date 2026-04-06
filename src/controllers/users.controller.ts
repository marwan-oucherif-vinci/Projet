import { Router,Response, Request } from "express";
import { LoggerService } from "../services/logger.service";
import { UsersService } from "../services/users.service";
import { UsersMapper } from "../mappers/users.mapper";
import { Erole, NewUserDTO, User, UserDTO, UserShortDTO } from "../models/user.models";
import { isNewUserDTO, isString, isUserDTO } from "../utils/guards";
import { error } from "node:console";

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
            LoggerService.error("Invalid or missing fields")
            return res.status(400).send();
        }

        // je comprend pas trop bien cette ligne 
        const user : User | undefined = UsersService.create(UsersMapper.fromNewUserDTO(userDTO))
        if(!user){
            LoggerService.error('User not created')
            return res.status(500).send();
        }
        LoggerService.info("User created")
        return res.status(201).json(UsersMapper.toDTO(user));        

        

})


usersController.get('/username/:username',(req:Request,res:Response)=>{
    LoggerService.info('[GET] /users/username/:username');

    const username = req.params.username;
    if(!isString(username)){
        //dans le swagger on nous dis pas de faire error 400?
        LoggerService.error('Invalid username');
        return res.status(400).json({error: `Invalid username: ${username}`});
    }

    const result : User | undefined = UsersService.getByUsername(username);

    if(!result){
        LoggerService.error('User not found');
        return res.status(404).json({error: `User with username ${username} not found`})
    }
    // dois-je réelement renvoyer sous toDTO ? car dans la solution du prof n'a pas fait ça
    LoggerService.info("User found")
    return res.status(200).json(UsersMapper.toDTO(result));
})

usersController.get('/email/:email',(req:Request,res:Response)=>{
    LoggerService.info('[GET] /email/email');

    const email = req.params.email;
    if(!isString(email)){
        // la meme qu'en haut
        LoggerService.error('Invalid email');
        return res.status(400).json({error : `Invalid email: ${email}`})
    }

    const result : User | undefined = UsersService.getByEmail(email);
    if(!result){
        LoggerService.error('User not found')
        return res.status(404).json({error: `User with email ${email} not found`})
    }
    LoggerService.info("User found")
    return res.status(200).json(UsersMapper.toDTO(result));
    })


usersController.get('/:id',(req:Request,res:Response)=>{
    LoggerService.info('[GET] /:id')
    const id = Number(req.params.id);
    if(isNaN(id)){
        LoggerService.error("ID is not a valid number")
        return res.status(400).json({error : `Invalid id : ${id}`})
    }

    const result : User | undefined = UsersService.getById(id);
    if(!result){
        LoggerService.error("User not found")
        return res.status(404).json({error: `User with id ${id} not found`})
    }
    LoggerService.info("User found")
    return res.status(200).json(UsersMapper.toDTO(result));
})

usersController.put('/:id',(req:Request,res:Response)=>{
    LoggerService.info('[PUT] /users/:id')

    const id = Number(req.params.id);
    if(isNaN(id)){
        LoggerService.error("ID is not a valid number")
        return res.status(400).json({error : `Invalid id : ${req.params.id}`})
    }
    const userDTO : UserDTO = req.body;
    if(!isUserDTO(userDTO)){
        LoggerService.error("Invalid payload");
        return res.status(400).json({error : "Invalid payload"});
    }
    if(id !== userDTO.id) {
        LoggerService.error("ID in path and body don't match")
        return res.status(400).json({error : "ID in path and body don't match "})
    
    }
    const updatedUser : User | undefined = UsersService.update(UsersMapper.fromDTO(userDTO));

    if(!updatedUser){
        LoggerService.error("User not found");
        return res.status(404).json({error : `User with id ${id} not found`});
    }
    //grave si je met At en non optionnel pour le dto ?
    LoggerService.info("Updated user")
    return res.status(200).json(UsersMapper.toDTO(updatedUser));
})


usersController.delete('/:id',(req:Request,res:Response)=>{
    LoggerService.info("[DELETE] /:id")
    const id = Number(req.params.id);
    
    if(isNaN(id)){
        LoggerService.error("ID is not a valid nubmer")
        return res.status(400).json({error : `Invalid ID : ${req.params.id}`})
    }
    const deletedUser = UsersService.delete(id);

    if(!deletedUser){
        LoggerService.error(`User with id ${id} not found or is an Admin`)
        return res.status(404).json({error : `User with id ${id} not found or is an Admin`})
    }
        
    LoggerService.info(`User ${id} successfully soft-deleted`)
    return res.status(200).json(UsersMapper.toDTO(deletedUser))
})

usersController.patch('/:id/role/:role', (req: Request, res: Response) => {
    LoggerService.info("[PATCH] /:id/role/:role")
    const id = Number(req.params.id);
    const role = req.params.role; 

   if(isNaN(id)){
        LoggerService.error("ID is not a valid nubmer")
        return res.status(400).json({error : `Invalid ID : ${req.params.id}`})
    }

  
    if (role !== Erole.ADMIN && role !== Erole.PLAYER && role !== Erole.REFEREE && role !== Erole.TRAINER) {

        LoggerService.error("Invalid role value")
        return res.status(400).json({ error: `Invalid role value : ${role}` });
    }

    
    const updatedUser = UsersService.updateRole(id, role);

    if (!updatedUser) {
        LoggerService.error(`User with id ${id} not found or is not a player`)
        return res.status(400).json({ error: `User with id ${id} not found or is not a player` });
    }

     LoggerService.info(`Updated User ${id} with new role`)
    return res.status(200).json(UsersMapper.toDTO(updatedUser));
});

usersController.patch('/:id/reactivate', (req: Request, res: Response) => {
    LoggerService.info("[PATCH] /:id/reactivate")
    const id = Number(req.params.id);

   if(isNaN(id)){
        LoggerService.error("ID is not a valid nubmer")
        return res.status(400).json({error : `Invalid ID : ${req.params.id}`})
    }

    const updatedUser = UsersService.reactivate(id);

    if (!updatedUser) {
        LoggerService.error(`Failed to reactivate user ${id}`);
        return res.status(404).json({ error: `User with id ${id} not found` });
    }

    LoggerService.info(`User ${id} reactivated`);
    return res.status(200).send(); 
});