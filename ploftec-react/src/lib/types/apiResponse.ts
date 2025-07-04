import { ExceptionBase } from "./exception";

export type Meta = {
  method: string;
  service: string;
  responseCode: string;
};

export type Errors = {
  errorsList: ExceptionBase[];
};

export type GenericApiResponse<T> = {
  meta: Meta;
  data?: T;
  errors: Errors;
};

export interface PaginatedList<T> {
  pageIndex:  number;
  pageCount:  number;
  totalCount: number;
  totalPages: number;
  list:       T[];
}