import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { User, UserDraft } from '@pdr/shared';

const API_BASE_URL = '/api/users';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<User[]> {
    return this.http.get<User[]>(API_BASE_URL);
  }

  findById(id: number): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/${id}`);
  }

  create(payload: UserDraft): Observable<User> {
    return this.http.post<User>(API_BASE_URL, payload);
  }

  update(id: number, payload: UserDraft): Observable<User> {
    return this.http.put<User>(`${API_BASE_URL}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/${id}`);
  }
}
