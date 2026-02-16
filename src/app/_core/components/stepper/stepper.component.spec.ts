/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';

import { CssVariableExtractorStore } from '@store';

import { StepperComponent } from './stepper.component';

describe('StepperComponent', () => {
  let component: StepperComponent;
  let fixture: ComponentFixture<StepperComponent>;
  let store: CssVariableExtractorStore;
  let viewModel$: BehaviorSubject<any>;

  const createViewModel = (overrides: Partial<any> = {}) => ({
    activeStep: 1,
    currentItemIndex: 0,
    jsonItemCount: 3,
    cssForm: new FormBuilder().group({
      overrideVariableNames: [false],
      addDefaults: [false],
    }),
    ...overrides,
  });

  // Assemble
  beforeEach(async () => {
    viewModel$ = new BehaviorSubject(createViewModel());

    await TestBed.configureTestingModule({
      imports: [StepperComponent],
      providers: [
        {
          provide: CssVariableExtractorStore,
          useValue: {
            viewModel$,
            setStep: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(CssVariableExtractorStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should display "Override variables names" when overrideVariableNames is true', () => {
    // Assemble
    viewModel$.next(createViewModel({
      cssForm: new FormBuilder().group({
        overrideVariableNames: [true],
        addDefaults: [false],
      }),
    }));
    fixture.detectChanges();

    // Act
    const stepTitle = fixture.debugElement.query(By.css('#step-2'))
      .nativeElement.textContent;

    // Assert
    expect(stepTitle).toContain('Override variables names');
  });

  it('should display "Variables to extract" when overrideVariableNames is false', () => {
    // Assemble
    viewModel$.next(createViewModel({
      cssForm: new FormBuilder().group({
        overrideVariableNames: [false],
        addDefaults: [false],
      }),
    }));
    fixture.detectChanges();

    // Act
    const stepTitle = fixture.debugElement.query(By.css('#step-2'))
      .nativeElement.textContent;

    // Assert
    expect(stepTitle).toContain('Variables to extract');
  });

  it('should render the "Defaults" step when addDefaults is true', () => {
    // Assemble
    viewModel$.next(createViewModel({
      activeStep: 2,
      cssForm: new FormBuilder().group({
        overrideVariableNames: [true],
        addDefaults: [true],
      }),
    }));
    fixture.detectChanges();

    // Act
    const stepTitle = fixture.debugElement.query(By.css('#step-3'))
      .nativeElement.textContent;

    // Assert
    expect(stepTitle).toContain('Defaults');
  });

  it('should not render the "Defaults" step when addDefaults is false', () => {
    // Assemble
    viewModel$.next(createViewModel({
      activeStep: 2,
      cssForm: new FormBuilder().group({
        overrideVariableNames: [true],
        addDefaults: [false],
      }),
    }));
    fixture.detectChanges();

    // Act
    const stepTitle = fixture.debugElement.query(By.css('#step-3'))
      .nativeElement.textContent;

    // Assert
    expect(stepTitle).toContain('Results');
  });

  it('should not call setStep if the step is not clickable', () => {
    // Act
    const stepElement = fixture.debugElement.query(
      By.css('#step-2'),
    ).nativeElement;
    stepElement.click();

    // Assert
    expect(store.setStep).not.toHaveBeenCalled();
  });

  it('should call setStep when a step is clicked', () => {
    // Act
    const stepElement = fixture.debugElement.query(
      By.css('#step-1'),
    ).nativeElement;
    stepElement.click();

    // Assert
    expect(store.setStep).toHaveBeenCalledWith(0);
  });
});
