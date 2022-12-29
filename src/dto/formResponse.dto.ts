import { QuestionAnswerDto } from "./questions.dto";
import { EncryptedSchemaDto } from "./types";


export interface FormResponseDto {
    respondId: string;
    formId: string;
    owner: string;
    responses: QuestionAnswerDto[]
    
}


export type EncryptedFormResponseDto = EncryptedSchemaDto<{
  formId: string;
  responseId: string;
}>;