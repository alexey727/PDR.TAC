import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import type { User } from '@pdr/shared';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
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
  @Output() searchChange = new EventEmitter<string>();

  displayedColumns = ['id', 'name', 'email', 'role'];
  searchTerm = '';
  pageIndex = 0;

  onRowClick(user: User): void {
    this.viewDetails.emit(user);
  }

  onSearchChange(): void {
    this.searchChange.emit(this.searchTerm);
    this.pageIndex = 0;
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pageChange.emit(event);
  }

  get filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.users;
    }

    return this.users.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(term)
    );
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
}
