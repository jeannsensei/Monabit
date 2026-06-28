export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelay?: number; maxDelay?: number } = {},
): Promise<T> {
  const { retries = 3, baseDelay = 1000, maxDelay = 30000 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;

      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay,
      );
      await sleep(delay);
    }
  }

  throw new Error('Unreachable');
}
