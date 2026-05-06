import e, { Router,Response, Request } from "express";
import { LoggerService } from "../services/logger.service";
import { UsersService } from "../services/users.service";
import { UsersMapper } from "../mappers/users.mapper";
import { Erole, NewUserDTO, User, UserDTO } from "../models/user.models";
import { isNewUserDTO, isString, isUserDTO } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { AuthenficatedRequest } from "../models/auth.model";

export const usersController = Router();

usersController.get('/', AuthService.authorize, (req:AuthenficatedRequest, res: Response)=>{
    LoggerService.info('[GET] /users/');
    const loggedInUser = req.user;
    if (!loggedInUser) return res.sendStatus(401);


    const users = UsersService.getAll(); 


    
    const usersDTO = []
    if(loggedInUser.role === Erole.ADMIN){
    for (let i = 0; i < users.length; i++) {
        usersDTO.push(UsersMapper.toDTO(users[i]))
        }
    return res.status(200).json(usersDTO);
        
    }
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
            return res.status(400).json("Invalid or missing fields")
        }

        const user : User | undefined | "Invalid_Email" = UsersService.create(UsersMapper.fromNewUserDTO(userDTO))
        if(user === undefined){
            LoggerService.error('User not created, already exists with this email or username')
            return res.status(500).json("User not created, already exists with this email or username");
        }
        if(user === "Invalid_Email"){
            LoggerService.error("Email format is invalid")
            return res.status(400).json({error : `Email format is invalid`})
        }
        LoggerService.info("User created")
        return res.status(201).json(UsersMapper.toDTO(user));        

        

})


usersController.get('/username/:username',AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info('[GET] /users/username/:username');
    const loggedInUser = req.user;
    const username = req.params.username;
    if(!isString(username)){
        LoggerService.error('Invalid username');
        return res.status(400).json({error: `Invalid username: ${username}`});
    }

    if(loggedInUser?.role !== Erole.ADMIN && loggedInUser?.role !== Erole.REFEREE){
        LoggerService.error("Caller is not admin / referee ");
        return res.status(401).json({error:`Caller is not admin / referee`})
    }
    const result : User | undefined = UsersService.getByUsername(username);

    if(!result){
        LoggerService.error('User not found');
        return res.status(404).json({error: `User with username ${username} not found`})
    }
    LoggerService.info("User found")
    return res.status(200).json(UsersMapper.toDTO(result));
} )

usersController.get('/email/:email',AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info('[GET] /email/email');
    const email = req.params.email;       
    const loggedInUser = req.user;

    if(!isString(email)){
        LoggerService.error('Invalid email');
        return res.status(400).json({error : `Invalid email: ${email}`})
    }

    if(loggedInUser?.role !== Erole.ADMIN && loggedInUser?.role !== Erole.REFEREE){
         LoggerService.error("Caller is not admin / referee ");
        return res.status(401).json({error:`Caller is not admin / referee`})
    }

    const result : User | undefined = UsersService.getByEmail(email);
    if(!result){
        LoggerService.error('User not found')
        return res.status(404).json({error: `User with email ${email} not found`})
    }
    LoggerService.info("User found")
    return res.status(200).json(UsersMapper.toDTO(result));
    })


usersController.get('/:id',AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info('[GET] /:id')
    const loggedInUser = req.user;
    const id = Number(req.params.id);
    if(isNaN(id)){
        LoggerService.error("ID is not a valid number")
        return res.status(400).json({error : `Invalid id : ${req.params.id}`})
    }

   
    const result : User | undefined = UsersService.getById(id);
    if(!result){
         LoggerService.info("User not found")
        return res.status(404).json({error: `User with id ${id} not found`})
    }
    if(loggedInUser?.role === Erole.ADMIN ||  loggedInUser?.id === result?.id ){ 
    return res.status(200).json(UsersMapper.toDTO(result))
    }
    return res.status(200).json(UsersMapper.toShortDTO(result));

})

