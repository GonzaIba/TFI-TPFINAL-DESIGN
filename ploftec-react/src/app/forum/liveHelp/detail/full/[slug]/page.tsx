"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { AvatarUser, Button, ExpiryTimer, Loading } from "@/components";
import { useOpenForumUserDetail } from "@/hooks";
import { Trophy } from "lucide-react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { parseApiUtc, formatLocalSlot } from "@/lib/utils/datetime";
import type { RequestHelpResponse } from "@/lib/types/forum";
import DraggableBottomSheet from "@/components/draggableBottomSheet/draggableBottomSheet";
import { ModalComponent } from "@/components";
import useSnackBarStore from "@/store/slices/snackBarStore/snackbarStore";
import useLiveHelpStore from "@/store/slices/liveHelpStore/liveHelpStore";
import { useQueryClient } from "@tanstack/react-query";

type Slot = { start: string; end: string };

type ChatMsg = { id: string; from: "me" | "other"; text: string; at: number };

export default function LiveHelpDetailPage() {
  const router = useRouter();
  const openForumUserDetail = useOpenForumUserDetail();
  const params = useParams<{ slug: string }>();
  const sp = useSearchParams();
  const idParam = sp.get("id");
  const [loading, setLoading] = useState(false);

  const [request, setRequest] = useState<RequestHelpResponse | null>(null);
  const selectedFromStore = useLiveHelpStore((s) => s.selected);
  const queryClient = useQueryClient();

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  const showToast = useSnackBarStore(s => s.showToast);

  // Cargar data real desde store o cache de React Query
  useEffect(() => {
    if (request) return;
    const id = idParam ? Number(idParam) : undefined;
    if (selectedFromStore && (!id || selectedFromStore.codeRequestHelp === id)) {
      setRequest(selectedFromStore);
      return;
    }
    // Buscar en cache de queries (feed infinito)
    try {
      const matches = queryClient.getQueriesData<any>({ queryKey: ["livehelp", "requests-cursor"] });
      for (const [, data] of matches) {
        if (!data) continue;
        const items: RequestHelpResponse[] = Array.isArray(data) ? data : (data?.pages?.flatMap?.((p: any) => p.items ?? []) ?? []);
        const found = items.find((x) => x.codeRequestHelp === id);
        if (found) {
          setRequest(found);
          break;
        }
      }
    } catch {}
  }, [idParam, selectedFromStore, request, queryClient]);

  const created = useMemo(() => (request ? parseApiUtc(request.createdAt as any) : null), [request]);
  const expires = useMemo(() => (request ? parseApiUtc(request.expiresAt as any) : null), [request]);

  function onBack() {
    setLoading(true);
    setTimeout(() => router.push("/forum/liveHelp"), 600);
  }

  function onSendChat() {
    const text = chatInput.trim();
    if (!text) return;
    const msg: ChatMsg = { id: String(Math.random()), from: "me", text, at: Date.now() };
    setChat(prev => [...prev, msg]);
    setChatInput("");
  }

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chat.length]);

  const canConfirm = !!selectedSlot;
  const selectedSlotLabel = selectedSlot && request
    ? formatLocalSlot(selectedSlot.start, selectedSlot.end)
    : "Selecciona una franja";

  function onConfirm() {
    if (!canConfirm || !request || !selectedSlot) return;
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setMobileSheetOpen(false);
      showToast({ message: "Cita solicitada / confirmada", variant: "success" });
    }, 900);
  }

  return (
    <main className={styles.container}>
      <Loading show={loading} />

      <div className={styles.headerBar}>
        <Button onClick={onBack} icon={<ArrowBack />} text="Volver" transparent ariaLabel="Volver" />
      </div>

      <div className={styles.columns}>
        <section className={styles.leftCol}>
          {request && (
            <section className={styles.headerCard}>
              <div className={styles.headerRow}>
                <div className={styles.headerLeft}>
                  <AvatarUser
                    tagUser={request.userCreator?.initials ?? "AU"}
                    onClick={() => openForumUserDetail(request.userCreator?.email)}
                    imageUser={request.userCreator?.image}
                    descripcionCorta={request.userCreator?.shortDescription ?? ""}
                    descripcionLarga={request.userCreator?.longDescription ?? ""}
                    nombreCompleto={request.userCreator?.completeName ?? ""}
                    direction="right"
                  />
                </div>
                <div className={styles.headerMain}>
                  <h1 className={styles.title}>{request.titleHelp}</h1>
                  <div className={styles.metaRow}>
                    <span className={styles.status}>{request.status}</span>
                    <span className={styles.reward}><Trophy size={16} className={styles.trophy} />{request.regard.toFixed(2)}</span>
                    {created && expires && (
                      <div className={styles.timerWrap}>
                        <ExpiryTimer expiresAt={expires} startedAt={created} size={32} />
                        <span className={styles.timerText}>Tiempo restante</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Botón de acción en header removido por requerimiento */}
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

          <section className={styles.chatPanel} aria-labelledby="chat-heading">
            <h2 id="chat-heading" className={styles.sectionTitle}>Chat</h2>
            <div ref={chatBodyRef} className={styles.chatHistory} aria-live="polite">
              {chat.length === 0 ? (
                <div className={styles.chatEmpty}>Aún no hay mensajes. ¡Escribe el primero!</div>
              ) : (
                chat.map((m) => (
                  <div key={m.id} className={`${styles.chatMsg} ${m.from === "me" ? styles.me : styles.other}`}>
                    <div className={styles.msgBubble}>{m.text}</div>
                  </div>
                ))
              )}
            </div>
            <div className={styles.chatComposer}>
              <input
                className={styles.composerInput}
                placeholder="Escribe un mensaje..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onSendChat(); }}
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
                request.timeSlot.slots.map((s, i) => {
                  const label = formatLocalSlot(s.start, s.end);
                  const isSel = selectedSlot?.start === s.start && selectedSlot?.end === s.end;
                  return (
                    <button
                      key={`${s.start}-${s.end}-${i}`}
                      className={`${styles.slotItem} ${isSel ? styles.slotSelected : ""}`}
                      onClick={() => setSelectedSlot(s)}
                      aria-pressed={isSel}
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
            </div> {/* ← ESTE faltaba */}
            <div className={styles.confirmWrap}>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={!canConfirm}
                width="100%"
              >
                <span className={styles.confirmText}>Confirmar{canConfirm ? ` · ${selectedSlotLabel}` : ""}</span>
              </Button>
            </div>
            </div>
          </div>
        </aside>
      </div>

      <div className={styles.bottomBar}>
        <Button onClick={() => setMobileSheetOpen(true)} text="Elegir horario" width="100%" />
      </div>

      <DraggableBottomSheet isOpen={mobileSheetOpen} onClose={() => setMobileSheetOpen(false)} openRatio={0.94} midRatio={0.85}>
        <div className={styles.sheetContent}>
          <div className={styles.slotsListSheet} aria-live="polite">
            {request?.timeSlot?.slots?.length ? (
              request.timeSlot.slots.map((s, i) => {
                const label = formatLocalSlot(s.start, s.end);
                const isSel = selectedSlot?.start === s.start && selectedSlot?.end === s.end;
                return (
                  <button
                    key={`m-${s.start}-${s.end}-${i}`}
                    className={`${styles.slotItem} ${isSel ? styles.slotSelected : ""}`}
                    onClick={() => setSelectedSlot(s)}
                    aria-pressed={isSel}
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
            <Button onClick={() => setConfirmOpen(true)} disabled={!canConfirm} text={canConfirm ? `Confirmar · ${selectedSlotLabel}` : "Confirmar"} width="100%" />
          </div>
        </div>
      </DraggableBottomSheet>

      <ModalComponent open={confirmOpen} onClose={() => setConfirmOpen(false)} styles={{ width: "520px" }}>
        <div className={styles.modalWrap}>
          <h3>Confirmar turno</h3>
          <p>
            {canConfirm ? `Reservar: ${selectedSlotLabel}` : "Selecciona una franja horaria."}
          </p>
          <p className={styles.policy}>Al confirmar aceptas la política de cancelación y conducta de la comunidad.</p>
          <div className={styles.modalActions}>
            <Button onClick={onConfirm} loading={confirmLoading} text="Confirmar" />
            <Button onClick={() => setConfirmOpen(false)} text="Cancelar" transparent />
          </div>
        </div>
      </ModalComponent>
    </main>
  );
}
