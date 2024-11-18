import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { JsonViewerComponent } from './json-viewer.component';
import { CssVariableStoreService } from '@store/css-variable-extractor.store';
import { of } from 'rxjs';

describe('JsonViewerComponent', () => {
  let component: JsonViewerComponent;
  let fixture: ComponentFixture<JsonViewerComponent>;
  let store: CssVariableStoreService;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, JsonViewerComponent],
      providers: [
        {
          provide: CssVariableStoreService,
          useValue: {
            viewModel$: of({
              currentItemIndex: 0,
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JsonViewerComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(CssVariableStoreService);

    component.form = new FormGroup({
      jsonInput: new FormControl([
        { id: 1, name: 'Example 1', css: 'body { color: red; }' },
        { id: 2, name: 'Example 2', css: 'body { color: blue; }' },
      ]),
      xpath: new FormControl(''),
    });
    component.controlName = 'xpath';
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should format JSON correctly', () => {
    // Act
    const json = [{ id: 1, name: 'Example 1', css: 'body { color: red; }' }];
    const formattedJson = component.formatJson(json);

    // Assert
    expect(formattedJson).toContain('"id": 1');
    expect(formattedJson).toContain('"name": "Example 1"');
    expect(formattedJson).toContain('"css": "body { color: red; }"');
  });

  it('should get object keys correctly', () => {
    // Act
    const keys = component.getObjectKeys({ id: 1, name: 'Example 1' });

    // Assert
    expect(keys).toEqual(['id', 'name']);
  });

  it('should format JSON value correctly', () => {
    // Act
    const value = 'This is a long string that should be truncated.';
    const formattedValue = component.formatJsonValue(value);

    // Assert
    expect(formattedValue).toBe(
      'This is a long string that should be trunc...'
    );
  });

  it('should populate XPath correctly', () => {
    // Act
    component.populateXPath('id');
    fixture.detectChanges();

    // Assert
    expect(component.form.get('xpath')?.value).toBe('id');
  });

  it('should display JSON keys and values correctly', () => {
    // Act
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const keys = compiled.querySelectorAll('a');

    // Assert
    expect(keys.length).toBe(3);
    expect(keys[0].textContent).toContain('id');
    expect(keys[1].textContent).toContain('name');
    expect(keys[2].textContent).toContain('css');
  });

  it('should call populateXPath when a key is clicked', () => {
    // Act
    spyOn(component, 'populateXPath');
    fixture.detectChanges();
    const keyElement = fixture.debugElement.query(By.css('a')).nativeElement;
    keyElement.click();

    // Assert
    expect(component.populateXPath).toHaveBeenCalledWith('id');
  });
});
