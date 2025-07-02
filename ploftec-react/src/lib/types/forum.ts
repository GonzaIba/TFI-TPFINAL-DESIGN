
  /* ------------------------------------------- REQUEST -------------------------------------------*/

  export interface FiltersUserRequest {
    filters_CodeValue: Record<number, string>;
  }

  export interface CreatePublicationRequest {
    title: string;
    content: string;
    labels: string[]
  }

  export interface PublicationVoteRequest {
    codePublication: number;
    isPositive: boolean;
    connectionId: string | null;
  }

  export interface AnswerVoteRequest {
    codePublication: number;
    answerCode: number;
    isPositive: boolean;
    connectionId: string | null;
  }

  export interface AddAnswerRequest {
    codePublication: number;
    textResponse: string;
    //files?: File[]; // Array de archivos a subir
    connectionId: string | null;
  }

  export interface DeleteAnswerRequest {
    codePublication: number;
    answerCode: number;
    connectionId: string | null;
  }

  export interface EditAnswerRequest {
    codePublication: number;
    answerCode: number;
    contenido: string;
    connectionId: string | null;
  }

  export interface EditPublicationRequest {
    codePublication: number;
    contenido: string;
    connectionId: string | null;
  }

  /* ------------------------------------------- RESPONSE -------------------------------------------*/
  
  export interface UsersForumResponse {
    name: string;
    score: number;
    createdDate: string;
    email: string;
  }
  
  export interface UsersForumPreviewResponse {
    completeName: string;
    initials: string;
    shortDescription?: string;
    longDescription?: string;
    image?: string;
    dateFrom?: string;
    score: number;
    lastTimeOnline: string;
  }
  
  export interface UserFilterForumResponse {
    codeFilter: number;
    nameFilter: string;
    description: string;
    value: string;
  }
  
  export interface SuccessfulResponse {
    success: boolean;
  }
  
  export interface PublicationResponse {
    codePublication: number;
    codeUser: string;
    userCreator: UsersForumPreviewResponse;
    title: string;
    content: string;
    reward: number;
    visits: number;
    answers: number;
    answered: boolean;
    closed: boolean;
    createdDate: string;
    closedDate?: string;
    isSaved: boolean;
    tags: string[];
  }
  
  export interface FilesResponse {
    fileName: string;
    typeFile: string;
    file: Uint8Array; // o string base64 si viene así
  }
  
  export interface AnswerResponse {
    codeAnswer: number;
    user: UsersForumPreviewResponse;
    textResponse: string;
    createdDate: string;
    correctAnswer: boolean;
    votes: number;
    votedPositive?: boolean;
    isAuthor: boolean;
    files: FilesResponse[];
  }
  
  export interface PublicationDetailResponse {
    codePublication: number;
    user: UsersForumPreviewResponse;
    title: string;
    content: string;
    reward: number;
    visits: number;
    votes: number;
    votedPositive?: boolean;
    createdDate: string;
    closedDate?: string;
    answers: AnswerResponse[];
    files: FilesResponse[];
  }
  
  export interface GroupResponse {
    codeGroup: number;
    namegroup: string;
    descriptionGroup: string;
    filtersList: FilterResponse[];
  }
  
  export interface FilterResponse {
    codeFilter: number;
    nameFilter: string;
    descriptionFilter: string;
  }
  
  export interface Medalla {
    nameMedal: string;
    description: string;
    imageMedal: string;
    dateObtained: string;
  }
  
  export interface DetailsUserForumResponse {
    name: string;
    lastName?: string;
    languagePreference?: string;
    email?: string;
    createdDate: string;
    score: number;
    quantityResponses: number;
    numberPostsCreated: number;
    shortDescriptionForum?: string;
    longDescriptionForum?: string;
    imageForum?: string;
    lastTimeConnectedForum: string;
    medals: Medalla[];
  }

  export interface AnswerPublicationVoteResponse extends SuccessfulResponse {
    isVoteCreatedExpired?: boolean;
  }
