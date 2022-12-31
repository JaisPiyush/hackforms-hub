import { QuestionAnswerDto } from "./questions.dto";
import { EncryptedSchemaDto } from "./types";


export interface FormResponseDto {
    responses: QuestionAnswerDto[]
    
}


export type EncryptedFormResponseDto = EncryptedSchemaDto<{
  formId: string;
  responseId: string;
}>;