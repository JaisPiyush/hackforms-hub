export interface EncryptedSchemaDto<T> {
    header: {
      // Algorithm used to encrypt the data
      alg: string;
      // Algorithm used to encrypt the key of symmetrical enc key
      keyEncAlg: string;
      /* public: Indicates data is not encrypted and open for all.
      *  private: Both form and repsonse must be encrypted and response can be logged
      *  using single decryption key shared through the link.
      *  protected: 
      */
      access: "public" | "private" | "protected";
    },
    payload: {
      // encrypted data using the symmetrical enc key
      data: string;
      // public meta data about the data
      meta: T
      // ECDSA used for encryption of key
      iss: string;
      // EOA
      owner: string;
      // Record containing Hackform profile pubKey along with encryoted symm key
      // When using 
      subRecord: Record<string, string>;
      // All the participants invited in for the survey
      // EOA wallet address will be listed, not the Hackform identifier key
      // Each hackform identifier will be added mapped to single wallet address
      inviteList: Array<String>;
    },
    tail: {
      hash: string,
      // Signature using EOA
      signature?: string

    }
  }