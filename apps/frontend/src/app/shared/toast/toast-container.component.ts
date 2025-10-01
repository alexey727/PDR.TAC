import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService, Toast } from './toast.service';

@Component({
  standalone: true,
  selector: 'app-toast-container',
  imports: [NgFor],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(24px)', opacity: 0 }),
        animate(
          '280ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate('220ms ease-in', style({ transform: 'translateY(24px)', opacity: 0 }))
      ]),
    ]),
  ],
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  trackById = (_: number, item: Toast) => item.id;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
