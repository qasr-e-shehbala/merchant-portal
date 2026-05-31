export async function safeQuery<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[db] query failed, returning fallback:", (error as Error).message);
    }
    return fallback;
  }
}
