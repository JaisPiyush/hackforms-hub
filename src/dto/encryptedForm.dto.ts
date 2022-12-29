import { EncryptedSchemaDto } from "./types";



export type EncryptedFormDto = EncryptedSchemaDto<{
  formId: string,
  title: string,
  startDate: number,
  endDate: number,
  isClosed: boolean
}>