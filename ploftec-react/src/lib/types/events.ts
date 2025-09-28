import { AnswerResponse, NotificationsResponse } from "./forum";

export interface AddAnswerEvent extends AnswerResponse {
  connectionId?: string
}

export interface EditAnswerEvent {
  codeAnswer: number;
  content: string;
  connectionId?: string;
}

export interface NewNotificationEvent extends NotificationsResponse{
  connectionId?: string;
}

export interface RemoveNotificationEvent{
  codeNotification: number;
  connectionId?: string;
}

export interface EditAnswerEvent{
  codePublication: number;
  codeAnswer: number;
  content: string;
  connectionId?: string;
}
