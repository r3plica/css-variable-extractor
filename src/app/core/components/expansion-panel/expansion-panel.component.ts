import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expansion-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expansion-panel.component.html',
  styleUrl: './expansion-panel.component.scss',
})
export class ExpansionPanelComponent {
  public isOpen = false;

  @Input({ required: true }) title!: string;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
