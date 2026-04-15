import { Field, FieldDBO, FieldDTO, NewField, NewFieldDTO } from "../models/field.model";

export class FieldsMapper {
    static fromDBO (dbo: FieldDBO) : Field {
        return {
            id : dbo.id,
            name: dbo.name,
            location : dbo.location,
            createdAt : new Date(dbo.created_at),
            updatedAt : new Date(dbo.updated_at),
        }
    }

    static toDTO(field : Field ) : FieldDTO {
        return {
        id : field.id,
        name : field.name,
        location : field.location,
        createdAt : field.createdAt?.toISOString(),
        updatedAt : field.updatedAt?.toISOString()
    }
}
static toDBO (field : Field) : FieldDBO {
    return {
        id : field.id,
        name : field.name,
        location : field.location,
        created_at : field.createdAt ?  field.createdAt?.toISOString() : new Date().toISOString(),
        updated_at : field.updatedAt ?  field.updatedAt?.toISOString() : new Date().toISOString(),

    }
}

static fromNewFieldDTO(newFieldDTO : NewFieldDTO) : NewField {
    return {
        name : newFieldDTO.name,
        location : newFieldDTO.location,
    }
}

static fromDTO(dto : FieldDTO) : Field {
    return {
        id : dto.id,
        name : dto.name,
        location : dto.location,
        createdAt : dto.createdAt ? new Date(dto.createdAt) : new Date(),
        updatedAt : dto.updatedAt ? new Date(dto.updatedAt) : new Date(),

    }
}
}