

export interface EncryptedFormDto {
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
      meta: {
        formId: string;
        title: string;
        startDate: string;
        endDate: string;
        isClosed: string;
      }
      // EOA
      iss: string;
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
      // Signature using hackforms identifier
      signature: string
      // Singaute using EOA wallet
      signatureWallet: string
    }
  }