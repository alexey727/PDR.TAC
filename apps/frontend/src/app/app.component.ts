import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ToastContainerComponent } from './shared/toast/toast-container.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {}
