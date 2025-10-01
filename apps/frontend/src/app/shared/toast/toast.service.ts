import { Injectable, computed, signal } from '@angular/core';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

interface ToastConfig {
  duration?: number;
  icon?: string;
  variant?: ToastVariant;
}

export interface Toast extends Required<Omit<ToastConfig, 'duration'>> {
  id: number;
  message: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  private readonly counter = signal(0);
  private readonly timeouts = new Map<number, ReturnType<typeof setTimeout>>();

  readonly toasts = computed(() => this.toastsSignal());

  show(message: string, config: ToastConfig = {}): number {
    const duration = config.duration ?? 3200;
    const variant = config.variant ?? 'info';
    const icon = config.icon ?? this.defaultIconFor(variant);

    const id = this.counter() + 1;
    this.counter.set(id);
    const toast: Toast = {
      id,
      message,
      icon,
      variant,
      createdAt: Date.now(),
    };

    this.toastsSignal.update((items) => [...items, toast]);

    if (duration > 0) {
      const handle = setTimeout(() => this.dismiss(id), duration);
      this.timeouts.set(id, handle);
    }

    return id;
  }

  dismiss(id: number): void {
    const handle = this.timeouts.get(id);
    if (handle) {
      clearTimeout(handle);
      this.timeouts.delete(id);
    }

    this.toastsSignal.update((items) => items.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.timeouts.forEach((handle) => clearTimeout(handle));
    this.timeouts.clear();
    this.toastsSignal.set([]);
  }

  private defaultIconFor(variant: ToastVariant): string {
    switch (variant) {
      case 'success':
        return '🎉';
      case 'warning':
        return '⚠️';
      case 'error':
        return '💥';
      default:
        return 'ℹ️';
    }
  }
}
