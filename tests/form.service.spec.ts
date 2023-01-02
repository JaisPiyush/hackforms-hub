import { UserProfile } from '@prisma/client';
import {services} from '../src/server'
import { generateRandomUser } from './helper';
import {EncryptedFormDto} from '../src/dto/encryptedForm.dto';

function getEncryptedForm(user: UserProfile) {
    const formData: EncryptedFormDto = {
        header: {
            alg: "AES-GCM",
            keyEncAlg: "ECDSA",
            access: "public"
        },
        payload: {
            data: "public_form",
            meta: {
                formId: '',
                endDate: Date.now() + 200000,
                startDate: Date.now(),
                isClosed: false,
                title: 'Testing public form',
            },
            iss: user.pubKey,
            owner: user.eoa,
            subRecord: {},
            inviteList: []
        },
        tail: {
            hash: 'random-hash'
        }

    };
    return formData;

}

describe("Testing FormService", () => {
    jest.setTimeout(10000);
    const formService = services.formService;

    let user: UserProfile;

    beforeAll(async () => {
        const _user =  await services.prisma.userProfile.findFirst();
        user = _user || await generateRandomUser(services.prisma);
    });

    

    test("testing createFormHandler for public access", async () => {
        const formData = getEncryptedForm(user);
        expect(await services.prisma.userProfile.count({
            where: {
                id: user.id
            }
        })).toEqual(1);

        

        const res = await formService.createForm(user, {form: formData});
        expect(res.status).toEqual(201);
        expect(res.res.data?.form.id).toBeDefined();
        const form = res.res.data?.form;
        expect(form?.title).toEqual(formData.payload.meta.title);

        expect(await services.prisma.formStats.count({
            where: {
                formId: form?.id
            }
        })).toEqual(1);

        expect(await services.prisma.formCommonKey.count({
            where: {
                formId: form?.id
            }
        })).toEqual(0);

    });

    test("testing createFormHandler for private access; must throw error", async () => {
        const formData = getEncryptedForm(user);
        formData.header.access = "private";
        const res = await formService.createForm(user, {form: formData});
        expect(res.status).toEqual(400);
    });

    test("testing createFormHandler for private access; must pass", async () => {
        const formData = getEncryptedForm(user);
        formData.header.access = "private";
        const res = await formService.createForm(user, {
            form: formData,
            key: services.formService.generateFormId()
        });
        expect(res.status).toEqual(201);
        const form = res.res.data?.form;
        expect(
            await services.prisma.formCommonKey.count({
                where: {
                    formId: form?.id
                }
            })
        ).toEqual(1);
    })

    
})