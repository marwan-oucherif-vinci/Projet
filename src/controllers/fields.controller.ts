import { Router,Request,Response } from "express";
import { LoggerService } from "../services/logger.service";
import { FieldsService } from "../services/fields.service";
import { FieldsMapper } from "../mappers/fields.mapper";
import { Field, FieldDTO, NewFieldDTO } from "../models/field.model";
import { isFieldDTO, isNewFieldDTO } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { AuthenficatedRequest } from "../models/auth.model";
import { Erole } from "../models/user.models";

export const fieldsController = Router();

fieldsController.get('/',(req:Request,res:Response)=>{
    LoggerService.info("[GET] /fields/")

    const fields = FieldsService.getAll();
    const fieldsDTO : FieldDTO [] = []

    for (let i = 0; i < fields.length; i++) {
        fieldsDTO.push(FieldsMapper.toDTO(fields[i]))
        
    }
    return res.status(200).json(fieldsDTO)

})

fieldsController.post('/',AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info("[POST] /fields/")
    const fieldDTO : NewFieldDTO = req.body;
    const loggedInUser = req.user;
    
    if(!isNewFieldDTO(fieldDTO)){
        LoggerService.error("Name or location is missing or invalid")
        return res.status(400).json({error : `Name or location is missing or invalid`})
    }
    if(loggedInUser?.role !== Erole.ADMIN){
        LoggerService.error("Authenticated user is not an admin");
        return res.status(403).json({error : `Authenticated user with id ${loggedInUser?.id} is not an admin`})
    }

    const field : Field | undefined = FieldsService.create(FieldsMapper.fromNewFieldDTO(fieldDTO))
    if(!field) {
        LoggerService.error("Field not created")
        return res.status(404).send("Field not created")
    }

    return res.status(201).json(FieldsMapper.toDTO(field));
})


fieldsController.get('/:id',(req:Request,res:Response)=>{
LoggerService.info("[GET] /fields/:id");
const id = Number(req.params.id)

if(isNaN(id)){
    LoggerService.error("Invalid id")
    return res.status(400).json({error: `Invalid id : ${req.params.id}` })
}
const field = FieldsService.getById(id);
if(!field){
    LoggerService.error("Field not found");
    return res.status(404).json({error: `Field with id ${id} not found`})
}
return res.status(200).json(FieldsMapper.toDTO(field));

})



fieldsController.put('/:id',AuthService.authorize,(req:AuthenficatedRequest,res:Response)=>{
    LoggerService.info("[PUT] /fields/:id")
    const id = Number(req.params.id)
    const fieldInfo : FieldDTO = req.body;
    const loggedInUser = req.user;

   
if(isNaN(id)){
    LoggerService.error("Invalid id")
    return res.status(400).json({error: `Invalid id : ${id}` })
}
if(!isFieldDTO(fieldInfo)){
    LoggerService.error("Invaid payload")
    return res.status(400).json({error : "invalid payload : " + JSON.stringify(fieldInfo)})
    
}
if(id !== fieldInfo.id){
    LoggerService.error("Id missmatch between body and path")
    return res.status(400).json({error : `Id missmatch between body and path`})
}

if(loggedInUser?.role !== Erole.ADMIN){
    LoggerService.error("Authenticated user is not an admin")
    return res.status(403).json({error : `Authenticated user with id ${loggedInUser?.id} is not an admin`})
}
const result = FieldsService.update(FieldsMapper.fromDTO(fieldInfo)) 

if(!result) {
    LoggerService.error("Field not found")
    return res.status(404).json({error : `Field with id ${fieldInfo.id} not found`})
}
return res.status(200).json(FieldsMapper.toDTO(result));

 
})
