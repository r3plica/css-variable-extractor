import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CssVariableExtractorStoreService } from '@store';

import { VariablesComponent } from './variables.component';

describe('VariablesComponent', () => {
  let component: VariablesComponent;
  let fixture: ComponentFixture<VariablesComponent>;
  let store: CssVariableExtractorStoreService;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, VariablesComponent],
      providers: [CssVariableExtractorStoreService],
    }).compileComponents();

    fixture = TestBed.createComponent(VariablesComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(CssVariableExtractorStoreService);
    fixture.detectChanges();
  });

  beforeEach(() => {
    store.setState((state) => ({
      ...state,
      extractedVariables: [{ name: 'color', value: 'red' }],
      exportForm: new FormGroup({
        'export-0': new FormControl(true),
        'name-0': new FormControl('color'),
        'value-0': new FormControl('red'),
      }),
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

  it('should display the correct variable names', () => {
    // Act
    const variableNameInput = fixture.debugElement.query(
      By.css('.name-0'),
    ).nativeElement;

    // Assert
    expect(variableNameInput.value).toBe('color');
  });

  it('should call exportVariables when the form is submitted', () => {
    // Assemble
    const exportVariablesSpy = jest.spyOn(store, 'exportVariables');

    // Act
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();

    // Assert
    expect(exportVariablesSpy).toHaveBeenCalled();
  });

  it('should display the correct checkbox state', () => {
    // Act
    const checkbox = fixture.debugElement.query(
      By.css('.export-0'),
    ).nativeElement;

    // Assert
    expect(checkbox.checked).toBe(true);
  });
});
