import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AsyncPipe, NgIf } from '@angular/common';
import { UserApiService } from '../../data-access/user-api.service';
import type { User } from '@pdr/shared';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';

interface DialogData {
  userId: number;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, AsyncPipe, NgIf],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDialogComponent implements OnInit {
  private readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  private readonly api = inject(UserApiService);

  user$!: Observable<User | null>;

  ngOnInit(): void {
    this.user$ = this.api.findById(this.data.userId).pipe(catchError(() => of(null)));
  }
}
