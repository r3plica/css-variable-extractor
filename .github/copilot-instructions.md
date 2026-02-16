# Project Overview

- Angular 18 standalone application using SCSS for styling
- State management with @ngrx/component-store
- TailwindCSS for utility-first CSS
- Jest for unit testing with jest-preset-angular

# Code Style & Conventions

## General

- Use early returns
- Use single line if statements where possible
- Prefix underscore for private variables (e.g., `_store`, `_colorService`)
- Use `inject()` function for dependency injection instead of constructor injection
- When making a suggestion only show the proposed changes

## TypeScript

- Strict mode enabled with `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Use path aliases: `@services`, `@models`, `@store`, `@directives`, `@components`
- Export types and interfaces from barrel files (index.ts)
- Use explicit return types on public methods
- Prefer `const` assertions and type inference where appropriate

## Angular Components

- All components are standalone (`standalone: true`)
- Use SCSS for component styles
- Component selector prefix: `app-`
- Use `inject()` for services, not constructor injection
- Template pattern: `*ngIf="viewModel$ | async as vm"` for consuming observables
- Public methods for template bindings, private methods prefixed with underscore
- Implement lifecycle interfaces explicitly (OnInit, OnDestroy)

## Component Structure

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, ...],
  providers: [ComponentStore], // if component has its own store
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent {
  private _store = inject(ExampleStore);

  public viewModel$ = this._store.viewModel$;

  public someAction(): void {
    this._store.someAction();
  }
}
```

## State Management (@ngrx/component-store)

- Component-level stores in `*.component.store.ts` files
- Global stores in `src/app/_core/store/`
- State interfaces defined at top of store file
- Use selectors for derived state: `readonly selector$ = this.select(...)`
- Use `updater` for synchronous state changes
- Use `effect` for side effects with `withLatestFrom` pattern
- Create a `viewModel$` selector combining all needed state
- Initialize forms in constructor, patch to state

## Store Pattern

```typescript
interface ExampleState {
  activeStep: number;
  form: FormGroup | undefined;
}

@Injectable()
export class ExampleStore extends ComponentStore<ExampleState> {
  private _service = inject(SomeService);

  constructor() {
    super({ activeStep: 0, form: undefined });
    // Initialize forms here
  }

  readonly activeStep$ = this.select((state) => state.activeStep);
  readonly form$ = this.select((state) => state.form);

  readonly viewModel$ = this.select(this.activeStep$, this.form$, (activeStep, form) => ({ activeStep, form }));

  readonly setStep = this.updater((state, step: number) => ({
    ...state,
    activeStep: step,
  }));
}
```

## Services

- Use `@Injectable({ providedIn: 'root' })` for singleton services
- Public methods first, then private methods
- Private helper methods prefixed with underscore
- Export from barrel file in `src/app/_core/services/index.ts`

## Models

- Define interfaces in `src/app/_core/models/`
- Export from barrel file
- Keep interfaces simple and focused

## Routing

- Use lazy loading with `loadChildren`: `loadChildren: () => import('./module').then((m) => m.Module)`
- Feature modules have their own routing modules

## Form Validation

- Custom validators as standalone functions in `*.const.ts` files
- Use `ValidatorFn` type for custom validators
- Form initialization in component stores

# Project Structure

```
src/app/
├── _core/
│   ├── components/     # Shared/reusable components
│   ├── directives/     # Custom directives
│   ├── models/         # TypeScript interfaces
│   ├── services/       # Global services
│   └── store/          # Global state management
├── feature/            # Feature modules (css/, json/, colors/, landing/)
│   ├── feature.component.ts
│   ├── feature.component.html
│   ├── feature.component.scss
│   ├── feature.component.spec.ts
│   ├── feature.component.store.ts
│   ├── feature.component.store.spec.ts
│   └── feature.module.ts
```

# Unit Testing

## General Rules

- Always read the entire test file when working with tests
- Use Assemble, Act, and Assert comments (not Arrange)
- Use Jest with TestBed
- Do not modify existing test files unless fixing a bug
- Cover 100% of all code
- Test file naming: `*.spec.ts`

## Test Structure

```typescript
describe("ComponentName", () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;
  let store: ComponentStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentName],
      providers: [ComponentStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
    store = component["_store"];
    fixture.detectChanges();
  });

  it("should create", () => {
    // Assert
    expect(component).toBeTruthy();
  });

  it("should do something", () => {
    // Assemble
    const spy = jest.spyOn(store, "someMethod");

    // Act
    component.someMethod();

    // Assert
    expect(spy).toHaveBeenCalled();
  });
});
```

## Service Tests

```typescript
describe("ServiceName", () => {
  let service: ServiceName;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServiceName],
    });
    service = TestBed.inject(ServiceName);
  });

  it("should be created", () => {
    // Assert
    expect(service).toBeTruthy();
  });
});
```

## Mocking

- Use `jest.spyOn()` for spying on methods
- Create mock objects for Router, ActivatedRoute with Subject for events
- Access private members using bracket notation: `component['_privateMethod']`

# Linting & Formatting

- ESLint with TypeScript, Jest, and import plugins
- Prettier for code formatting
- Import order: external packages first, then internal (`@services`, `@models`, etc.), then relative
- Unused imports are errors
- Newlines between import groups

# Import Order

```typescript
// 1. External packages (Angular, RxJS, third-party)
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { filter, tap } from "rxjs/operators";

// 2. Internal aliases
import { CssVariable } from "@models";
import { ColorService } from "@services";
import { CssVariableExtractorStore } from "@store";

// 3. Relative imports
import { LocalComponent } from "./local.component";
```
