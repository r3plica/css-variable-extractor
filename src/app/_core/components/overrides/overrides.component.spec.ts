import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CssVariableStoreService } from '@store';

import { OverridesComponent } from './overrides.component';

describe('OverridesComponent', () => {
  let component: OverridesComponent;
  let fixture: ComponentFixture<OverridesComponent>;
  let store: CssVariableStoreService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [CssVariableStoreService],
    }).compileComponents();

    fixture = TestBed.createComponent(OverridesComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(CssVariableStoreService);
    fixture.detectChanges();
  });

  beforeEach(() => {
    store.setState((state) => ({
      ...state,
      cssForm: new FormGroup({
        overrides: new FormControl(''),
      }),
    }));
    jest.spyOn(store, 'applyOverrides');
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should call applyOverrides method on form submit', () => {
    const applyOverridesSpy = jest.spyOn(component, 'applyOverrides');
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);
    expect(applyOverridesSpy).toHaveBeenCalled();
  });

  it('should call store service applyOverrides method when applyOverrides is called', () => {
    component.applyOverrides();
    expect(store.applyOverrides).toHaveBeenCalled();
  });

  it('should display the form with textarea', () => {
    const textarea = fixture.debugElement.query(By.css('textarea'));
    expect(textarea).toBeTruthy();
    expect(textarea.attributes['formControlName']).toBe('overrides');
  });

  it('should display the submit button', () => {
    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('Continue');
  });
});
