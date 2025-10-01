import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserApiService } from '../../data-access/user-api.service';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import { UserDialogComponent } from '../../components/user-dialog/user-dialog.component';
import type { User, UserDraft } from '@pdr/shared';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    UserTableComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent {
  private readonly api = inject(UserApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

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
        error: () => this.snackbar.open('Failed to load users', 'Dismiss'),
      });
  }

  openDetails(user: User): void {
    this.dialog.open(UserDialogComponent, {
      data: { userId: user.id },
      autoFocus: false,
      width: '480px',
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
            this.snackbar.open('User deleted', 'Close', { duration: 2000 });
          }
        },
        error: () => this.snackbar.open('Unable to delete user', 'Dismiss'),
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
            this.snackbar.open('Unable to update user: missing identifier', 'Dismiss', {
              duration: 3000,
            });
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

          const message = payload.action === 'created' ? 'User created' : 'User updated';
          this.snackbar.open(message, 'Close', { duration: 2000 });
        },
        error: () => this.snackbar.open('Unable to save user', 'Dismiss'),
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
