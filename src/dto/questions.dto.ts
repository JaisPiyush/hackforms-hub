export interface QuestionAnswerDto {
    // Value responsed by the user, will only be available in the response
    // will contain the transformed value not the raw value
    value: string | Array<string | boolean | number>;
    qid: string;
    createdOn: Date;
  }