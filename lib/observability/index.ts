export interface LogContext {
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  organizationId?: string;
  recruiterId?: string;
  actionId?: string;
  [key: string]: any;
}

class StructuredLogger {
  private formatMessage(level: string, message: string, context?: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    };
    return JSON.stringify(logEntry);
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('INFO', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatMessage('ERROR', message, context));
  }
}

export const sysLogger = new StructuredLogger();

export class MetricsService {
  private static metrics: Record<string, number[]> = {};

  static recordLatency(metricName: string, durationMs: number) {
    if (!this.metrics[metricName]) this.metrics[metricName] = [];
    this.metrics[metricName].push(durationMs);
    // Keep last 1000 for memory safety
    if (this.metrics[metricName].length > 1000) {
      this.metrics[metricName].shift();
    }
  }

  static getAverage(metricName: string): number {
    const data = this.metrics[metricName];
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return Math.round(sum / data.length);
  }

  static incrementCounter(metricName: string) {
    if (!this.metrics[metricName]) this.metrics[metricName] = [0];
    this.metrics[metricName][0]++;
  }

  static getCounter(metricName: string): number {
    return this.metrics[metricName]?.[0] || 0;
  }
}
