  export interface FiltersUserRequest {
    filters_CodeValue: Record<number, string>;
  }  
  
  export interface UsersForumResponse {
    nombre: string;
    puntaje: number;
    fechaCreado: string;
    email: string;
  }
  
  export interface UsersForumPreviewResponse {
    nombreCompleto: string;
    iniciales: string;
    descripcionCorta?: string;
    descripcionLarga?: string;
    image?: string;
    fechaDesde?: string;
    puntaje: number;
    ultimaVezConectado: string;
  }
  
  export interface UserFilterForumResponse {
    codigoFiltro: number;
    nombreFiltro: string;
    descripcion: string;
    valor: string;
  }
  
  export interface SuccessfulResponse {
    success: boolean;
  }
  
  export interface PublicationResponse {
    codigoPublicacion: number;
    codigoUsuario: string;
    titulo: string;
    contenido: string;
    recompensa: number;
    visitas: number;
    respuestas: number;
    respondida: boolean;
    cerrada: boolean;
    fechaCreacion: string;
    fechaCierre?: string;
    estaGuardado: boolean;
    etiquetas: string[];
  }
  
  export interface FilesResponse {
    nombreArchivo: string;
    tipoArchivo: string;
    archivo: Uint8Array; // o string base64 si viene así
  }
  
  export interface AnswerResponse {
    codigoRespuesta: number;
    usuario: UsersForumPreviewResponse;
    textoRespuesta: string;
    fechaCreacion: string;
    respuestaCorrecta: boolean;
    votos: number;
    votadoPositivo?: boolean;
    archivos: FilesResponse[];
  }
  
  export interface PublicationDetailResponse {
    codigoPublicacion: number;
    usuario: UsersForumPreviewResponse;
    titulo: string;
    contenido: string;
    recompensa: number;
    visitas: number;
    votos: number;
    votadoPositivo?: boolean;
    fechaCreacion: string;
    fechaCierre?: string;
    respuestas: AnswerResponse[];
    archivos: FilesResponse[];
  }
  
  export interface GroupResponse {
    codigoGrupo: number;
    nombreGrupo: string;
    descripcionGrupo: string;
    listaFiltros: FilterResponse[];
  }
  
  export interface FilterResponse {
    codigoFiltro: number;
    nombreFiltro: string;
    descripcionFiltro: string;
  }
  
  export interface Medalla {
    nombreMedalla: string;
    descripcion: string;
    imagenMedalla: string;
    fechaObtenido: string;
  }
  
  export interface DetailsUserForumResponse {
    nombre: string;
    apellido?: string;
    lenguajePreferencia?: string;
    email?: string;
    fechaCreado: string;
    puntaje: number;
    cantidadRespuestas: number;
    cantidadPublicacionesCreadas: number;
    shortDescriptionForum?: string;
    longDescriptionForum?: string;
    imageForum?: string;
    lastTimeConnectedForum: string;
    medallas: Medalla[];
  }