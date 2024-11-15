import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableExtractorService } from './css-variable-extractor.service';
import { LayoutComponent } from './layout.component';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let cssVariableExtractorService: CssVariableExtractorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayoutComponent],
      imports: [ReactiveFormsModule],
      providers: [CssVariableExtractorService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    cssVariableExtractorService = TestBed.inject(CssVariableExtractorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.cssForm).toBeDefined();
    expect(component.activeTab).toBe('cssInput');
    expect(component.resultsAvailable).toBe(false);
    expect(component.parsedResults).toBe('');
  });

  it('should parse CSS input and update results', () => {
    const cssInput = 'body { color: red; }';
    const parsedResult = {
      variables: [],
      updatedCss: 'body { color: var(--body-color); }',
    };
    jest
      .spyOn(cssVariableExtractorService, 'convertToCssVariables')
      .mockReturnValue(parsedResult);

    component.cssForm.setValue({ cssInput });
    component.parseCss();

    expect(
      cssVariableExtractorService.convertToCssVariables
    ).toHaveBeenCalledWith(cssInput);
    expect(component.parsedResults).toBe(
      `Parsed CSS:\n${parsedResult.updatedCss}`
    );
    expect(component.resultsAvailable).toBe(true);
    expect(component.activeTab).toBe('results');
  });

  it('should alert if CSS input is empty', () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.cssForm.setValue({ cssInput: '' });
    component.parseCss();
    expect(window.alert).toHaveBeenCalledWith(
      'Please enter some CSS before parsing!'
    );
  });

  it('should clear input and reset state', () => {
    component.cssForm.setValue({ cssInput: 'body { color: red; }' });
    component.parseCss();
    component.clearInput();
    expect(component.cssForm.get('cssInput')?.value).toBe(null);
    expect(component.resultsAvailable).toBe(false);
    expect(component.activeTab).toBe('cssInput');
    expect(component.parsedResults).toBe('');
  });

  it('should switch tabs correctly', () => {
    component.switchTab('results');
    expect(component.activeTab).toBe('cssInput'); // Should not switch because results are not available

    component.cssForm.setValue({ cssInput: 'body { color: red; }' });
    component.parseCss();
    component.switchTab('results');
    expect(component.activeTab).toBe('results'); // Should switch because results are available

    component.switchTab('cssInput');
    expect(component.activeTab).toBe('cssInput'); // Should switch back to cssInput
  });
});
