import { Request } from "express";

export class CommonService {

    public async sendInvites(formId: string) {}

    public getRootUrl(req: Request | string): string {
        const url = new URL(typeof req === 'string'? req: req.url);
        return url.origin;
    }
}