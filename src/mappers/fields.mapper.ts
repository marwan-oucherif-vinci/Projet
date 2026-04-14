import { Field, FieldDBO, FieldDTO, NewField, NewFieldDTO } from "../models/field.model";

export class FieldsMapper {
    static fromDBO (dbo: FieldDBO) : Field {
        return {
            id : dbo.id,
            name: dbo.name,
            location : dbo.location,
            createdAt : new Date(dbo.createdAt),
            updatedAt : new Date(dbo.updatedAt),
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
        created_at : field.createdAt?.toISOString(),
        updated_at : field.createdAt?.toISOString(),

    }
}

static fromNewFieldDTO(newFieldDTO : NewFieldDTO) : NewField {
    return {
        name : newFieldDTO.name,
        location : newFieldDTO.location,
    }
}
}