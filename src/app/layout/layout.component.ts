import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import {
  CssVariable,
  CssVariableExtractorService,
} from './css-variable-extractor.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private _fb = inject(FormBuilder);
  private _cssVariableExtractorService = inject(CssVariableExtractorService);

  public cssForm: FormGroup;
  public exportForm!: FormGroup;
  public activeTab: 'cssInput' | 'results' | 'export' = 'cssInput';
  public resultsAvailable = false;
  public readyForExport = false;
  public extractedVariables!: CssVariable[];
  public customVariables!: CssVariable[];

  constructor() {
    this.cssForm = this._fb.group({
      cssInput: [''],
      mergeDuplicates: [true],
    });
  }

  public parseCss(): void {
    this.readyForExport = false;
    this.resultsAvailable = false;

    const cssInput = this.cssForm.get('cssInput')?.value.trim();
    const mergeDuplicates = this.cssForm.get('mergeDuplicates')?.value;
    if (!cssInput) return alert('Please enter some CSS before parsing!');

    this.readyForExport = true;
    this.switchTab('export');

    this.extractedVariables =
      this._cssVariableExtractorService.convertToCssVariables(
        cssInput,
        mergeDuplicates
      );
    this._initializeExportForm();
  }

  public clearInput(): void {
    this.cssForm.reset();
    this.readyForExport = false;
    this.resultsAvailable = false;
    this.activeTab = 'cssInput';
  }

  public switchTab(tab: 'cssInput' | 'results' | 'export'): void {
    if (tab === 'export' && !this.readyForExport) return;

    if (tab === 'results' && !this.resultsAvailable) return;

    this.activeTab = tab;
  }

  private _initializeExportForm(): void {
    this.exportForm = this._fb.group({});
    this.extractedVariables.forEach((variable, index) => {
      this.exportForm.addControl(`export-${index}`, new FormControl(true));
      this.exportForm.addControl(
        `name-${index}`,
        new FormControl(variable.name)
      );
      this.exportForm.addControl(
        `value-${index}`,
        new FormControl(variable.value)
      );
    });
  }

  public exportVariables(): void {
    console.log(this.exportForm.getRawValue());
    const exportedResults: CssVariable[] = [];

    this.extractedVariables.forEach((variable, index) => {
      const shouldExport = this.exportForm.get(`export-${index}`)?.value;
      if (!shouldExport) return;

      exportedResults.push({
        name: this.exportForm.get(`name-${index}`)?.value,
        value: this.exportForm.get(`value-${index}`)?.value,
      });
    });

    this.customVariables = exportedResults;
    this.resultsAvailable = true;
    this.switchTab('results');
  }
}
