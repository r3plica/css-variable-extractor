import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CssVariableExtractorStoreService } from '@store';

interface JsonObject {
  [key: string]: string | number | boolean | JsonObject | JsonObject[];
}

@Component({
  selector: 'app-json-viewer',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './json-viewer.component.html',
  styleUrls: ['./json-viewer.component.scss'],
})
export class JsonViewerComponent {
  private readonly _store = inject(CssVariableExtractorStoreService);
  public readonly viewModel$ = this._store.viewModel$;

  @Input() public form!: FormGroup;
  @Input() public controlName!: string;

  private formatLongString(value: string): string {
    return value.length > 50 ? value.substring(0, 50) + '...' : value;
  }

  public formatJson(json: JsonObject | JsonObject[]): string {
    if (Array.isArray(json)) json = json[0];

    return JSON.stringify(
      json,
      (_, value) =>
        typeof value === 'string' ? this.formatLongString(value) : value,
      2,
    );
  }

  public getObjectKeys(obj: JsonObject): string[] {
    return Object.keys(obj);
  }

  public formatJsonValue(
    value: string | number | boolean | JsonObject | JsonObject[],
  ): string {
    if (typeof value === 'string') {
      return this.formatLongString(value);
    }
    return JSON.stringify(value, null, 2);
  }

  public populateXPath(key: string): void {
    this.form.get(this.controlName)?.setValue(key ?? '');
  }
}
