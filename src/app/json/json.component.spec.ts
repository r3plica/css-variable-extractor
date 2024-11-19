import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CssVariableStoreService } from '@store/css-variable-extractor.store';
import { FormErrorComponent } from '@components/index';

import { JsonComponent } from './json.component';
import { VariablesComponent } from '../core/components/variables/variables.component';
import { ResultsComponent } from '../core/components/results/results.component';
import { StepperComponent } from '../core/components/stepper/stepper.component';
import { JsonViewerComponent } from '../core/components/json-viewer/json-viewer.component';

describe('JsonComponent', () => {
  let component: JsonComponent;
  let fixture: ComponentFixture<JsonComponent>;
  let store: CssVariableStoreService;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormErrorComponent,
        VariablesComponent,
        ResultsComponent,
        StepperComponent,
        JsonViewerComponent,
        JsonComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JsonComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(CssVariableStoreService);
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should call clearInput on init', () => {
    // Assemble
    const clearSpy = jest.spyOn(store, 'clearInput');

    // Act
    component.ngOnInit();

    // Assert
    expect(clearSpy).toHaveBeenCalled();
  });

  it('should call parseCss when parseCss is invoked', () => {
    // Assemble
    const parseSpy = jest.spyOn(store, 'parseCss');

    // Act
    component.parseCss();

    // Assert
    expect(parseSpy).toHaveBeenCalled();
  });

  it('should call clearInput when clearInput is invoked', () => {
    // Assemble
    const clearSpy = jest.spyOn(store, 'clearInput');

    // Act
    component.clearInput();

    // Assert
    expect(clearSpy).toHaveBeenCalled();
  });

  it('should call handleFileInput when handleFileInput is invoked', () => {
    // Assemble
    const fileInputSpy = jest.spyOn(store, 'handleFileInput');

    // Act
    const event = new Event('change');
    component.handleFileInput(event);

    // Assert
    expect(fileInputSpy).toHaveBeenCalledWith(event);
  });

  it('should display the stepper component', () => {
    // Act
    fixture.detectChanges();
    const stepper = fixture.debugElement.query(By.directive(StepperComponent));

    // Assert
    expect(stepper).not.toBeNull();
  });

  it('should display the variables component', () => {
    // Assemble
    store.setState((state) => ({ ...state, activeStep: 1 }));

    // Act
    fixture.detectChanges();
    const variables = fixture.debugElement.query(
      By.directive(VariablesComponent),
    );

    // Assert
    expect(variables).not.toBeNull();
  });

  it('should display the results component', () => {
    // Assemble
    store.setState((state) => ({ ...state, activeStep: 2 }));

    // Act
    fixture.detectChanges();
    const results = fixture.debugElement.query(By.directive(ResultsComponent));

    // Assert
    expect(results).not.toBeNull();
  });

  it('should display the json viewer component', () => {
    // Act
    fixture.detectChanges();
    const jsonViewer = fixture.debugElement.query(
      By.directive(JsonViewerComponent),
    );

    // Assert
    expect(jsonViewer).not.toBeNull();
  });
});
