"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { AvatarUser, Button, ExpiryTimer, Loading, DateTime, ModalComponent } from "@/components";
import { Trophy, AlertCircle, CheckCheck, Clock, XCircle } from "lucide-react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { parseApiUtc, formatLocalSlot } from "@/lib/utils/datetime";
import type {
  RequestHelpResponse,
  ChatMessageResponse,
  RequestHelpDetailResponse,
  HelpRequestChatDetailResponse,
  HelpTimeSlot,
  HelpRequestChatsResponse
} from "@/lib/types/forum";
import useSnackBarStore from "@/store/slices/snackBarStore/snackbarStore";
import useLiveHelpStore from "@/store/slices/liveHelpStore/liveHelpStore";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/store/slices/authStore/authStore";
import { liveHelpChatService } from "@/lib/services/forum/liveHelpChatService";
import { requestHelpService } from "@/lib/services/forum/requestHelpService";
import { useLiveHelpChatSignalR } from "@/hooks";

type EditableSlot = { codeSlot: number | null; start: Date | null; end: Date | null };

const SLOT_MINUTES = [15, 30];

const isDurationValid = (start: Date, end: Date) => {
  const diff = Math.round((end.getTime() - start.getTime()) / 60000);
  return SLOT_MINUTES.includes(diff);
};

const isEditableSlotValid = (slot: EditableSlot) =>
  !!(slot.start && slot.end && isDurationValid(slot.start, slot.end));

