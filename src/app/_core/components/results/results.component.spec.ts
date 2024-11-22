import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CssVariableExtractorStore } from '@store';

import { ResultsComponent } from './results.component';
import { ExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let store: CssVariableExtractorStore;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ResultsComponent, ExpansionPanelComponent],
      providers: [CssVariableExtractorStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(CssVariableExtractorStore);
    fixture.detectChanges();
  });

  beforeEach(() => {
    store.setState((state) => ({
      ...state,
      customVariables: [{ name: 'color', value: 'red' }],
      cssForm: new FormGroup({
        fileName: new FormControl('custom-variables.json'),
      }),
      jsonItemCount: 2,
      currentItemIndex: 0,
    }));
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should display parsed results', () => {
    // Assemble
    store.setState((state) => ({
      ...state,
      customVariables: [{ name: '--color', value: 'red' }],
    }));

    // Act
    fixture.detectChanges();
    const expansionButton = fixture.debugElement.query(
      By.css('app-expansion-panel button'),
    );
    expansionButton.nativeElement.click();
    fixture.detectChanges();

    // Query the <pre> element
    const preElement = fixture.debugElement.query(By.css('pre'))?.nativeElement;

    // Assert
    expect(preElement.textContent).toContain('"name": "--color"');
    expect(preElement.textContent).toContain('"value": "red"');
  });

  it('should call copyToClipboard when the button is clicked', () => {
    // Assemble
    const clipboardSpy = jest.spyOn(store, 'copyToClipboard');

    // Act
    const button = fixture.debugElement.query(
      By.css('#copyToClipboard'),
    ).nativeElement;
    button.click();

    // Assert
    expect(clipboardSpy).toHaveBeenCalled();
  });

  it('should call exportToFile when the form is submitted', () => {
    // Assemble
    const exportSpy = jest.spyOn(store, 'export');

    // Act
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();

    // Assert
    expect(exportSpy).toHaveBeenCalled();
  });
});
