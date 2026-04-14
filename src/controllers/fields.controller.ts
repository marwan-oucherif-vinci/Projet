import { Router,Request,Response } from "express";
import { LoggerService } from "../services/logger.service";
import { FieldsService } from "../services/fields.service";
import { FieldsMapper } from "../mappers/fields.mapper";
import { Field, FieldDTO, NewFieldDTO } from "../models/field.model";
import { isNewFieldDTO } from "../utils/guards";
import { error } from "node:console";
import { TeamsService } from "../services/teams.service";

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

fieldsController.post('/',(req:Request,res:Response)=>{
    LoggerService.info("[POST] /fields/")
    const fieldDTO : NewFieldDTO = req.body;

    if(!isNewFieldDTO(fieldDTO)){
        LoggerService.error("Name or location is missing or invalid")
        return res.status(400).send()
    }

    const field : Field | undefined = FieldsService.create(FieldsMapper.fromNewFieldDTO(fieldDTO))

    return res.status(201).json(FieldsMapper.toDTO(field));
    // je fais juste ça ? (corriger toute les erreurs)
})


fieldsController.get('/:id',(req:Request,res:Response)=>{
LoggerService.info("[GET] /fields/:id");
const id = Number(req.params.id)

if(isNaN(id)){
    LoggerService.error("Invalid id")
    return res.status(400).json({error: `Invalid id : ${id}` })
}
const field = FieldsService.getById(id);
if(!field){
    LoggerService.error("Field not found");
    return res.status(404).json({error: `Field ${field} with id ${id} not found`})
}
return res.status(200).json(FieldsMapper.toDTO(field));

})



fieldsController.put('')
