"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { AvatarUser, Button, ExpiryTimer, Loading } from "@/components";
import { Trophy } from "lucide-react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { parseApiUtc, formatLocalSlot } from "@/lib/utils/datetime";
import type { RequestHelpResponse, ChatMessageResponse } from "@/lib/types/forum";
import DraggableBottomSheet from "@/components/draggableBottomSheet/draggableBottomSheet";
import { ModalComponent } from "@/components";
import useSnackBarStore from "@/store/slices/snackBarStore/snackbarStore";
import useLiveHelpStore from "@/store/slices/liveHelpStore/liveHelpStore";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/store/slices/authStore/authStore";
import { liveHelpChatService } from "@/lib/services/forum/liveHelpChatService";
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
    } catch {
      // ignore parsing failure, will fallback below
    }
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
    raw?.sentByMe ?? raw?.SentByMe ?? raw?.isMine ?? raw?.IsMine
  );
  const senderId = extractSenderId(raw);
  const fromMe = typeof sentFlag === "boolean"
    ? sentFlag
    : !!(userEmail && senderId && senderId === userEmail);

  const text =
    typeof raw?.message === "string"
      ? raw.message
      : typeof raw?.Message === "string"
      ? raw.Message
      : typeof raw?.content === "string"
      ? raw.content
      : "";

  const { at, utc } = resolveCreatedAt(raw);

  const readValue = normalizeBoolean(
    raw?.readed ?? raw?.Readed ?? raw?.readByOther ?? raw?.ReadByOther
  );

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
  return Number.isNaN(date.getTime())
    ? "--:--"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const lastMarkedOtherRef = useRef<string | number | null>(null);

  const showToast = useSnackBarStore((s) => s.showToast);

  const toChatMessage = useCallback(
    (raw: any) => mapChatMessage(raw, userEmail),
    [userEmail]
  );

  const handleMessageAdded = useCallback(
    (raw: any) => {
      if (!raw) return;
      const mapped = toChatMessage(raw);
      setChat((prev) => {
        if (mapped.id && prev.some((m) => m.id === mapped.id)) return prev;
        return [...prev, mapped];
      });
    },
    [toChatMessage]
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
    if (request || !idParam) return;

    if (
      selectedFromStore &&
      ((selectedFromStore as any).CodeRequestHelp === idParam ||
        (selectedFromStore as any).codeRequestHelp === idParam)
    ) {
      setRequest(selectedFromStore);
      return;
    }

    try {
      const matches = queryClient.getQueriesData<any>({
        queryKey: ["livehelp", "requests-cursor"],
      });
      for (const [, data] of matches) {
        if (!data) continue;
        const items: RequestHelpResponse[] = Array.isArray(data)
          ? data
          : data?.pages?.flatMap?.((p: any) => p.items ?? []) ?? [];
        const found = items.find(
          (x: any) =>
            x?.CodeRequestHelp === idParam || x?.codeRequestHelp === idParam
        );
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
            if (
              (parsed as any).CodeRequestHelp === idParam ||
              (parsed as any).codeRequestHelp === idParam
            ) {
              setRequest(parsed);
            }
          } catch {
            // ignore JSON errors
          }
        }
      }
    } catch {
      // ignore cache lookup issues
    }
  }, [idParam, queryClient, request, selectedFromStore]);

  useEffect(() => {
    if (!request) return;
    const timer = window.setTimeout(() => setEnterLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, [request]);

  useEffect(() => {
    if (!request && !enterLoading) setEnterLoading(false);
  }, [request, enterLoading]);

  const fetchInitialChat = useCallback(async () => {
    if (!idParam) return;
    setChatLoading(true);
    try {
      const res = await liveHelpChatService.getChatMessages(idParam, undefined, 50, true);
      const data = res.data ?? [];
      const mapped = data.map((m: any) => toChatMessage(m));
      setChat(mapped);
      const lastOther = [...mapped].reverse().find((m) => m.from === "other");
      if (lastOther) {
        lastMarkedOtherRef.current = lastOther.id ?? null;
        const payload = lastOther.utc ? { lastMessageUtc: lastOther.utc } : {};
        try {
          await liveHelpChatService.markChatAsRead(idParam, payload);
        } catch {
          // silent fail
        }
      }
    } finally {
      setChatLoading(false);
    }
  }, [idParam, toChatMessage]);

  useEffect(() => {
    fetchInitialChat();
  }, [fetchInitialChat]);

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chat]);

  useEffect(() => {
    if (!idParam || chat.length === 0) return;
    const lastOther = [...chat].reverse().find((m) => m.from === "other");
    if (!lastOther) return;
    if (lastOther.id === lastMarkedOtherRef.current) return;
    lastMarkedOtherRef.current = lastOther.id;
    const payload = lastOther.utc ? { lastMessageUtc: lastOther.utc } : {};
    liveHelpChatService.markChatAsRead(idParam, payload).catch(() => {});
  }, [chat, idParam]);

  const created = useMemo(
    () => (request ? parseApiUtc(request.createdAt as any) : null),
    [request]
  );
  const expires = useMemo(
    () => (request ? parseApiUtc(request.expiresAt as any) : null),
    [request]
  );

  const onBack = () => {
    setLoading(true);
    setTimeout(() => router.push("/forum/liveHelp"), 600);
  };

  const onSendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || !idParam) return;
    const tempId = Math.random().toString(36).slice(2);
    const now = Date.now();
    const tempMessage: ChatMsg = {
      id: tempId,
      from: "me",
      text,
      at: now,
      utc: new Date(now).toISOString(),
      pending: true,
      delivered: false,
      read: false,
    };
    setChat((prev) => [...prev, tempMessage]);
    setChatInput("");
    try {
      const res = await liveHelpChatService.sendChatMessage(idParam, {
        message: text,
        connectionId,
      });
      const raw = res?.data;
      if (raw) {
        const mapped = mapChatMessage(raw, userEmail);
        setChat((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...mapped, pending: false, delivered: true }
              : m
          )
        );
      } else {
        setChat((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, pending: false, delivered: true } : m
          )
        );
      }
    } catch {
      setChat((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, pending: false, delivered: false } : m
        )
      );
      showToast({ message: "No se pudo enviar el mensaje", variant: "error" });
    }
  }, [chatInput, idParam, connectionId, showToast, userEmail]);

  const canConfirm = !!selectedSlot;
  const selectedSlotLabel =
    selectedSlot && request
      ? formatLocalSlot(selectedSlot.start, selectedSlot.end)
      : "Selecciona una franja";

  const onConfirm = () => {
    if (!canConfirm || !request || !selectedSlot) return;
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setMobileSheetOpen(false);
      showToast({ message: "Cita solicitada / confirmada", variant: "success" });
    }, 900);
  };

  return (
  <main className={styles.container}>
    <Loading show={loading || enterLoading} />

    <div className={styles.headerBar}>
      <Button
        onClick={onBack}
        icon={<ArrowBack />}
        text="Volver"
        transparent
        ariaLabel="Volver"
      />
    </div>

    <div className={styles.columns}>
      <section className={styles.leftCol}>
        {request && (
          <section className={styles.headerCard}>
            <div className={styles.headerRow}>
              <div className={styles.headerLeft}>
                <AvatarUser
                  tagUser={request.userCreator?.initials ?? "AU"}
                  imageUser={request.userCreator?.image}
                  descripcionCorta={request.userCreator?.shortDescription ?? ""}
                  descripcionLarga={request.userCreator?.longDescription ?? ""}
                />
              </div>

              <div className={styles.headerMain}>
                <h1 className={styles.title}>{request.titleHelp}</h1>

                <div className={styles.metaRow}>
                  <span className={styles.status}>{request.status}</span>
                  {typeof request.regard === "number" && (
                    <span className={styles.reward}>
                      <Trophy size={16} className={styles.trophy} />
                      {request.regard} puntos
                    </span>
                  )}
                  <div className={styles.timerWrap}>
                    <span className={styles.timerText}>Expira en:</span>
                    {expires && <ExpiryTimer expiresAt={expires} />}
                  </div>
                </div>

                <div className={styles.metaRow}>
                  {created && (
                    <span className={styles.timerText}>
                      Creada: {created.toLocaleString()}
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
                    <span key={l} className={styles.chip}>
                      {l}
                    </span>
                  ))}
                </div>

                <div className={styles.chipsGroup}>
                  {(request.labels ?? []).map((t) => (
                    <span key={t} className={styles.chipAlt}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className={styles.chatPanel} aria-labelledby="chat-heading">
          <h2 id="chat-heading" className={styles.sectionTitle}>
            Chat
          </h2>

          <div ref={chatBodyRef} className={styles.chatHistory} aria-live="polite">
            {chatLoading ? (
              <div className={styles.chatEmpty}>Cargando mensajes...</div>
            ) : chat.length === 0 ? (
              <div className={styles.chatEmpty}>
                Aún no hay mensajes. ¡Escribe el primero!
              </div>
            ) : (
              chat.map((m) => {
                const isMe = m.from === "me";
                return (
                  <div
                    key={m.id}
                    className={`${styles.chatMsg} ${isMe ? styles.chatMsgMe : styles.chatMsgOther}`}
                  >
                    <div className={styles.msgWrap}>
                      <div
                        className={[
                          styles.msgBubble,
                          isMe ? styles.msgBubbleMe : styles.msgBubbleOther,
                          m.pending ? styles.msgBubblePending : "",
                        ].join(" ")}
                      >
                        {m.text || "(sin contenido)"}
                      </div>

                      <div className={styles.msgMeta}>
                        <span>{formatTimeLabel(m.at)}</span>
                        {isMe && (
                          <span
                            className={[
                              styles.tick,
                              m.pending
                                ? styles.tickPending
                                : m.delivered && m.read
                                ? styles.tickRead
                                : styles.tickDouble,
                            ].join(" ")}
                            title={
                              m.pending ? "Enviando…" : m.delivered ? (m.read ? "Leído" : "Entregado") : "Error"
                            }
                          >
                            {m.pending ? "…" : m.delivered ? (m.read ? "✓✓" : "✓✓") : "—"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })

            )}
          </div>

          <div className={styles.chatComposer}>
            <input
              className={styles.composerInput}
              placeholder="Escribe un mensaje..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSendChat();
              }}
              aria-label="Escribir mensaje"
            />
            <Button onClick={onSendChat} text="Enviar" width="110px" height="42px" />
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
                  const isSelected =
                    selectedSlot?.start === s.start && selectedSlot?.end === s.end;
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
                <div className={styles.noSlots}>
                  <p>El creador aún no publicó horarios.</p>
                </div>
              )}
            </div>

            <div className={styles.confirmWrap}>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={!canConfirm}
                width="100%"
                text={canConfirm ? "Confirmar ·" : "Confirmar"}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div className={styles.bottomBar}>
      <Button
        onClick={() => setMobileSheetOpen(true)}
        text="Elegir horario"
        width="100%"
      />
    </div>

    <DraggableBottomSheet
      isOpen={mobileSheetOpen}
      onClose={() => setMobileSheetOpen(false)}
      openRatio={0.96}
      midRatio={0.9}
    >
      <div className={styles.sheetContent}>
        <div className={styles.slotsListSheet} aria-live="polite">
          {request?.timeSlot?.slots?.length ? (
            request.timeSlot.slots.map((s) => {
              const label = formatLocalSlot(s.start, s.end);
              const isSelected =
                selectedSlot?.start === s.start && selectedSlot?.end === s.end;
              return (
                <button
                  key={`m-${s.start}-${s.end}`}
                  className={`${styles.slotItem} ${isSelected ? styles.selected : ""}`}
                  onClick={() => setSelectedSlot(s)}
                  aria-pressed={isSelected}
                >
                  {label}
                </button>
              );
            })
          ) : (
            <div className={styles.noSlots}>
              <p>El creador aún no publicó horarios.</p>
            </div>
          )}
        </div>

        <div className={styles.sheetConfirm}>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!canConfirm}
            text={canConfirm ? "Confirmar ·" : "Confirmar"}
            width="100%"
          />
        </div>
      </div>
    </DraggableBottomSheet>

    <ModalComponent
      open={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      styles={{ width: "520px" }}
    >
      <div className={styles.modalWrap}>
        <h3>Confirmar turno</h3>
        <p>
          {canConfirm
            ? "Reservar: se enviará confirmación y notificación al creador."
            : "Selecciona una franja horaria."}
        </p>
        <p className={styles.policy}>
          Al confirmar aceptás la política de cancelación y la conducta de la comunidad.
        </p>
        <div className={styles.modalActions}>
          <Button onClick={onConfirm} loading={confirmLoading} text="Confirmar" />
          <Button onClick={() => setConfirmOpen(false)} text="Cancelar" transparent />
        </div>
      </div>
    </ModalComponent>
  </main>
);

}