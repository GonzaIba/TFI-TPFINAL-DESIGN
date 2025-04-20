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

  export type InvalidTokenException = {

  };