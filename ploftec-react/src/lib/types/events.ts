import { AnswerResponse } from "./forum";

export interface AddAnswerEvent extends AnswerResponse {
  connectionId?: string
}