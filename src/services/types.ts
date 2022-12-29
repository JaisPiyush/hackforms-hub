import { Form, FormResponse, FormStats, UserProfile } from "@prisma/client";
import { EncryptedFormDto } from "../dto/encryptedForm.dto";
import { Request } from "express";
import { EncryptedFormResponseDto } from "../dto/formResponse.dto";

export interface CreateFormBody {
    form: EncryptedFormDto,
    key?: string;
}

export interface CreateFormResponseBody {
    formResponse: EncryptedFormResponseDto;
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

export interface GetFormResponse {
    formResponse: {
        title: string,
        formCid: string;
        cid: string;
        formId: string;
        responseId: string;
    },
    formContentUrl: string;
    responseContentUrl: string
}

export interface SerializedFormResponse {
    formResponse: Partial<FormResponse>;
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