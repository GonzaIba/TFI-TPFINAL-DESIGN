"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { AvatarUser, Button, ExpiryTimer, Loading } from "@/components";
import { Trophy, AlertCircle } from "lucide-react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { parseApiUtc, formatLocalSlot } from "@/lib/utils/datetime";
import type {
  RequestHelpResponse,
  ChatMessageResponse,
  RequestHelpDetailResponse,
  HelpRequestChatDetailResponse,
} from "@/lib/types/forum";
import useSnackBarStore from "@/store/slices/snackBarStore/snackbarStore";
import useLiveHelpStore from "@/store/slices/liveHelpStore/liveHelpStore";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/store/slices/authStore/authStore";
import { liveHelpChatService } from "@/lib/services/forum/liveHelpChatService";
import { requestHelpService } from "@/lib/services/forum/requestHelpService";
import { useLiveHelpChatSignalR } from "@/hooks";

type Slot = { start: string; end: string };

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
  const readValue = normalizeBoolean(raw?.readed ?? raw?.Readed ?? raw?.read ?? raw?.Read ?? raw?.readByOther ?? raw?.ReadByOther);

  return {
    id,
    from: fromMe ? "me" : "other",
    text,
    at,
    utc,
    pending: false,
    delivered: true,
    read: fromMe ? !!readValue : undefined,
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

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(false);
  const lastMarkedOtherRef = useRef<string | number | null>(null);
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
          const updated = prev.map((it) =>
            it.chatCode === msgChatCode
              ? {
                  ...it,
                  lastText: text,
                  lastAt: nowIso,
                  unread: isFromMe || msgChatCode === codeChat ? 0 : (it.unread ?? 0) + 1,
                }
              : it
          );
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
        ((selectedFromStore as any).CodeRequestHelp === idParam || (selectedFromStore as any).codeRequestHelp === idParam)
      ) {
        setRequest(selectedFromStore);
        return;
      }
      const matches = queryClient.getQueriesData<any>({ queryKey: ["livehelp", "requests-cursor"] });
      for (const [, data] of matches) {
        if (!data) continue;
        const items: RequestHelpResponse[] = Array.isArray(data) ? data : data?.pages?.flatMap?.((p: any) => p.items ?? []) ?? [];
        const found = items.find((x: any) => x?.CodeRequestHelp === idParam || x?.codeRequestHelp === idParam);
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
            if ((parsed as any).CodeRequestHelp === idParam || (parsed as any).codeRequestHelp === idParam) {
              setRequest(parsed);
            }
          } catch {}
        }
      }
    } catch {}
  }, [idParam, queryClient, request, selectedFromStore]);

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
        const list = (res?.data as any[]) ?? [];
        if (cancelled) return;
        const mapped = list.map((raw) => {
          const chatCode = raw?.chatCode ?? raw?.ChatCode ?? raw?.codeChat ?? raw?.CodeChat ?? raw?.chatId ?? raw?.ChatId;
          const other = raw?.other ?? raw?.Other ?? {};
          const lm = raw?.lastMessage ?? raw?.LastMessage ?? null;
          const lastText =
            typeof raw?.lastText === "string"
              ? raw.lastText
              : typeof raw?.LastText === "string"
              ? raw.LastText
              : typeof lm?.preview === "string"
              ? lm.preview
              : typeof lm?.Preview === "string"
              ? lm.Preview
              : "";
          const lastAtRaw = raw?.lastAt ?? raw?.LastAt ?? lm?.at ?? lm?.At ?? null;
          const lastAt = lastAtRaw ? parseApiUtc(lastAtRaw).toISOString() : null;
          const unread = raw?.unreadCount ?? raw?.UnreadCount ?? raw?.count ?? 0;
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
      if (detail?.chatCode && typeof detail.chatCode === "number") {
        setCodeChat(detail.chatCode);
      }
      const list = detail?.messages ?? [];
      const mapped = list.map((m: any) => toChatMessage(m));
      setChat(mapped);
      const lastOther = [...mapped].reverse().find((m) => m.from === "other");
      if (lastOther && codeChat) {
        lastMarkedOtherRef.current = lastOther.id ?? null;
        const payload = lastOther.utc ? { codeChat, upToUtc: lastOther.utc } : { codeChat };
        try {
          await liveHelpChatService.markChatAsRead(idParam, payload);
        } catch {}
      }
    } catch {
      setChatError(true);
      setChat([]);
    } finally {
      setChatLoading(false);
    }
  }, [idParam, codeChat, toChatMessage]);

  useEffect(() => {
    fetchInitialChat();
  }, [fetchInitialChat]);

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chat]);

  useEffect(() => {
    if (!idParam || !codeChat || chat.length === 0) return;
    const lastOther = [...chat].reverse().find((m) => m.from === "other");
    if (!lastOther) return;
    if (lastOther.id === lastMarkedOtherRef.current) return;
    lastMarkedOtherRef.current = lastOther.id;
    const payload = lastOther.utc ? { codeChat, upToUtc: lastOther.utc } : { codeChat };
    liveHelpChatService.markChatAsRead(idParam, payload).catch(() => {});
    setInbox((prev) => prev.map((it) => (it.chatCode === codeChat ? { ...it, unread: 0 } : it)));
  }, [chat, idParam, codeChat]);

  const onSendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || !idParam) return;
    const tempId = Math.random().toString(36).slice(2);
    const now = Date.now();
    const tempMessage: ChatMsg = { id: tempId, from: "me", text, at: now, pending: true, delivered: false };
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
      const res = await liveHelpChatService.sendChatMessage(idParam, { codeChat: chatCodeLocal, message: text, connectionId });
      const raw = res?.data;
      if (raw) {
        const mapped = mapChatMessage(raw, userEmail);
        setChat((prev) => prev.map((m) => (m.id === tempId ? { ...mapped, pending: false, delivered: true } : m)));
      } else {
        setChat((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, delivered: true } : m)));
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

  return (
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
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={name} className={styles.inboxAvatarImg} />
                          ) : (
                            <div className={styles.inboxAvatar}>{initials}</div>
                          )}
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
                        <div className={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther, m.pending ? styles.msgBubblePending : ""].join(" ")}>{m.text || "(sin contenido)"}</div>
                        <div className={styles.msgMeta}>
                          <span>{formatTimeLabel(m.at)}</span>
                          {isMe && (
                            <span className={[styles.tick, m.pending ? styles.tickPending : m.delivered && m.read ? styles.tickRead : styles.tickDouble].join(" ")}>
                              {m.pending ? "." : m.delivered ? (m.read ? "VV" : "VV") : "-"}
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
                const composerDisabled = enterLoading || mustSelectChatFirst || chatLoading || (codeChat !== null && chatError);
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
                    <Button onClick={onSendChat} text={mustSelectChatFirst ? "Elegi un chat" : chatError ? "Reintentar carga" : "Enviar"} width="110px" height="42px" disabled={composerDisabled} />
                  </>
                );
              })()}
            </div>
          </section>
        </section>

        <aside className={styles.rightCol}>
          <div className={styles.sidebarSticky}>
            <div className={styles.availabilityCard}>
              <h2 className={styles.avTitle}>Disponibilidad</h2>
              <div className={styles.slotsList} aria-live="polite">
                {request?.timeSlot?.slots?.length ? (
                  request.timeSlot.slots.map((s) => {
                    const label = formatLocalSlot(s.start, s.end);
                    const isSelected = selectedSlot?.start === s.start && selectedSlot?.end === s.end;
                    return (
                      <button key={`${s.start}--${s.end}`} className={`${styles.slotItem} ${isSelected ? styles.slotSelected : ""}`} onClick={() => setSelectedSlot(s)} aria-pressed={isSelected}>
                        {label}
                      </button>
                    );
                  })
                ) : (
                  <div className={styles.noSlots}><p>El creador aun no publico horarios.</p></div>
                )}
              </div>
              <div className={styles.confirmWrap}>
                <Button onClick={() => {}} width="100%" text="Confirmar" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
