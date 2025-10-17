'use client';

import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/slices/authStore/authStore';
import { alertsService } from '@/lib/services/forum/alertsService';
import { ForumAlert, AlertSeverity } from '@/lib/types/alerts';
import { ModalComponent } from '@/components/modalComponent/modalComponent';
import { AlertModal } from '@/components/alerts/alertModal';

export type RequestAlertBadge = {
  id: string;
  type: string;
  severity: AlertSeverity;
  label: string;
  message?: string;
};

type AlertsContextValue = {
  getBadgesForRequest: (requestCode: string | number) => RequestAlertBadge[];
  hasBadgeForRequest: (requestCode: string | number) => boolean;
};

const AlertsContext = createContext<AlertsContextValue | undefined>(undefined);

export function useAlertsLayer() {
  const ctx = useContext(AlertsContext);
  if (!ctx) {
    throw new Error('useAlertsLayer must be used within AlertsLayer');
  }
  return ctx;
}

type RequestBadgesState = Record<string, RequestAlertBadge[]>;

const POLL_INTERVAL_MS = 55000;
const MODAL_SEVERITIES = new Set(['critical', 'high']);
const BADGE_SEVERITIES = new Set(['high', 'warning', 'info']);
const FALLBACK_MODAL_TYPES = new Set(['meeting_live', 'meeting_soon', 'no_slots']);

function normalize(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim().toLowerCase();
  return String(value).trim().toLowerCase();
}

function shouldDisplayAsModal(alert: ForumAlert): boolean {
  const severity = normalize(alert.severity);
  if (!MODAL_SEVERITIES.has(severity)) return false;

  const channel = normalize(alert.channelSuggested);
  if (channel === 'modal') return true;

  const type = normalize(alert.type);
  if (FALLBACK_MODAL_TYPES.has(type)) return true;

  if (type === 'request_expiring') {
    const message = normalize(alert.message);
    if (message.includes('sin disponibilidad')) return true;
  }

  return false;
}

function shouldDisplayAsBadge(alert: ForumAlert, isModalCandidate: boolean): boolean {
  const severity = normalize(alert.severity);
  if (!BADGE_SEVERITIES.has(severity)) {
    return false;
  }
  if (severity === 'high') {
    return true;
  }
  return !isModalCandidate;
}

function extractRequestCodes(alert: ForumAlert): string[] {
  const codes = new Set<string>();
  const pushValue = (value: unknown) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach(pushValue);
      return;
    }
    const parsed = typeof value === 'number'
        ? String(value)
        : typeof value === 'string'
        ? value.trim()
        : null;
    if (parsed) {
      codes.add(parsed);
    }
  };

  const fromKey = (source?: string) => {
    if (!source) return;
    const match = source.match(/request:([0-9]+)/i);
    if (match && match[1]) {
      codes.add(match[1]);
    }
  };

  if (alert.data) {
    pushValue(alert.data.requestId);
    pushValue(alert.data.noSlots);
  }

  fromKey(alert.id);
  fromKey(alert.dedupeKey);

  return Array.from(codes);
}

function buildRequestBadges(alerts: ForumAlert[]): RequestBadgesState {
  const badges: RequestBadgesState = {};

  alerts.forEach((alert) => {
    const isModalCandidate = shouldDisplayAsModal(alert);
    const qualifiesForBadge = shouldDisplayAsBadge(alert, isModalCandidate);

    if (!qualifiesForBadge) return;

    const codes = extractRequestCodes(alert);
    if (codes.length === 0) return;

    codes.forEach((code) => {
      const key = String(code);
      if (!badges[key]) {
        badges[key] = [];
      }
      if (!badges[key].some((existing) => existing.id === alert.id)) {
        badges[key].push({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          label: alert.title || alert.message,
          message: alert.message,
        });
      }
    });
  });

  return badges;
}

function areBadgesEqual(
  prev: RequestBadgesState,
  next: RequestBadgesState,
): boolean {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return false;
  return nextKeys.every((key) => {
    const a = prev[key];
    const b = next[key];
    if (!a || !b || a.length !== b.length) return false;
    return a.every((item, idx) => item.id === b[idx]?.id);
  });
}

