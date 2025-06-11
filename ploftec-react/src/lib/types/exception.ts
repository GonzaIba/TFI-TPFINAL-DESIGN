  export type ExceptionBase = {
    code: string;
    title: string;
    message: string;
    statusCode: string;
    httpCode: number;
    nameError: string;
    trace: string;
    image: string;
  
    customMessage: string;
    customTitle: string;
    customImage: string;
    customNameError: string;
    customStatusCode: string;
    customHttpCode: number;
  };
  
  export type ErrorDisplayType = "toast" | "modal" | "tooltip";
  
  export type ErrorUIConfig = {
    type: ErrorDisplayType;
    priority?: number; // Por si querés ordenar o dar importancia futura
  };
  
  export const errorUIMapper: Record<string, ErrorUIConfig> = {
    SurveyVoteException: { type: "toast" },
    CourseClosedException: { type: "modal" },
    PublicationNotFoundException: { type: "toast" },
    AnswerVoteExpiredException: { type: "toast" },
    // Agregá más según tu sistema
  };
  
  export type InvalidTokenException = {

  };