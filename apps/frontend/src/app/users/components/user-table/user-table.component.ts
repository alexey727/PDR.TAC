import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import type { User, UserRole } from '@pdr/shared';
import { userRoles } from '@pdr/shared';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TitleCasePipe,
  ],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTableComponent {
  @Input({ required: true }) users: User[] = [];
  @Input() loading = false;
  @Input() pageSize = 25;
  @Output() viewDetails = new EventEmitter<User>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() editUser = new EventEmitter<User>();
  @Output() deleteUser = new EventEmitter<User>();

  displayedColumns = ['id', 'name', 'email', 'role', 'actions'];
  pageIndex = 0;
  private readonly destroyRef = inject(DestroyRef);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly roleControl = new FormControl<'all' | UserRole>('all', { nonNullable: true });
  readonly roleOptions: Array<'all' | UserRole> = ['all', ...userRoles];
  private searchTerm = '';
  private selectedRole: 'all' | UserRole = 'all';
  sortState: Sort = { active: 'id', direction: 'asc' };

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.searchTerm = value.trim().toLowerCase();
        this.pageIndex = 0;
      });

    this.roleControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.selectedRole = value;
        this.pageIndex = 0;
      });
  }

  onRowClick(user: User): void {
    this.viewDetails.emit(user);
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pageChange.emit(event);
  }

  onSortChange(sort: Sort): void {
    this.sortState = sort.direction ? sort : { active: sort.active, direction: '' };
    this.pageIndex = 0;
  }

  onEdit(user: User, event: MouseEvent): void {
    event.stopPropagation();
    this.editUser.emit(user);
  }

  onDelete(user: User, event: MouseEvent): void {
    event.stopPropagation();
    this.deleteUser.emit(user);
  }

  get filteredUsers(): User[] {
    const filtered = this.users.filter((user) => this.matchesFilters(user));
    return this.applySort(filtered);
  }

  get safePageIndex(): number {
    const total = this.filteredUsers.length;
    const lastIndex = total === 0 ? 0 : Math.max(0, Math.ceil(total / this.pageSize) - 1);
    return Math.min(this.pageIndex, lastIndex);
  }

  get paginatedUsers(): User[] {
    const filtered = this.filteredUsers;
    const index = this.safePageIndex;
    const start = index * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  private matchesFilters(user: User): boolean {
    const matchesSearch = this.searchTerm
      ? `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchTerm) ||
        user.email.toLowerCase().includes(this.searchTerm)
      : true;

    const matchesRole = this.selectedRole === 'all' ? true : user.role === this.selectedRole;

    return matchesSearch && matchesRole;
  }

  private applySort(list: User[]): User[] {
    const { active, direction } = this.sortState;
    if (!direction || !active) {
      return [...list];
    }

    const factor = direction === 'asc' ? 1 : -1;

    return [...list].sort((a, b) => {
      switch (active) {
        case 'id':
          return (a.id - b.id) * factor;
        case 'name': {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB) * factor;
        }
        case 'email':
          return a.email.toLowerCase().localeCompare(b.email.toLowerCase()) * factor;
        case 'role':
          return a.role.localeCompare(b.role) * factor;
        default:
          return 0;
      }
    });
  }
}
