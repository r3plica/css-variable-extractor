import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { InputExamplesComponent } from './input-examples.component';

describe('InputExamplesComponent', () => {
  let component: InputExamplesComponent;
  let fixture: ComponentFixture<InputExamplesComponent>;

  beforeEach(async () => {
    // Assemble
    await TestBed.configureTestingModule({
      imports: [InputExamplesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputExamplesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Assemble
    component.type = 'css';
    fixture.detectChanges();

    // Assert
    expect(component).toBeTruthy();
  });

  describe('CSS type', () => {
    beforeEach(() => {
      // Assemble
      component.type = 'css';
      fixture.detectChanges();
    });

    it('should return CSS examples', () => {
      // Assert
      expect(component.examples.length).toBeGreaterThan(0);
      expect(component.examples[0].name).toBe('Standard CSS');
    });

    it('should return correct title', () => {
      // Assert
      expect(component.title).toBe('CSS Input Examples');
    });

    it('should render expansion panel with correct title', () => {
      // Act
      const panel = fixture.debugElement.query(By.css('app-expansion-panel'));

      // Assert
      expect(panel).toBeTruthy();
      expect(panel.attributes['ng-reflect-title']).toBe('CSS Input Examples');
    });
  });

  describe('JSON type', () => {
    beforeEach(() => {
      // Assemble
      component.type = 'json';
      fixture.detectChanges();
    });

    it('should return JSON examples', () => {
      // Assert
      expect(component.examples.length).toBeGreaterThan(0);
      expect(component.examples[0].name).toBe('JSON with CSS properties');
    });

    it('should return correct title', () => {
      // Assert
      expect(component.title).toBe('JSON Input Examples');
    });
  });

  describe('Colors type', () => {
    beforeEach(() => {
      // Assemble
      component.type = 'colors';
      fixture.detectChanges();
    });

    it('should return colors examples with multiple formats', () => {
      // Assert
      expect(component.examples.length).toBe(4);
    });

    it('should include JSON Array format', () => {
      // Assert
      const jsonArrayExample = component.examples.find(
        (e) => e.name === 'JSON Array',
      );
      expect(jsonArrayExample).toBeTruthy();
    });

    it('should include Key-Value Pairs format', () => {
      // Assert
      const keyValueExample = component.examples.find(
        (e) => e.name === 'Key-Value Pairs',
      );
      expect(keyValueExample).toBeTruthy();
    });

    it('should include CSS Variables format', () => {
      // Assert
      const cssVarExample = component.examples.find(
        (e) => e.name === 'CSS Variables',
      );
      expect(cssVarExample).toBeTruthy();
    });

    it('should include Space-Separated format', () => {
      // Assert
      const spaceSepExample = component.examples.find(
        (e) => e.name === 'Space-Separated',
      );
      expect(spaceSepExample).toBeTruthy();
    });

    it('should return correct title', () => {
      // Assert
      expect(component.title).toBe('Supported Input Formats');
    });
  });
});
