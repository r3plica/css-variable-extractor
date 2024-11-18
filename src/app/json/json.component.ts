import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CssVariableStoreService } from '@store/css-variable-extractor.store';

@Component({
  templateUrl: './json.component.html',
  styleUrls: ['./json.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class JsonComponent {
  private _store = inject(CssVariableStoreService);

  public viewModel$ = this._store.viewModel$;

  public setStep(step: number): void {
    this._store.setStep(step);
  }

  public parseCss(): void {
    this._store.parseCss();
  }

  public clearInput(): void {
    this._store.clearInput();
  }

  public exportVariables(): void {
    this._store.exportVariables();
  }

  public copyToClipboard(): void {
    this._store.copyToClipboard();
  }

  public exportToFile(): void {
    this._store.exportToFile();
  }

  public handleFileInput(event: Event): void {
    this._store.handleFileInput(event);
  }

  public processNextItem(): void {
    this._store.processNextItem();
  }

  public formatJson(json: any): string {
    if (Array.isArray(json)) json = json[0];
    const formattedJson = JSON.stringify(
      json,
      (_, value) =>
        typeof value === 'string' && value.length > 50
          ? value.substring(0, 50) + '...'
          : value,
      2
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

  public populateXPath(form: FormGroup, key: string): void {
    form.get('xpath')?.setValue(key);
  }
}
