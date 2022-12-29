import { UserProfile } from "@prisma/client";
import { EncryptedFormDto } from "../dto/encryptedForm.dto";
import { Request } from "express";

export interface CreateFormBody {
    form: EncryptedFormDto,
    key?: string;
}

export interface UpdateFormBody extends CreateFormBody {}

export interface RequestWithUser extends Request {
    user?: Partial<UserProfile>
}

export interface FormShareLink {
    url: string;
    rawContentUrl:string;
}

export interface ResponseSchema<T> {
    status: number,
    res: {
        data?: T,
        err?: string
    }
}