export function AlertsLayer({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAuthLoaded = useAuthStore((state) => state.isAuthLoaded);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [modalQueue, setModalQueue] = useState<ForumAlert[]>([]);
  const modalAlertRef = useRef<ForumAlert | null>(null);
  const dismissedModalIdsRef = useRef<Set<string>>(new Set());
  const [requestBadges, setRequestBadges] = useState<RequestBadgesState>({});

  const intervalRef = useRef<number | null>(null);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const fetchAlerts = useCallback(
    async (origin: string) => {
      if (!mountedRef.current || !isAuthLoaded || !isAuthenticated) return;
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      try {
        const response = await alertsService.getAlerts();
        if (!mountedRef.current) return;
        const alerts = response.data ?? [];
        const nextBadges = buildRequestBadges(alerts);
        setRequestBadges((prev) =>
          areBadgesEqual(prev, nextBadges) ? prev : nextBadges,
        );

        const modalCandidates = alerts.filter((alert) => shouldDisplayAsModal(alert));
        setModalQueue((prev) => {
          const filtered = modalCandidates.filter(
            (alert) => !dismissedModalIdsRef.current.has(alert.id),
          );
          if (filtered.length === 0) {
            return prev.length === 0 ? prev : [];
          }

          const prevById = new Map(prev.map((alert) => [alert.id, alert]));
          const nextQueue = filtered.map((alert) => {
            const prevAlert = prevById.get(alert.id);
            return prevAlert ? { ...prevAlert, ...alert } : alert;
          });

          const sameLength = nextQueue.length === prev.length;
          const sameOrder =
            sameLength &&
            nextQueue.every((alert, index) => alert.id === prev[index]?.id);
          const sameContent =
            sameOrder &&
            nextQueue.every((alert, index) => {
              const prevAlert = prev[index];
              if (!prevAlert) return false;
              const prevCta = prevAlert.cta ?? null;
              const nextCta = alert.cta ?? null;
              return (
                prevAlert.message === alert.message &&
                prevAlert.title === alert.title &&
                normalize(prevAlert.severity) === normalize(alert.severity) &&
                prevCta?.href === nextCta?.href &&
                prevCta?.label === nextCta?.label
              );
            });

          return sameContent ? prev : nextQueue;
        });
      } catch (err: any) {
        const status = err?.response?.status ?? err?.status;
        if (status === 401 || status === 403) {
          dismissedModalIdsRef.current.clear();
          setModalQueue([]);
          setRequestBadges({});
        }
        console.error('Error fetching alerts', origin, err);
      } finally {
        fetchingRef.current = false;
      }
    },
    [isAuthLoaded, isAuthenticated]
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const schedulePolling = useCallback(() => {
    stopPolling();
    intervalRef.current = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchAlerts('interval');
      }
    }, POLL_INTERVAL_MS);
  }, [fetchAlerts, stopPolling]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      void fetchAlerts('visibility');
      schedulePolling();
    } else {
      stopPolling();
      setModalQueue([]);
    }
  }, [fetchAlerts, schedulePolling, stopPolling]);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!isAuthenticated) {
      stopPolling();
      setModalQueue([]);
      modalAlertRef.current = null;
      dismissedModalIdsRef.current.clear();
      setRequestBadges({});
      return;
    }

    void fetchAlerts('auth');
    schedulePolling();

    return () => {
      stopPolling();
    };
  }, [isAuthLoaded, isAuthenticated, fetchAlerts, schedulePolling, stopPolling]);

  useEffect(() => {
    if (!isAuthenticated || !isAuthLoaded) return;
    void fetchAlerts('route');
  }, [
    pathname,
    searchParams?.toString(),
    isAuthenticated,
    isAuthLoaded,
    fetchAlerts,
  ]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  const closeModal = useCallback(() => {
    const current = modalAlertRef.current;
    if (current) {
      dismissedModalIdsRef.current.add(current.id);
    }
    modalAlertRef.current = null;
    setModalQueue((prev) => (prev.length > 0 ? prev.slice(1) : prev));
  }, []);

  const handlePrimaryAction = useCallback(() => {
    const current = modalAlertRef.current;
    if (!current?.cta?.href) {
      closeModal();
      return;
    }

    setModalQueue((prev) => {
      prev.forEach((alert) => {
        dismissedModalIdsRef.current.add(alert.id);
      });
      modalAlertRef.current = null;
      return [];
    });

    router.push(current.cta.href);
  }, [closeModal, router]);

  const [primaryButton, setPrimaryButton] =
    useState<HTMLButtonElement | null>(null);

  const currentModal = modalQueue[0] ?? null;

  useEffect(() => {
    modalAlertRef.current = currentModal;
  }, [currentModal]);

  useEffect(() => {
    if (!currentModal) {
      setPrimaryButton(null);
    }
  }, [currentModal]);

  useEffect(() => {
    if (currentModal && primaryButton) {
      // Defer focus until button is painted.
      const id = window.requestAnimationFrame(() => {
        primaryButton.focus();
      });
      return () => window.cancelAnimationFrame(id);
    }
    return;
  }, [currentModal, primaryButton]);

  const contextValue = useMemo<AlertsContextValue>(() => {
    return {
      getBadgesForRequest: (requestCode) => {
        const key = String(requestCode);
        return requestBadges[key] ?? [];
      },
      hasBadgeForRequest: (requestCode) => {
        const key = String(requestCode);
        return (requestBadges[key] ?? []).length > 0;
      },
    };
  }, [requestBadges]);

  return (
    <AlertsContext.Provider value={contextValue}>
      {children}
      <ModalComponent
        open={modalQueue.length > 0}
        onClose={closeModal}
        closeIcon={false}
      >
        {currentModal && (
          <AlertModal
            alert={currentModal}
            onClose={closeModal}
            onPrimary={handlePrimaryAction}
            setPrimaryButtonRef={setPrimaryButton}
          />
        )}
      </ModalComponent>
    </AlertsContext.Provider>
  );
}