const toDateOrNull = (value: any): Date | null => {
  if (!value) return null;
  try {
    const parsed = parseApiUtc(value as any);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

type ChatMsg = {
  id: string | number;
  from: "me" | "other";
  text: string;
  at: number;
  utc?: string | null;
  pending?: boolean;
  delivered?: boolean;
  read?: boolean;
};

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const text = value.trim().toLowerCase();
    if (text === "true") return true;
    if (text === "false") return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return undefined;
};

const extractSenderId = (msg: any): string | null => {
  const candidate =
    msg?.userEmail ??
    msg?.UserEmail ??
    msg?.userId ??
    msg?.UserId ??
    msg?.email ??
    msg?.Email ??
    msg?.senderId ??
    msg?.SenderId ??
    null;
  if (candidate === null || candidate === undefined) return null;
  try {
    return String(candidate).trim().toLowerCase();
  } catch {
    return null;
  }
};

const resolveCreatedAt = (msg: any): { at: number; utc: string | null } => {
  const raw =
    msg?.createdAt ??
    msg?.CreatedAt ??
    msg?.at ??
    msg?.At ??
    msg?.createdAtUtc ??
    msg?.createdAtUTC ??
    msg?.createdAtISO ??
    msg?.createdAtIso ??
    null;

  if (raw) {
    try {
      const parsed = parseApiUtc(raw as any);
      const time = parsed.getTime();
      if (Number.isFinite(time) && !Number.isNaN(time)) {
        const utc = typeof raw === "string" && raw ? raw : parsed.toISOString();
        return { at: time, utc };
      }
    } catch {}
  }
  const now = Date.now();
  return { at: now, utc: new Date(now).toISOString() };
};

const mapChatMessage = (raw: ChatMessageResponse | any, userEmail: string | null): ChatMsg => {
  const id =
    raw?.codeMessage ??
    raw?.CodeMessage ??
    raw?.messageId ??
    raw?.MessageId ??
    raw?.id ??
    raw?.Id ??
    Math.random().toString(36).slice(2);

  const sentFlag = normalizeBoolean(
    raw?.sentByMe ?? raw?.SentByMe ?? raw?.isMine ?? raw?.IsMine ?? raw?.fromMe ?? raw?.FromMe
  );
  const senderId = extractSenderId(raw);
  const fromMe = typeof sentFlag === "boolean" ? sentFlag : !!(userEmail && senderId && senderId === userEmail);

  const text =
    typeof raw?.message === "string"
      ? raw.message
      : typeof raw?.Message === "string"
      ? raw.Message
      : typeof raw?.text === "string"
      ? raw.text
      : typeof raw?.Text === "string"
      ? raw.Text
      : typeof raw?.content === "string"
      ? raw.content
      : typeof raw?.Content === "string"
      ? raw.Content
      : "";

  const { at, utc } = resolveCreatedAt(raw);
  const readValue = normalizeBoolean(
    raw?.isRead ??
    raw?.IsRead ??
    raw?.read ??
    raw?.Read ??
    raw?.readed ??
    raw?.Readed ??
    raw?.readByOther ??
    raw?.ReadByOther
  );

  return {
    id,
    from: fromMe ? "me" : "other",
    text,
    at,
    utc,
    pending: false,
    delivered: true,
    read: readValue === true,
  };
};

const formatTimeLabel = (value: number): string => {
  if (!Number.isFinite(value)) return "--:--";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--:--" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function LiveHelpDetailByIdPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idParam = params?.id ? Number(params.id) : undefined;

  const [loading, setLoading] = useState(false);
  const [enterLoading, setEnterLoading] = useState(true);

  const [request, setRequest] = useState<RequestHelpResponse | null>(null);
  const selectedFromStore = useLiveHelpStore((s) => s.selected);
  const queryClient = useQueryClient();
  const auth = useAuthStore((s) => s.user);
  const userEmail = useMemo(() => auth?.email?.toLowerCase() ?? null, [auth?.email]);

  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [editableSlots, setEditableSlots] = useState<EditableSlot[]>([{codeSlot: null, start: null, end: null }]);
  const [slotsSaving, setSlotsSaving] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const ownerHasValidSlot = useMemo(() => editableSlots.some(isEditableSlotValid), [editableSlots]);

  const [selectedSlot, setSelectedSlot] = useState<HelpTimeSlot | null>(null);
  const [confirmingSlot, setConfirmingSlot] = useState(false);
  const [showConfirmSuccess, setShowConfirmSuccess] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(false);
  const [codeChat, setCodeChat] = useState<number | null>(null);
  const [inbox, setInbox] = useState<any[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);

  const showToast = useSnackBarStore((s) => s.showToast);

  const toChatMessage = useCallback((raw: any) => mapChatMessage(raw, userEmail), [userEmail]);

  const handleMessageAdded = useCallback(
    (raw: any) => {
      if (!raw) return;
      const msgChatCode: number | null = (raw?.codeChat ?? raw?.CodeChat ?? raw?.chatCode ?? raw?.ChatCode ?? raw?.chatId ?? raw?.ChatId ?? null) as number | null;
      const mapped = toChatMessage(raw);
      if (typeof msgChatCode === "number" && msgChatCode === codeChat) {
        setChat((prev) => {
          if (mapped.id && prev.some((m) => m.id === mapped.id)) return prev;
          return [...prev, mapped];
        });
      }

      if (typeof msgChatCode === "number") {
        setInbox((prev) => {
          const nowIso = new Date().toISOString();
          const text =
            typeof raw?.message === "string"
              ? raw.message
              : typeof raw?.Message === "string"
              ? raw.Message
              : typeof raw?.text === "string"
              ? raw.text
              : typeof (raw?.preview ?? raw?.Preview) === "string"
              ? raw.preview ?? raw.Preview
              : mapped.text;
          const isFromMe = mapped.from === "me";
          const updated = prev.map((it) => {
            if (it.chatCode !== msgChatCode) return it;
            const isUnreadMessage = !isFromMe && !mapped.read;
            const nextUnread = (() => {
              if (msgChatCode === codeChat) return 0;
              if (isFromMe) return it.unread ?? 0;
              return (it.unread ?? 0) + (isUnreadMessage ? 1 : 0);
            })();
            return {
              ...it,
              lastText: text,
              lastAt: nowIso,
              unread: nextUnread,
            };
          });
          const idx = updated.findIndex((x: any) => x.chatCode === msgChatCode);
          if (idx > 0) {
            const item = updated[idx];
            const rest = updated.filter((_, i) => i !== idx);
            return [item, ...rest];
          }
          return updated;
        });
      }
    },
    [toChatMessage, codeChat]
  );

  const handleChatRead = useCallback(
    (payload: any) => {
      const reader = extractSenderId(payload);
      if (!reader || !userEmail || reader === userEmail) return;
      setChat((prev) => prev.map((m) => (m.from === "me" ? { ...m, read: true } : m)));
    },
    [userEmail]
  );

  const connectionId = useLiveHelpChatSignalR(
    idParam
      ? {
          requestId: idParam,
          onMessageAdded: handleMessageAdded,
          onChatRead: handleChatRead,
        }
      : null
  );

  const handleOwnerSlotStartChange = (index: number, value: Date | null) => {
    setEditableSlots((prev) => {
      const safeStart = value ? new Date(Math.max(value.getTime(), Date.now())) : null;
      const next = prev.map((slot, idx) => (idx === index ? { ...slot, start: safeStart } : slot));
      if (safeStart && next[index].end) {
        const end = next[index].end as Date;
        if (!isDurationValid(safeStart, end)) {
          next[index] = { ...next[index], end: null };
        }
      }
      if (slotsError) {
        const valid = next.some(isEditableSlotValid);
        if (valid) setSlotsError(null);
      }
      return next;
    });
  };

  const handleOwnerSlotEndChange = (index: number, value: Date | null) => {
    setEditableSlots((prev) => {
      const start = prev[index].start;
      let end = value;
      if (end && start) {
        const startTime = start.getTime();
        const fifteen = new Date(startTime + 15 * 60000);
        const thirty = new Date(startTime + 30 * 60000);
        const diff15 = Math.abs(end.getTime() - fifteen.getTime());
        const diff30 = Math.abs(end.getTime() - thirty.getTime());
        end = diff15 <= diff30 ? fifteen : thirty;
      } else if (!start) {
        end = null;
      }
      const next = prev.map((slot, idx) => (idx === index ? { ...slot, end } : slot));
      if (slotsError) {
        const valid = next.some(isEditableSlotValid);
        if (valid) setSlotsError(null);
      }
      return next;
    });
  };

  const handleOwnerAddSlot = () => {
    setEditableSlots((prev) => [...prev, { codeSlot: null, start: null, end: null }]);
  };

  const handleOwnerRemoveSlot = (index: number) => {
    setEditableSlots((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      const normalized = next.length > 0 ? next : [{codeSlot: null, start: null, end: null }];
      if (slotsError) {
        const valid = normalized.some(isEditableSlotValid);
        if (valid) setSlotsError(null);
      }
      return normalized;
    });
  };

  const handleOwnerSaveSlots = async () => {
    if (!idParam) return;
    setSlotsError(null);
    const validSlots = editableSlots.filter(isEditableSlotValid);
    if (validSlots.length === 0) {
      setSlotsError("Agrega al menos una franja válida (15 o 30 minutos).");
      return;
    }

    setSlotsSaving(true);
    try {
      const payloadSlots = validSlots.map((slot) => ({
        codeSlot: slot.codeSlot as number,
        start: slot.start!.toISOString(),
        end: slot.end!.toISOString(),
      }));

      await requestHelpService.updateHelpRequestAvailability(idParam, {
        timeSlot: { slots: payloadSlots },
      });

      setRequest((prev) =>
        prev
          ? {
              ...prev,
              timeSlot: { slots: payloadSlots },
            }
          : prev
      );

      setEditableSlots(
        payloadSlots.map((slot) => ({
          codeSlot: slot.codeSlot as number,
          start: new Date(slot.start),
          end: new Date(slot.end),
        }))
      );
      setSlotsError(null);
      showToast({ message: "Disponibilidad actualizada", variant: "success" });
    } catch (error) {
      console.error("update availability failed", error);
      showToast({ message: "No pude actualizar los horarios", variant: "error" });
    } finally {
      setSlotsSaving(false);
    }
  };

  const handleConfirmSlot = useCallback(async () => {
    if (!selectedSlot) {
      showToast({ message: "Seleccioná un horario antes de confirmar", variant: "warning" });
      return;
    }
    if (!idParam) return;
    setConfirmingSlot(true);
    try {
      const res = await requestHelpService.confirmHelpRequest({
        codeRequestHelp: idParam,
        slot: {
          start: selectedSlot.start,
          end: selectedSlot.end,
        },
      });
      if (res?.data?.success) {
        await queryClient.invalidateQueries({ queryKey: ["livehelp", "confirmed-requests"] });
        setShowConfirmSuccess(true);
      } else {
        showToast({ message: "No pude confirmar la solicitud", variant: "error" });
      }
    } catch (error) {
      console.error("confirm slot failed", error);
      showToast({ message: "No pude confirmar la solicitud", variant: "error" });
    } finally {
      setConfirmingSlot(false);
    }
  }, [idParam, selectedSlot, showToast, queryClient]);

  useEffect(() => {
    if (!enterLoading && isOwner === null) {
      setIsOwner(false);
    }
  }, [enterLoading, isOwner]);

  useEffect(() => {
    if (!idParam) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await requestHelpService.getRequestHelpDetail(idParam);
        const data = res?.data as RequestHelpDetailResponse | undefined;
        if (!data || cancelled) return;
        setRequest(data.requestHelp);
        const cc = (data as any)?.codeChat ?? (data as any)?.CodeChat ?? null;
        setCodeChat(typeof cc === "number" ? cc : null);
        setIsOwner(data?.isOwner === true);
      } catch {
        setIsOwner(false);
      } finally {
        setEnterLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idParam]);

  useEffect(() => {
    if (request) return;
    if (!idParam) return;
    try {
      if (
        selectedFromStore &&
        ((selectedFromStore as any).codeRequestHelp === idParam || (selectedFromStore as any).codeRequestHelp === idParam)
      ) {
        setRequest(selectedFromStore);
        return;
      }
      const matches = queryClient.getQueriesData<any>({ queryKey: ["livehelp", "requests-cursor"] });
      for (const [, data] of matches) {
        if (!data) continue;
        const items: RequestHelpResponse[] = Array.isArray(data) ? data : data?.pages?.flatMap?.((p: any) => p.items ?? []) ?? [];
        const found = items.find((x: RequestHelpResponse) => x?.codeRequestHelp === idParam || x?.codeRequestHelp === idParam);
        if (found) {
          setRequest(found);
          return;
        }
      }
      if (!request && typeof window !== "undefined") {
        const raw = window.sessionStorage.getItem("livehelp:selected");
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as RequestHelpResponse;
            if (parsed.codeRequestHelp === idParam) {
              setRequest(parsed);
            }
          } catch {}
        }
      }
    } catch {}
  }, [idParam, queryClient, request, selectedFromStore]);

  useEffect(() => {
    if (isOwner !== true) return;
    const rawSlots = request?.timeSlot?.slots ?? [];
    if (!rawSlots.length) {
      setEditableSlots([{ codeSlot: null, start: null, end: null }]);
      return;
    }
    const mapped = rawSlots.map((slot) => ({
      codeSlot: slot.codeSlot as number,
      start: toDateOrNull(slot.start),
      end: toDateOrNull(slot.end),
    }));
    setEditableSlots(mapped.length ? mapped : [{ codeSlot: null, start: null, end: null }]);
  }, [isOwner, request?.timeSlot]);

  useEffect(() => {
    if (!idParam) return;
    if (isOwner !== true) {
      if (isOwner === false) {
        setInbox([]);
        setInboxLoading(false);
      }
      return;
    }
    let cancelled = false;
    const fetchInbox = async () => {
      setInboxLoading(true);
      try {
        const res = await liveHelpChatService.listMyRequestChats(idParam);
        const list = (res?.data as HelpRequestChatsResponse[]) ?? [];
        if (cancelled) return;
        const mapped = list.map((raw) => {
          const chatCode = raw?.chatCode;
          const other = raw?.other ?? {};
          const lastText = raw.lastText ?? "";
          const lastAtRaw = raw?.lastAt;
          const lastAt = lastAtRaw ? parseApiUtc(lastAtRaw).toISOString() : null;
          const unread = raw?.unreadCount ?? 0;
          return { chatCode, other, lastText, lastAt, unread };
        });
        setInbox(mapped.filter((x) => typeof x.chatCode === "number"));
      } catch {
      } finally {
        setInboxLoading(false);
      }
    };
    fetchInbox();
    return () => {
      cancelled = true;
    };
  }, [idParam, isOwner]);

  const fetchInitialChat = useCallback(async () => {
    if (!idParam) return;
    if (!codeChat) {
      setChat([]);
      return;
    }
    setChatLoading(true);
    setChatError(false);
    try {
      const res = await liveHelpChatService.getChatDetail(idParam, codeChat);
      const detail: HelpRequestChatDetailResponse | undefined = res?.data as any;
      let chatCodeValue = codeChat;
      if (detail?.chatCode && typeof detail.chatCode === "number") {
        chatCodeValue = detail.chatCode;
        setCodeChat(detail.chatCode);
      }
      const list = detail?.messages ?? [];
      const mapped = list.map((m: any) => toChatMessage(m));
      setChat(mapped);
      const unreadFromDetail =
        typeof detail?.unreadCount === "number"
          ? detail.unreadCount ?? 0
          : mapped.filter((m) => m.from === "other" && !m.read).length;
      if (chatCodeValue && isOwner === true) {
        setInbox((prev) =>
          prev.map((it) =>
            it.chatCode === chatCodeValue ? { ...it, unread: unreadFromDetail } : it
          )
        );
      }
    } catch {
      setChatError(true);
      setChat([]);
    } finally {
      setChatLoading(false);
    }
  }, [idParam, codeChat, toChatMessage, isOwner]);

  useEffect(() => {
    fetchInitialChat();
  }, [fetchInitialChat]);

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chat]);

  useEffect(() => {
    if (!idParam || !codeChat || chat.length === 0) return;
    const unreadMessages = chat.filter((m) => m.from === "other" && !m.read);
    if (unreadMessages.length === 0) return;
    const lastUnread = unreadMessages[unreadMessages.length - 1];
    const ids = unreadMessages
      .map((m) =>
        typeof m.id === "number"
          ? m.id
          : typeof m.id === "string" && /^\d+$/.test(m.id)
          ? Number(m.id)
          : null
      )
      .filter((n): n is number => n !== null);
    const payload: { codeChat: number; upToUtc?: string; messageIds?: number[] } = { codeChat };
    if (ids.length > 0) payload.messageIds = ids;
    else if (lastUnread?.utc) payload.upToUtc = lastUnread.utc;

    (async () => {
      try {
        await liveHelpChatService.markChatAsRead(idParam, payload);
      } catch {}
      setChat((prev) => prev.map((m) => (m.from === "other" ? { ...m, read: true } : m)));
      if (isOwner === true) {
        setInbox((prev) => prev.map((it) => (it.chatCode === codeChat ? { ...it, unread: 0 } : it)));
      }
    })();
  }, [chat, idParam, codeChat, isOwner]);

  const onSendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || !idParam || (isOwner === true && !codeChat)) return;
    const tempId = Math.random().toString(36).slice(2);
    const now = Date.now();
    const tempMessage: ChatMsg = { id: tempId, from: "me", text, at: now, pending: true, delivered: false, read: false };
    setChat((prev) => [...prev, tempMessage]);
    setChatInput("");
    try {
      let chatCodeLocal = codeChat;
      if (!chatCodeLocal) {
        const created = await liveHelpChatService.createChat(idParam);
        const data = created?.data as any;
        const createdCode = (typeof data === "number" ? data : data?.codeChat ?? data?.CodeChat) ?? null;
        if (!createdCode) throw new Error("No pude crear el chat");
        chatCodeLocal = createdCode;
        setCodeChat(createdCode);
      }
      const res = await liveHelpChatService.sendChatMessage(idParam, { codeChat: chatCodeLocal ?? 0, message: text, connectionId });
      const raw = res?.data;
      if (raw) {
        const mapped = mapChatMessage(raw, userEmail);
        setChat((prev) => {
          const idx = prev.findIndex((m) => m.id === tempId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...mapped, pending: false, delivered: true };
            return next;
          }
          return [...prev, { ...mapped, pending: false, delivered: true }];
        });
      } else {
        setChat((prev) => {
          const idx = prev.findIndex((m) => m.id === tempId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], pending: false, delivered: true };
            return next;
          }
          return [...prev, { id: tempId, from: "me", text, at: now, pending: false, delivered: true, read: false }];
        });
      }
    } catch {
      setChat((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, delivered: false } : m)));
      showToast({ message: "No se pudo enviar el mensaje", variant: "error" });
    }
  }, [chatInput, idParam, connectionId, showToast, userEmail, codeChat]);

  const onSelectInboxItem = (chatCode: number) => {
    if (!chatCode || chatCode === codeChat) return;
    setCodeChat(chatCode);
    setChat([]);
    setInbox((prev) => prev.map((it) => (it.chatCode === chatCode ? { ...it, unread: 0 } : it)));
  };

  const created = useMemo(() => (request ? parseApiUtc(request.createdAt as any) : null), [request]);
  const expires = useMemo(() => (request ? parseApiUtc(request.expiresAt as any) : null), [request]);

  const onBack = () => {
    setLoading(true);
    setTimeout(() => router.push("/forum/liveHelp"), 600);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmSuccess(false);
    onBack();
  };

  return (
    <>
      <main className={styles.container}>
      <Loading show={loading} />
      <div className={styles.headerBar}>
        <Button onClick={onBack} text="Volver" icon={<ArrowBack />} />
      </div>

      <div className={styles.columns}>
        <section className={styles.leftCol}>
          {enterLoading ? (
            <section className={styles.headerCard}>
              <div className={styles.skeletonHeaderRow}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonHeaderContent}>
                  <div className={styles.skeletonLineWide} />
                  <div className={styles.skeletonLine} />
                </div>
              </div>
              <div className={styles.skeletonParagraph} />
              <div className={styles.skeletonChipRow}>
                <div className={styles.skeletonChip} />
                <div className={styles.skeletonChip} />
                <div className={styles.skeletonChip} />
              </div>
            </section>
          ) : request && (
            <section className={styles.headerCard}>
              <div className={styles.headerRow}>
                {isOwner !== true && request.userCreator && (
                  <div className={styles.headerAvatarWrap}>
                    <AvatarUser
                      imageUser={request.userCreator.image}
                      tagUser={request.userCreator.initials ?? "?"}
                      descripcionCorta={request.userCreator.shortDescription ?? ""}
                      descripcionLarga={request.userCreator.longDescription ?? ""}
                      nombreCompleto={request.userCreator.completeName ?? ""}
                      direction="right"
                    />
                  </div>
                )}
                <div className={styles.headerMain}>
                  <h1 className={styles.title} title={request.titleHelp}>{request.titleHelp}</h1>
                  <div className={styles.metaRow}>
                    <span className={styles.status}>Activa</span>
                    <span className={styles.reward}><Trophy size={14} className={styles.trophy} /> {request.regard.toFixed(2)}</span>
                    {created && expires && (
                      <span className={styles.timerWrap}>
                        <ExpiryTimer expiresAt={expires} startedAt={created} size={28} />
                        <span className={styles.timerText}>expira</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.descBlock}>
                <p className={styles.descText}>{request.message}</p>
                <div className={styles.chipsRow}>
                  <div className={styles.chipsGroup}>
                    {(request.languages ?? []).map((l) => (
                      <span key={l} className={styles.chip}>{l}</span>
                    ))}
                  </div>
                  <div className={styles.chipsGroup}>
                    {(request.labels ?? []).map((t) => (
                      <span key={t} className={styles.chipAlt}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {enterLoading ? (
            <section className={styles.inboxSkeleton}>
              <div className={styles.skeletonLineWide} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
            </section>
          ) : isOwner === true && (
            <section className={styles.inboxPanel} aria-labelledby="inbox-heading">
              <div className={styles.inboxHeader}>
                <h2 id="inbox-heading" className={styles.inboxTitle}>Chats de mi solicitud</h2>
              </div>
              <div className={styles.inboxList} aria-live="polite">
                {inboxLoading ? (
                  <div className={styles.chatEmpty}>Cargando chats.</div>
                ) : inbox.length === 0 ? (
                  <div className={styles.chatEmpty}>Aun no hay chats</div>
                ) : (
                  inbox.map((it) => {
                    const initials: string = it?.other?.initials ?? "?";
                    const name: string = it?.other?.completeName ?? it?.other?.name ?? "Usuario";
                    const active = codeChat === it.chatCode;
                    const timeLabel = it.lastAt ? formatTimeLabel(new Date(it.lastAt).getTime()) : "";
                    const img: string | undefined = it?.other?.image ?? it?.other?.Image ?? undefined;
                    const lastOnlineRaw: string | undefined = it?.other?.lastTimeOnline ?? it?.other?.LastTimeOnline ?? undefined;
                    let isOnline = false;
                    try {
                      if (lastOnlineRaw) {
                        const last = parseApiUtc(lastOnlineRaw as any).getTime();
                        isOnline = Date.now() - last < 120000;
                      }
                    } catch {}
                    return (
                      <button
                        key={it.chatCode}
                        className={[styles.inboxItem, active ? styles.inboxItemActive : ""].join(" ")}
                        onClick={() => onSelectInboxItem(it.chatCode)}
                        aria-pressed={active}
                      >
                        <div className={styles.inboxAvatarWrap}>
                          <AvatarUser
                            tagUser={initials}
                            imageUser={img}
                            descripcionCorta={it?.other?.shortDescription ?? ""}
                            descripcionLarga={it?.other?.longDescription ?? ""}
                            nombreCompleto={name}
                            direction="right"
                            showDetails={false}
                            size={36}
                          />
                          {isOnline && <span className={styles.onlineDot} aria-label="En linea" />}
                        </div>
                        <div className={styles.inboxMain}>
                          <div className={styles.inboxTop}>
                            <div className={styles.inboxName}>{name}</div>
                            <div className={styles.inboxTime}>{timeLabel}</div>
                          </div>
                          <div className={styles.inboxBottom}>
                            <div className={[styles.inboxPreview, it.unread > 0 ? styles.inboxPreviewUnread : ""].join(" ")}>{it.lastText}</div>
                          </div>
                        </div>
                        {it.unread > 0 && <div className={styles.badge}>{it.unread}</div>}
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          )}

          <section className={styles.chatPanel} aria-labelledby="chat-heading">
            <h2 id="chat-heading" className={styles.sectionTitle}>Chat</h2>
            <div ref={chatBodyRef} className={styles.chatHistory} aria-live="polite">
              {enterLoading ? (
                <div className={styles.chatSkeleton}>
                  <div className={styles.skeletonLineWide} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineWide} />
                </div>
              ) : chatLoading ? (
                <div className={styles.centerState}>
                  <div className={styles.superLoading}>Cargando chat.</div>
                </div>
              ) : chatError ? (
                <div className={styles.centerState}>
                  <div>
                    <AlertCircle size={46} className={styles.errorIcon} />
                  </div>
                  <div>Ocurrio un error al cargar el chat.</div>
                  <Button onClick={fetchInitialChat} text="Reintentar" width="140px" />
                </div>
              ) : (isOwner === true && inbox.length > 0 && !codeChat) ? (
                <div className={styles.chatEmpty}>Elegi un chat</div>
              ) : chat.length === 0 ? (
                <div className={styles.chatEmpty}>
                  {isOwner === true ? "Aun no hay chats" : "Aun no hay mensajes. Escribe el primero!"}
                </div>
              ) : (
                chat.map((m) => {
                  const isMe = m.from === "me";
                  return (
                    <div key={m.id} className={`${styles.chatMsg} ${isMe ? styles.chatMsgMe : styles.chatMsgOther}`}>
                      <div className={styles.msgWrap}>
                        <div
                          className={[
                            styles.msgBubble,
                            isMe ? styles.msgBubbleMe : styles.msgBubbleOther,
                            m.pending ? styles.msgBubblePending : "",
                            !isMe && !m.read ? styles.msgBubbleUnread : "",
                          ].join(" ")}
                        >
                          {m.text || "(sin contenido)"}
                        </div>
                        <div className={styles.msgMeta}>
                          <span>{formatTimeLabel(m.at)}</span>
                          {!isMe && !m.read && <span className={styles.unreadDot} aria-hidden="true" />}
                          {isMe && (
                            <span
                              className={[
                                styles.tick,
                                m.pending
                                  ? styles.tickPending
                                  : !m.delivered
                                  ? styles.tickError
                                  : m.read
                                  ? styles.tickRead
                                  : styles.tickDelivered,
                              ].join(" ")}
                              title={
                                m.pending
                                  ? "Enviando"
                                  : !m.delivered
                                  ? "No se pudo enviar"
                                  : m.read
                                  ? "Le?do"
                                  : "Entregado"
                              }
                            >
                              {m.pending ? (
                                <Clock size={12} strokeWidth={2.2} />
                              ) : !m.delivered ? (
                                <XCircle size={12} strokeWidth={2.2} />
                              ) : (
                                <CheckCheck size={13} strokeWidth={2.2} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className={styles.chatComposer}>
              {(() => {
                const mustSelectChatFirst = isOwner === true && inbox.length > 0 && !codeChat;
                const ownerWithoutChats = isOwner === true && inbox.length === 0;
                const composerDisabled =
                  enterLoading || ownerWithoutChats || mustSelectChatFirst || chatLoading || (codeChat !== null && chatError);
                const buttonText = ownerWithoutChats
                  ? "Sin chats"
                  : mustSelectChatFirst
                  ? "Elegi un chat"
                  : chatError
                  ? "Reintentar carga"
                  : "Enviar";
                return (
                  <>
                    <input
                      className={styles.composerInput}
                      placeholder="Escribe un mensaje..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !mustSelectChatFirst && !composerDisabled) onSendChat();
                      }}
                      aria-label="Escribir mensaje"
                      disabled={composerDisabled}
                    />
                    <Button
                      onClick={onSendChat}
                      text={buttonText}
                      width="110px"
                      height="42px"
                      disabled={composerDisabled}
                    />
                  </>
                );
              })()}
            </div>
          </section>
        </section>

        <aside className={styles.rightCol}>
          <div className={styles.sidebarSticky}>
            <div className={styles.availabilityCard}>
              <h2 className={styles.avTitle}>{isOwner === true ? "Mis horarios disponibles" : "Disponibilidad"}</h2>
              {isOwner === true ? (
                <>
                  <p className={styles.ownerSlotHelper}>Configura franjas de 15 o 30 minutos.</p>
                  <div className={styles.ownerSlots}>
                    {editableSlots.map((slot, index) => (
                      <div className={styles.ownerSlotRow} key={`owner-slot-${index}`}>
                        <DateTime
                          label="Inicio"
                          dateValue={slot.start}
                          onChange={(value) => handleOwnerSlotStartChange(index, value)}
                          minDateTime={new Date()}
                          minutesStep={15}
                        />
                        <DateTime
                          label="Fin"
                          dateValue={slot.end}
                          onChange={(value) => handleOwnerSlotEndChange(index, value)}
                          minDateTime={slot.start ? new Date(slot.start.getTime() + 15 * 60000) : undefined}
                          maxDateTime={slot.start ? new Date(slot.start.getTime() + 30 * 60000) : undefined}
                          disabled={!slot.start}
                          minutesStep={15}
                        />
                        <Button
                          onClick={() => handleOwnerRemoveSlot(index)}
                          transparent
                          text="Quitar"
                          width="88px"
                        />
                      </div>
                    ))}
                  </div>
                  {slotsError && <div className={styles.error}>{slotsError}</div>}
                  <div className={styles.ownerSlotButtons}>
                    <Button onClick={handleOwnerAddSlot} transparent text="Agregar franja" width="auto" />
                    <Button
                      onClick={handleOwnerSaveSlots}
                      text="Guardar disponibilidad"
                      loading={slotsSaving}
                      disabled={slotsSaving || !ownerHasValidSlot}
                      width="100%"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.slotsList} aria-live="polite">
                    {request?.timeSlot?.slots?.length ? (
                      request.timeSlot.slots.map((s) => {
                        const label = formatLocalSlot(s.start, s.end);
                        const isSelected = selectedSlot?.start === s.start && selectedSlot?.end === s.end;
                        return (
                          <button
                            key={`${s.start}--${s.end}`}
                            className={`${styles.slotItem} ${isSelected ? styles.slotSelected : ""}`}
                            onClick={() => setSelectedSlot(s)}
                            aria-pressed={isSelected}
                          >
                            {label}
                          </button>
                        );
                      })
                    ) : (
                      <div className={styles.noSlots}><p>El creador aun no publico horarios.</p></div>
                    )}
                  </div>
                  <div className={styles.confirmWrap}>
                    <Button
                      onClick={handleConfirmSlot}
                      width="100%"
                      text="Confirmar"
                      loading={confirmingSlot}
                      disabled={confirmingSlot || !selectedSlot}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
    <ModalComponent
      open={showConfirmSuccess}
      onClose={handleCloseConfirmModal}
      closeIcon={false}
      styles={{ width: "min(90vw, 420px)", maxWidth: "420px" }}
    >
      <div className={styles.successModal}>
        <h3 className={styles.successTitle}>Solicitud confirmada</h3>
        <p className={styles.successMessage}>
          Confirmaste el horario seleccionado. Avisamos al solicitante para coordinar la ayuda.
        </p>
        <div className={styles.successActions}>
          <Button onClick={handleCloseConfirmModal} text="OK" width="100%" />
        </div>
      </div>
    </ModalComponent>
    </>
  );
};
