import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-smiley',
  standalone: true,
  templateUrl: './smiley.component.html',
  styleUrl: './smiley.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmileyComponent {}
