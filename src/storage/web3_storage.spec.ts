import { Web3StorageBasedError } from "./errors";
import {File} from 'web3.storage';
import { Web3StorageDelegate, makeFileObjectFromString } from "./web3_storage";
import * as dotenv from 'dotenv';

jest.setTimeout(10000)
describe('Testing WEB3STORAGE utility module', () => {
    beforeEach(() => {
        dotenv.config();
    })

    test('should throw error due to no API Token', () => { 
        expect(process.env.WEB3STORAGE_TOKEN).toBeDefined();
        delete process.env.WEB3STORAGE_TOKEN
        expect(process.env.WEB3STORAGE_TOKEN).toBeUndefined();
        try {
            const client = new Web3StorageDelegate();
            throw new Error('delegate creation must throw error due to no API Token')
        }catch (e) {
            expect(e).toBeInstanceOf(Web3StorageBasedError);
        }
    });

    test('should create storage client', () => {
        try {
            
            expect(process.env.WEB3STORAGE_TOKEN).toBeDefined();
            const client = new Web3StorageDelegate();
            expect(client).toBeInstanceOf(Web3StorageDelegate);
        }catch(e) {
            throw new Error(`Should not throw error, has thrown: (${e})`);
        }
    });

    test('testing makeFileObjectFromString', () => {
        const file = makeFileObjectFromString(JSON.stringify('rerrange'), 'rearrage.txt');
        expect(file).toBeInstanceOf(File);
    });

    test('testing store for json data', async () => {
        const client = new Web3StorageDelegate();
        const data = JSON.stringify({name: 'Piyush'});
        const cid = await client.store(data, client.generateRandomName());
        expect(cid).toBeTruthy();
    })

    test('testing status for json data', async () => {
        const client = new Web3StorageDelegate();
        const obj = {name: "Piyush"};
        const data  = JSON.stringify(obj);
        const cid = await client.store(data, client.generateRandomName());
        const status = await client.getStatus(cid);
        expect(status).toBeTruthy();
    });

    test('testing get for json data', async () => {
        jest.setTimeout(20000)
        const client = new Web3StorageDelegate();
        const obj = {name: "Piyush"};
        const data  = JSON.stringify(obj);
        const cid = await client.store(data, client.generateRandomName());
        const file = await client.get(cid);
        expect(JSON.parse(await file.text())).toStrictEqual(obj);

    })
});