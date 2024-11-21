import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShadingComponent } from './shading.component';

describe('ShadingComponent', () => {
  let component: ShadingComponent;
  let fixture: ComponentFixture<ShadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
