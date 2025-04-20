  export function toJson(
    source: unknown,
    formatting: boolean = false // not used directly since JSON.stringify does not have formatting option like Newtonsoft
  ): string | null {
    if (source === null || source === undefined) return null;
  
    try {
      return JSON.stringify(source, null, formatting ? 2 : undefined);
    } catch {
      return null;
    }
  }
  