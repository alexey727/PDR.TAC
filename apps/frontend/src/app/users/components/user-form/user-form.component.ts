import { ChangeDetectionStrategy, Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { JsonPipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { userRoles, createUserSchema, UserDraft } from '@pdr/shared';
import type { ZodError } from 'zod';

interface DialogPayload {
  preset?: Partial<UserDraft>;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    NgIf,
    NgFor,
    TitleCasePipe,
    JsonPipe,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserFormComponent, UserDraft | undefined>);

  constructor(@Inject(MAT_DIALOG_DATA) private readonly payload: DialogPayload | null) {}

  readonly roles = userRoles;
  validationError: ZodError | null = null;

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    birthDate: [null as Date | null],
    role: this.fb.nonNullable.control<UserDraft['role']>('viewer', Validators.required),
  });

  ngOnInit(): void {
    if (this.payload?.preset) {
      const { birthDate, ...rest } = this.payload.preset;
      const patch: Partial<typeof this.form.value> = {
        ...rest,
      };

      if (birthDate) {
        const parsedBirthDate = new Date(birthDate);
        if (!Number.isNaN(parsedBirthDate.getTime())) {
          patch.birthDate = parsedBirthDate;
        }
      }

      this.form.patchValue(patch);
    }
  }

  submit(): void {
    const raw = this.form.getRawValue();
    const payload: UserDraft = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phoneNumber: raw.phoneNumber || undefined,
      birthDate: raw.birthDate ? raw.birthDate.toISOString().slice(0, 10) : undefined,
      role: raw.role,
    };

    const result = createUserSchema.safeParse(payload);

    if (!result.success) {
      this.validationError = result.error;
      return;
    }

    this.dialogRef.close(result.data);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
