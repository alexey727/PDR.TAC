import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserApiService } from '../../data-access/user-api.service';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import type { InlineUpdatePayload } from '../../components/user-table/user-table.component';
import { UserDialogComponent } from '../../components/user-dialog/user-dialog.component';
import type { User, UserDraft } from '@pdr/shared';
import { userRoles } from '@pdr/shared';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    UserTableComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent {
  private readonly api = inject(UserApiService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  readonly users = signal<User[]>([]);
  readonly loading = signal<boolean>(true);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.api
      .list()
      .pipe(tap(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.users.set(data),
        error: () => this.toast.show('💥 Failed to load users', { variant: 'error' }),
      });
  }

  openDetails(user: User): void {
    this.dialog.open(UserDialogComponent, {
      data: { userId: user.id },
      autoFocus: false,
      width: '480px',
    });
  }

  async createRandomUser(): Promise<void> {
    const { faker } = await import('@faker-js/faker');
    const role = faker.helpers.arrayElement(userRoles);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const birthDate = faker
      .date
      .birthdate({ min: 20, max: 60, mode: 'age' })
      .toISOString()
      .slice(0, 10);
    const phoneMaybe = faker.helpers.maybe(() => faker.phone.number(), {
      probability: role === 'viewer' ? 0.4 : 0.8,
    });

    const payload: UserDraft = {
      firstName,
      lastName,
      email,
      phoneNumber: phoneMaybe ?? undefined,
      birthDate,
      role,
    };

    this.loading.set(true);

    this.api.create(payload).subscribe({
      next: (created) => {
        this.toast.show(
          `🤖 Random user ${created.firstName} ${created.lastName} just spawned!`,
          { variant: 'success', duration: 2800 }
        );
        this.refresh();
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('💥 Unable to create random user', { variant: 'error' });
      },
    });
  }

  async createUser(): Promise<void> {
    await this.openUserForm('create');
  }

  async editUser(user: User): Promise<void> {
    await this.openUserForm('edit', user);
  }

  async deleteUser(user: User): Promise<void> {
    const { ConfirmDialogComponent } = await import(
      '../../components/confirm-dialog/confirm-dialog.component'
    );

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete user',
        message: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((confirmed) => {
          if (!confirmed) {
            return of(null);
          }

          return this.api.delete(user.id).pipe(map(() => 'deleted' as const));
        }),
        tap((result) => {
          if (result === 'deleted') {
            this.refresh();
          }
        })
      )
      .subscribe({
        next: (result) => {
          if (result === 'deleted') {
            this.toast.show('👋 User deleted. Farewell, friend!', { variant: 'warning', duration: 2600 });
          }
        },
        error: () => this.toast.show('💥 Unable to delete user', { variant: 'error' }),
      });
  }

  private async openUserForm(mode: 'create' | 'edit', user?: User): Promise<void> {
    const { UserFormComponent } = await import(
      '../../components/user-form/user-form.component'
    );

    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '520px',
      autoFocus: false,
      data: {
        mode,
        userId: user?.id,
        preset: user ? this.toDraft(user) : undefined,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((result) => {
          if (!result) {
            return of(null);
          }

          if (result.mode === 'create') {
            return this.api.create(result.data).pipe(
              map((created) => ({ user: created, action: 'created' as const }))
            );
          }

          if (!result.userId) {
            this.toast.show('💥 Unable to update user: missing identifier', { variant: 'error' });
            return of(null);
          }

          return this.api.update(result.userId, result.data).pipe(
            map((updated) => ({ user: updated, action: 'updated' as const }))
          );
        }),
        tap((payload) => {
          if (payload?.user) {
            this.refresh();
          }
        })
      )
      .subscribe({
        next: (payload) => {
          if (!payload?.user) {
            return;
          }

          const message =
            payload.action === 'created'
              ? `🎉 ${payload.user.firstName} ${payload.user.lastName} joined the crew!`
              : `🛠️ ${payload.user.firstName} ${payload.user.lastName}'s profile tuned up!`;
          const variant = payload.action === 'created' ? 'success' : 'info';
          this.toast.show(message, { variant, duration: 2600 });
        },
        error: () => this.toast.show('💥 Unable to save user', { variant: 'error' }),
      });
  }

  handleInlineUpdate(update: InlineUpdatePayload): void {
    const current = this.users().find((u) => u.id === update.id);

    if (!current) {
      this.toast.show('💥 Unable to update user inline (record missing)', {
        variant: 'error',
      });
      return;
    }

    const draft: UserDraft = { ...this.toDraft(current), ...update.changes };

    this.api.update(update.id, draft).subscribe({
      next: (updated) => {
        this.users.update((list) =>
          list.map((u) => (u.id === updated.id ? updated : u))
        );

        if (update.changes.email) {
          this.toast.show(
            `📧 ${updated.firstName} ${updated.lastName}'s email updated`,
            { variant: 'info', duration: 2400 }
          );
        } else if (update.changes.role) {
          this.toast.show(
            `🧭 ${updated.firstName} ${updated.lastName} is now ${updated.role.toUpperCase()}`,
            { variant: 'success', duration: 2400 }
          );
        }
      },
      error: () =>
        this.toast.show('💥 Unable to save inline changes', { variant: 'error' }),
    });
  }

  private toDraft(user: User): UserDraft {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber ?? undefined,
      birthDate: user.birthDate ?? undefined,
      role: user.role,
    };
  }
}
