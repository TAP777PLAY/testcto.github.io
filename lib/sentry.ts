interface SentryConfig {
  dsn?: string;
  environment?: string;
  tracesSampleRate?: number;
}

class SentryClient {
  private config: SentryConfig;
  private enabled: boolean;

  constructor() {
    this.config = {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),
    };
    this.enabled = !!this.config.dsn && process.env.NODE_ENV === 'production';
    
    if (this.enabled) {
      console.log(`Sentry initialized for ${this.config.environment}`);
    }
  }

  captureException(error: Error, context?: Record<string, any>) {
    if (!this.enabled) {
      console.error('Error captured:', error, context);
      return;
    }

    console.error('[Sentry] Error:', {
      message: error.message,
      stack: error.stack,
      context,
      environment: this.config.environment,
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
    if (!this.enabled) {
      console.log(`[${level}] ${message}`, context);
      return;
    }

    console.log(`[Sentry] ${level}:`, {
      message,
      context,
      environment: this.config.environment,
    });
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    if (!this.enabled) return;
    console.log('[Sentry] User set:', user);
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'info' | 'warning' | 'error';
    data?: Record<string, any>;
  }) {
    if (!this.enabled) return;
    console.log('[Sentry] Breadcrumb:', breadcrumb);
  }

  setTag(key: string, value: string) {
    if (!this.enabled) return;
    console.log(`[Sentry] Tag: ${key}=${value}`);
  }

  setContext(name: string, context: Record<string, any>) {
    if (!this.enabled) return;
    console.log(`[Sentry] Context ${name}:`, context);
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

let sentry: SentryClient | null = null;

export function getSentryClient(): SentryClient {
  if (!sentry) {
    sentry = new SentryClient();
  }
  return sentry;
}

export function captureException(error: Error, context?: Record<string, any>) {
  const client = getSentryClient();
  client.captureException(error, context);
}

export function captureMessage(message: string, level?: 'info' | 'warning' | 'error', context?: Record<string, any>) {
  const client = getSentryClient();
  client.captureMessage(message, level, context);
}

export function withSentryErrorBoundary<T>(
  fn: () => T,
  errorHandler?: (error: Error) => void
): T | undefined {
  try {
    return fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    captureException(err);
    if (errorHandler) {
      errorHandler(err);
    }
    return undefined;
  }
}

export async function withSentryErrorBoundaryAsync<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    captureException(err);
    if (errorHandler) {
      errorHandler(err);
    }
    return undefined;
  }
}
