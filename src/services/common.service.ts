import { Request, Response } from "express";
import { ResponseSchema } from "./types";

export class CommonService {

    public async sendInvites(formId: string) {}

    public getRootUrl(req: Request | string): string {
        const url = new URL(typeof req === 'string'? req: req.url);
        return url.origin;
    }
}


export function getFormattedResponseFormSchema<T = any>(res: Response, schema: ResponseSchema<T>): Response {
    return res.status(schema.status).send(schema.res);
}