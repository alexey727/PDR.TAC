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
import { switchMap, tap } from 'rxjs/operators';

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
    const { UserFormComponent } = await import(
      '../../components/user-form/user-form.component'
    );

    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '520px',
      autoFocus: false,
    });

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((result) => (result ? this.api.create(result as UserDraft) : of(null))),
        tap((payload) => {
          if (payload) {
            this.refresh();
          }
        })
      )
      .subscribe({
        next: (payload) => {
          if (payload) {
            this.snackbar.open('User created', 'Close', { duration: 2000 });
          }
        },
        error: () => this.snackbar.open('Unable to create user', 'Dismiss'),
      });
  }
}
