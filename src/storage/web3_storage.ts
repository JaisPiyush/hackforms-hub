import { Web3Storage, PutOptions } from "web3.storage";
import { Web3StorageBasedError } from "./errors";

function getAccessToken() {
    return process.env.WEB3STORAGE_TOKEN;
}

function makeStorageClient(token?: string): Web3Storage {
    const _token = token || getAccessToken();
    if ( _token !== undefined) {
        return new Web3Storage({token: _token});
    }
    throw new Web3StorageBasedError('Unable to load WEB3.Storage API Token');
    
}

export function makeFileObjectFromString(data: string, name: string, options?: FilePropertyBag): File {
    const blob = new Blob([data], {type: 'application/json'});
    return new File([blob], name, options);
}


export class Web3StorageDelegate {
    
    private readonly storageClient: Web3Storage;
    private readonly MAX_RETRIES: number = 3;

    constructor(token?: string) {
        this.storageClient = makeStorageClient(token);
    }

    public async store(data: string, name: string, 
        options?: {fileOptions?: FilePropertyBag, storageOptions?: PutOptions}) {
        try {
            const file = makeFileObjectFromString(data, name, options?.fileOptions);
            // Storage options are used to alter the behavior of @method put in the storage client
            // by default web3.storage creates a directory to store files within it for utilizing human namings
            // For our use case it's useless since directories are immutable too grouping of data won't do any good to us
            const storageOptions = options?.storageOptions || {};
            storageOptions.wrapWithDirectory = storageOptions.wrapWithDirectory ||  false;
            storageOptions.maxRetries = storageOptions.maxRetries || this.MAX_RETRIES;

            // put method is expected to return cid string
            return await this.storageClient.put([file], storageOptions);
        }catch (e) {
            throw new Web3StorageBasedError((e as Error).message);
        }
    }

    public async get(cid: string) {
        return await this.storageClient.get(cid);
    }

    public async getStatus(cid: string): Promise<boolean> {
        const status = await this.storageClient.status(cid);
        return status !== undefined && status.cid !== undefined;
    }
}