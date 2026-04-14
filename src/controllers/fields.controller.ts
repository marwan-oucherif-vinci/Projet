import { Router,Request,Response } from "express";
import { LoggerService } from "../services/logger.service";
import { FieldsService } from "../services/fields.service";
import { FieldsMapper } from "../mappers/fields.mapper";
import { Field, FieldDTO, NewFieldDTO } from "../models/field.model";
import { isNewFieldDTO } from "../utils/guards";

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