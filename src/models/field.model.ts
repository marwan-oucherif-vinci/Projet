export interface Field {
    id : number,
    name : string,
    location : string,
    createdAt? : Date,
    updatedAt? : Date

}

export interface FieldDTO {
    id : number,
    name : string,
    location : string,
    createdAt? : string,
    updatedAt? : string
}

export interface FieldDBO {
    id : number,
    name : string,
    location : string,
    created_at  : string,
    updated_at : string,
}

export interface NewFieldDTO {
    name : string,
    location : string,
}

export interface NewField {
    name : string,
    location : string,
}



