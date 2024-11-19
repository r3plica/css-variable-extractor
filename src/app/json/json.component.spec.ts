import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
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
      providers: [
        {
          provide: CssVariableStoreService,
          useValue: {
            viewModel$: of({
              activeStep: 0,
              currentItemIndex: 0,
              jsonItemCount: 3,
            }),
            clearInput: jest.fn(),
            parseCss: jest.fn(),
            handleFileInput: jest.fn(),
          },
        },
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
    // Act
    component.ngOnInit();

    // Assert
    expect(store.clearInput).toHaveBeenCalled();
  });

  it('should call parseCss when parseCss is invoked', () => {
    // Act
    component.parseCss();

    // Assert
    expect(store.parseCss).toHaveBeenCalled();
  });

  it('should call clearInput when clearInput is invoked', () => {
    // Act
    component.clearInput();

    // Assert
    expect(store.clearInput).toHaveBeenCalled();
  });

  it('should call handleFileInput when handleFileInput is invoked', () => {
    // Act
    const event = new Event('change');
    component.handleFileInput(event);

    // Assert
    expect(store.handleFileInput).toHaveBeenCalledWith(event);
  });

  it('should display the stepper component', () => {
    // Act
    fixture.detectChanges();
    const stepper = fixture.debugElement.query(By.directive(StepperComponent));

    // Assert
    expect(stepper).not.toBeNull();
  });

  it('should display the variables component', () => {
    // Act
    fixture.detectChanges();
    const variables = fixture.debugElement.query(
      By.directive(VariablesComponent),
    );

    // Assert
    expect(variables).not.toBeNull();
  });

  it('should display the results component', () => {
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
