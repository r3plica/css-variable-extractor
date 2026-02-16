import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';

export type InputExampleType = 'css' | 'json' | 'colors';

interface FormatExample {
  name: string;
  example: string;
}

@Component({
  selector: 'app-input-examples',
  standalone: true,
  imports: [CommonModule, ExpansionPanelComponent],
  templateUrl: './input-examples.component.html',
  styleUrl: './input-examples.component.scss',
})
export class InputExamplesComponent {
  @Input({ required: true }) type!: InputExampleType;

  private _cssExamples: FormatExample[] = [
    {
      name: 'Standard CSS',
      example: `.root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --text-color: #333333;
  background-color: var(--primary-color);
}`,
    },
  ];

  private _jsonExamples: FormatExample[] = [
    {
      name: 'JSON with CSS properties',
      example: `{
  "themes": [
    {
      "name": "light",
      "css": ".root { --primary: #fff; }"
    }
  ]
}`,
    },
  ];

  private _colorsExamples: FormatExample[] = [
    {
      name: 'JSON Array',
      example: `[
  { "name": "--primary", "value": "#3498db" },
  { "name": "--secondary", "value": "#2ecc71" }
]`,
    },
    {
      name: 'Key-Value Pairs',
      example: `primary: #3498db,
secondary: #2ecc71,
accent: #e74c3c`,
    },
    {
      name: 'CSS Variables',
      example: `--primary: #3498db;
--secondary: #2ecc71;
--accent: #e74c3c;`,
    },
    {
      name: 'Space-Separated',
      example: `--primary 3498db
--secondary 2ecc71
--accent e74c3c`,
    },
  ];

  get examples(): FormatExample[] {
    switch (this.type) {
      case 'css':
        return this._cssExamples;
      case 'json':
        return this._jsonExamples;
      case 'colors':
        return this._colorsExamples;
      default:
        return [];
    }
  }

  get title(): string {
    switch (this.type) {
      case 'css':
        return 'CSS Input Examples';
      case 'json':
        return 'JSON Input Examples';
      case 'colors':
        return 'Supported Input Formats';
      default:
        return 'Input Examples';
    }
  }
}
