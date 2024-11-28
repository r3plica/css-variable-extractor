import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorsComponent } from './colors.component';
import { ColorsComponentStore } from './colors.component.store';

describe('ColorsComponent', () => {
  let component: ColorsComponent;
  let fixture: ComponentFixture<ColorsComponent>;
  let store: ColorsComponentStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorsComponent],
      providers: [ColorsComponentStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorsComponent);
    component = fixture.componentInstance;
    store = component['_store'];
    fixture.detectChanges();
  });

  it('should create', () => {
    const compiled = fixture.nativeElement;
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should call clearInput and setStep on init', () => {
    const clearSpy = jest.spyOn(store, 'clearInput');
    const setStepSpy = jest.spyOn(store, 'setStep');

    component.ngOnInit();

    expect(clearSpy).toHaveBeenCalled();
    expect(setStepSpy).toHaveBeenCalledWith(0);
  });

  it('should call parseVariables when parseVariables is invoked', () => {
    const parseSpy = jest.spyOn(store, 'parseVariables');

    component.parseVariables();

    expect(parseSpy).toHaveBeenCalled();
  });

  it('should call copyToClipboard when copyToClipboard is invoked', () => {
    const copySpy = jest.spyOn(store, 'copyToClipboard');

    component.copyToClipboard();

    expect(copySpy).toHaveBeenCalled();
  });

  it('should call exportToFile when exportToFile is invoked', () => {
    const exportSpy = jest.spyOn(store, 'exportToFile');

    component.exportToFile();

    expect(exportSpy).toHaveBeenCalled();
  });

  it('should call clearInput when clearInput is invoked', () => {
    const clearSpy = jest.spyOn(store, 'clearInput');

    component.clearInput();

    expect(clearSpy).toHaveBeenCalled();
  });
});
