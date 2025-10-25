export function getErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message || fallback;
  if (typeof (error as { message?: unknown }).message === 'string') {
    return String((error as { message?: unknown }).message);
  }
  return fallback;
}

