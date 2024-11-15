import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { CssVariableExtractorService } from './css-variable-extractor.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private fb = inject(FormBuilder);
  private cssVariableExtractorService = inject(CssVariableExtractorService);

  public cssForm: FormGroup;
  public activeTab: 'cssInput' | 'results' = 'cssInput';
  public resultsAvailable: boolean = false;
  public parsedResults: any[] = [];

  constructor() {
    this.cssForm = this.fb.group({
      cssInput: [''],
    });
  }

  public parseCss(): void {
    const cssInput = this.cssForm.get('cssInput')?.value.trim();
    if (cssInput) {
      console.log('Parsing CSS:', cssInput);
      const result =
        this.cssVariableExtractorService.convertToCssVariables(cssInput);
      console.log(result);
      this.parsedResults = result.variables;
      this.resultsAvailable = true;
      this.activeTab = 'results';
    } else {
      alert('Please enter some CSS before parsing!');
    }
  }

  public clearInput(): void {
    this.cssForm.reset();
    this.resultsAvailable = false;
    this.activeTab = 'cssInput';
    this.parsedResults = [];
  }

  switchTab(tab: 'cssInput' | 'results'): void {
    if (tab === 'results' && !this.resultsAvailable) {
      return;
    }
    this.activeTab = tab;
  }
}
