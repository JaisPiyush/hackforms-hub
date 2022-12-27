export class Web3StorageBasedError extends Error {
    constructor(msg: string) {
        super(`WEB3STORAGE Error: ${msg}`);
    }
}