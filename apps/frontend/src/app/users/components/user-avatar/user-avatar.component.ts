import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

const DEFAULT_VARIANT = 'adventurer-neutral';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  @Input() name = '';
  @Input() email = '';
  @Input() size = 40;
  @Input() variant: string = DEFAULT_VARIANT;

  get altText(): string {
    if (this.name) {
      return `${this.name}'s avatar`;
    }
    if (this.email) {
      return `${this.email}'s avatar`;
    }
    return 'User avatar';
  }

  get avatarUrl(): string {
    const seedSource = (this.email || this.name || 'guest').trim().toLowerCase();
    const seed = encodeURIComponent(seedSource || 'guest');
    const size = Math.max(32, Math.round(this.size * 4));
    return `https://api.dicebear.com/9.x/${this.variant}/svg?seed=${seed}&size=${size}&radius=50`;
  }
}
