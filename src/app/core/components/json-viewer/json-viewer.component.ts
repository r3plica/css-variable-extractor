/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CssVariableStoreService } from '@store/css-variable-extractor.store';

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './json-viewer.component.html',
  styleUrl: './json-viewer.component.scss',
})
export class JsonViewerComponent {
  private _store = inject(CssVariableStoreService);

  public viewModel$ = this._store.viewModel$;

  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) controlName!: string;

  public formatJson(json: any): string {
    if (Array.isArray(json)) json = json[0];
    const formattedJson = JSON.stringify(
      json,
      (_, value) =>
        typeof value === 'string' && value.length > 50
          ? value.substring(0, 50) + '...'
          : value,
      2,
    );
    return formattedJson;
  }

  public getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  public formatJsonValue(value: any): string {
    if (typeof value === 'string' && value.length > 50)
      return value.substring(0, 50) + '...';
    return JSON.stringify(value, null, 2);
  }

  public populateXPath(key: string): void {
    this.form.get(this.controlName)?.setValue(key);
  }
}
