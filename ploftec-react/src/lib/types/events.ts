import { AnswerResponse, NotificationsResponse } from "./forum";

export interface AddAnswerEvent extends AnswerResponse {
  connectionId?: string
}

export interface NewNotificationEvent extends NotificationsResponse{
  connectionId?: string;
}

export interface RemoveNotificationEvent{
  codeNotification: number;
  connectionId?: string;
}