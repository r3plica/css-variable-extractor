import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ResultsComponent } from './results.component';
import { CssVariableStoreService } from '@store/css-variable-extractor.store';
import { ExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let store: CssVariableStoreService;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ResultsComponent, ExpansionPanelComponent],
      providers: [
        {
          provide: CssVariableStoreService,
          useValue: {
            viewModel$: of({
              customVariables: [{ name: 'color', value: 'red' }],
              cssForm: new FormGroup({
                fileName: new FormControl('custom-variables.json'),
              }),
              jsonItemCount: 2,
              currentItemIndex: 0,
            }),
            copyToClipboard: jest.fn(),
            exportToFile: jest.fn(),
            processNextItem: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
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

  it('should display parsed results', () => {
    // Act
    fixture.detectChanges();
    const preElement = fixture.debugElement.query(By.css('pre')).nativeElement;

    // Assert
    expect(preElement.textContent).toContain('"name": "color"');
    expect(preElement.textContent).toContain('"value": "red"');
  });

  it('should call copyToClipboard when the button is clicked', () => {
    // Act
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();

    // Assert
    expect(store.copyToClipboard).toHaveBeenCalled();
  });

  it('should call processNextItem when the button is clicked', () => {
    // Act
    const button = fixture.debugElement.queryAll(By.css('button'))[1]
      .nativeElement;
    button.click();

    // Assert
    expect(store.processNextItem).toHaveBeenCalled();
  });

  it('should call exportToFile when the form is submitted', () => {
    // Act
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();

    // Assert
    expect(store.exportToFile).toHaveBeenCalled();
  });
});
