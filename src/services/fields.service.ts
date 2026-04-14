import { FieldsMapper } from "../mappers/fields.mapper";
import { Field, FieldDBO, FieldDTO, NewField, NewFieldDTO } from "../models/field.model";
import { Game } from "../models/game.model";
import { UserDBO } from "../models/user.models";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";

export class FieldsService {
    private static dbPath = './data/fields.json'
    

    private static readFieldsDB(): Field [] {
        let dbos : FieldDBO [] = [];
        try {
            dbos = FilesService.readFile<FieldDBO>(this.dbPath);
            
        } catch (error) {
            LoggerService.error("Error reading .json " + error);
            return [];
        }
        const items : Field [] = [];
        for (let i = 0; i < dbos.length; i++) {
            items.push(FieldsMapper.fromDBO(dbos[i]))
        }
        return items;
       
    }

    public static getAll() : Field [] {
        return this.readFieldsDB();
    }

    private static writeFieldsDB(fields : Field []): boolean {
        let dbos : FieldDBO []= [];

        for (const field of fields) {
            dbos.push(FieldsMapper.toDBO(field))
        }
        
        try {
            FilesService.writeFile<FieldDBO>(this.dbPath,dbos)
            return true;
        } catch (error) {
            LoggerService.error("Error writing fields.json" + error)
            return false;
        }

    } 



    public static create(field : NewField) : Field | undefined {
        const fieldsDB : Field [] = this.readFieldsDB();

        const newField : Field = {
            id : fieldsDB.length + 1,
            name : field.name,
            location : field.location,
            createdAt : new Date(),
            updatedAt : new Date(),



        }
        fieldsDB.push(newField);
        if(!FieldsService.writeFieldsDB(fieldsDB)){
            return undefined;
        }
        return newField;

    } 
}