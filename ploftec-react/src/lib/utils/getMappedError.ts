import { ExceptionBase } from "@/lib/types/exception";
import { errorUIMapper, ErrorUIConfig } from "../types/exception";

export type MappedError = {
  exception: ExceptionBase;
  config: ErrorUIConfig;
};

export function getMappedError(errors: ExceptionBase[]): MappedError | null {
  for (const err of errors) {
    const config = errorUIMapper[err.nameError];
    if (config) {
      return { exception: err, config };
    }
  }
  return null;
}
