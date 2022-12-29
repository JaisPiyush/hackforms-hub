import { Form, FormStats, UserProfile } from "@prisma/client";
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
}

export interface ResponseSchema<T> {
    status: number,
    res: {
        data?: T,
        err?: string
    }
}

export interface SerializedForm {
    form: Partial<Form>,
    rawContentUrl: string;
}



export interface SerializedFormAnalytics {
    rawContentUrl: string;
    stats: FormStats;
    responses: Array<{
        id: string,
        cid: string,
        url: string
    }>
}