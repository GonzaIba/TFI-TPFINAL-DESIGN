
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

  export interface MarkNotificationAsReadRequest {
    codeNotification: number;
  }

  export interface DeleteForumUserRequest {
    userEmail: string;
    reason: string;
    password: string;
  }

  export interface DeletePublicationRequest {
    codePublication: number;
    reason: string;
    password: string;
  }

  export interface ReportPublicationRequest {
    codePublication: number;
    reason: string;
    detail: string;
  }

  export interface ReportAnswerRequest {
    answerCode: number;
    reason: string;
    detail: string;
  }

  /* ------------------------------------------- RESPONSE -------------------------------------------*/
  
  export interface UsersForumResponse {
    name: string;
    score: number;
    createdDate: Date;
    email: string;
  }
  
  export interface UsersForumPreviewResponse {
    completeName: string;
    initials: string;
    shortDescription?: string;
    longDescription?: string;
    image?: string;
    email?: string;
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
    typeValue: string;
    options?: string[]; // si es tipo select, vienen las opciones
  }

  export interface NotificationsResponse {
    codeNotification: number;
    //codeUser: string;
    //title: string; Revisar
    message: string;
    date: Date;
    readed: boolean;
  }
  
  export interface Medal {
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
    medals: Medal[];
  }

  export interface AnswerPublicationVoteResponse extends SuccessfulResponse {
    isVoteCreatedExpired?: boolean;
  }

  export interface LabelResponse {
    codeLabel: number;
    name: string;
    description: string;
    countThisWeek: number;
    countTotal: number;
  }

  export type RequestHelpResponse = {
    userCreator: UsersForumPreviewResponse;
    codeRequestHelp: number;
    titleHelp: string;
    message: string;
    status: string;
    languages: string[];
    labels: string[];
    createdAt: Date;
    regard: number;
    expiresAt: Date;
    timeSlot?: {
      slots: HelpTimeSlot[];
    };
  };

  // Live Help - Create request
  export type HelpTimeSlot = {
    start: string;
    end: string;
    codeSlot?: number | null;
  };

  export interface ConfirmHelpRequestPayload {
    timeSlot: Pick<HelpTimeSlot, "start" | "end" > & { codeSlot: number };
  }

  export interface CreateHelpRequest {
    titleHelp: string;
    message: string; // HTML o texto enriquecido
    labels: string[];
    languages: string[]; // ej: ['es-AR','en-US']
    timeSlot: { slots: HelpTimeSlot[] };
  }

export interface UpdateDisponibilityRequest {
  timeSlot: { slots: HelpTimeSlot[] };
  userId?: string;
}

export interface CancelHelpRequestPayload {
  reason?: string | null;
  userId?: string | null;
}

// Live Help - Chat (message DTO)
export interface ChatMessageResponse {
    codeMessage: number;
    codeChat: number;
    message: string;
    createdAt: string | Date; // API devuelve string (ISO sin Z) o Date
    isRead?: boolean;
    fromMe?: boolean;
    readed?: boolean;
    sentByMe?: boolean;
  }

  // Enviar mensaje (gateway: SolicitudAyuda/{id}/Chat/EnviarMensaje)
  export interface SendChatMessageRequest {
    codeChat: number;
    message: string;
    connectionId?: string | null;
  }

  // Marcar como leído (gateway: SolicitudAyuda/{id}/Chat/Leido)
  export interface MarkChatReadRequest {
    codeChat: number;
    upToUtc?: string; // ISO string
    messageIds?: number[];
  }

  export interface ChatUnreadCountResponse {
    count: number;
  }

  // Detalle de solicitud (gateway: SolicitudAyuda/{id}/ObtenerDetalleSolicitudAyuda)
  export interface RequestHelpDetailResponse {
    requestHelp: RequestHelpResponse;
    codeChat?: number | null;
    isOwner: boolean;
  }

  export interface RequestHelpConfirmedResponse {
    userCreator: UsersForumPreviewResponse;
    codeRequestHelp: number;
    titleHelp: string;
    message: string;
    status: string;
    languages: string[];
    labels: string[];
    createdAt: string;
    regard: number;
    initAt: string;
    isOwner: boolean;
  }

  export interface TermsConditionsResponse {
    titulo: string;
    contenido: string;
  }

  export interface LiveHelpSessionUi {
    displayName: string;
    avatarUrl?: string | null;
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
  }

  export interface LiveHelpSessionResponse {
    codeSession: string;
    domain: string;
    roomName: string;
    initAt: string | Date;
    expiresAt: string | Date;
    isOwner: boolean;
    provider?: string;
    appId?: string;
    room?: string;
    jwt?: string;
    serverUrl?: string;
    role?: string;
    shouldCloseAt?: string | Date;
    ui?: LiveHelpSessionUi;
  }

  // Detalle de chat (gateway: SolicitudAyuda/{id}/Chat/Mensajes)
  export interface HelpRequestChatDetailResponse {
    chatCode: number;
    requestCode: number;
    state: string; // "Abierto" etc.
    createdAt: string; // ISO
    active: boolean;
    other: UsersForumPreviewResponse;
    unreadCount: number;
    messages: Array<{
      codeMessage: number;
      text: string;
      at: string; // ISO
      fromMe: boolean;
      isRead: boolean;
    }>;
  }

  // Listado de chats de mi solicitud (ayudado)
  export interface HelpRequestChatsResponse {
    chatCode: number;
    other: UsersForumPreviewResponse;
    lastText?: string;
    lastAt?: string; // ISO
    unreadCount: number;
  }