usersController.put('/:id',AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info('[PUT] /users/:id')
    const loggedInUser = req.user;
    const id = Number(req.params.id);
    if(isNaN(id)){
        LoggerService.error("ID is not a valid number")
        return res.status(400).json({error : `Invalid id : ${req.params.id}`})
    }
    const userToUpdate = UsersService.getById(id);
    if(!userToUpdate){
        LoggerService.error("User not found")
        return res.status(404).json({error : `User with id ${id} not found`})
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

    if(loggedInUser?.role !== Erole.ADMIN && loggedInUser?.id !== id){
        LoggerService.error("Authenticated user is not an admin and tries to update another user")
        return res.status(403).json({error : `Authenticated user is not an admin and tries to update another user`})
    }

    const updatedUser : User | undefined = UsersService.update(UsersMapper.fromDTO(userDTO),loggedInUser.role);

    if(!updatedUser){
        LoggerService.error("User not found");
        return res.status(404).json({error : `User with id ${id} not found`});
    }

    return res.status(200).json(UsersMapper.toDTO(updatedUser));
})

usersController.delete('/:id',AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info("[DELETE] /:id");
    const loggedInUser = req.user;
    const id = Number(req.params.id);
    
    if(isNaN(id)){
        LoggerService.error("ID is not a valid nubmer")
        return res.status(400).json({error : `Invalid ID : ${req.params.id}`})
    }
    if(loggedInUser?.role !== Erole.ADMIN && loggedInUser?.id !== id){
        LoggerService.error("Authenticated user is not an admin")
        return res.status(403).json({error : `Authenticated user is not an admin`})
    }
    const deletedUser = UsersService.delete(id);
    if(deletedUser?.role === Erole.ADMIN) {
        LoggerService.error(" attempt to delete an admin account")
        return res.status(400).json({error :`attempt to delete an admin account`})
    }

    if(!deletedUser){
        LoggerService.error(`User with id ${id} not found `)
        return res.status(404).json({error : `User with id ${id} not found`})
    }
        
    LoggerService.info(`User ${id} successfully soft-deleted`)
    return res.status(200).json("user with id " + id + " soft deleted")
})


usersController.patch('/:id/role/:role',AuthService.authorize, (req: AuthenficatedRequest, res: Response) => {
    LoggerService.info("[PATCH] /:id/role/:role")
    const loggedInUser = req.user;
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
  
    if(loggedInUser?.role !== Erole.ADMIN){
        LoggerService.error("Authentificated user is not an admin")
        return res.status(403).json({error : `Authentificated user with id ${loggedInUser?.id} is not an admin`})
    }
    

    
    const updatedUser = UsersService.updateRole(id, role);
    

    if(updatedUser === "Not a player"){
        LoggerService.error("User is not a player")
        return res.status(400).json({error : `User with id ${id} is not a player`})
    }
    if (updatedUser === undefined) {
        LoggerService.error(`User with id ${id} not found`)
        return res.status(404).json({ error: `User with id ${id} not found ` });
    }

     return res.status(200).json(UsersMapper.toDTO(updatedUser));
    });


    usersController.patch('/:id/reactivate',AuthService.authorize,(req: AuthenficatedRequest, res: Response) => {
    LoggerService.info("[PATCH] /:id/reactivate")
    const loggedInUser = req.user;

    const id = Number(req.params.id);

   if(isNaN(id)){
        LoggerService.error("ID is not a valid nubmer")
        return res.status(400).json({error : `Invalid ID : ${req.params.id}`})
    }

    if(loggedInUser?.role !== Erole.ADMIN){
        LoggerService.error("Authentificated user is not an admin")
        return res.status(403).json({error : `Authentificated user with id ${loggedInUser?.id} is not an admin`})
    }

    const updatedUser = UsersService.reactivate(id);


    if (!updatedUser) {
        LoggerService.error(`Failed to reactivate user ${id} because not found`);
        return res.status(404).json({ error: `User with id ${id} not found` });
    }

    LoggerService.info(`User ${id} reactivated`);
    return res.status(200).send("User reactivated"); 
});