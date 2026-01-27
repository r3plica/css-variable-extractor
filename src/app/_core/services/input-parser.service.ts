import { Injectable } from '@angular/core';

import { CssVariable } from '@models';

export type InputFormat = 'json' | 'key-value' | 'css' | 'space-separated' | 'unknown';

@Injectable({
  providedIn: 'root',
})
export class InputParserService {
  public parse(input: string): CssVariable[] {
    const trimmedInput = input.trim();
    if (!trimmedInput) return [];

    const format = this.detectFormat(trimmedInput);

    switch (format) {
      case 'json':
        return this._parseJson(trimmedInput);
      case 'css':
        return this._parseCss(trimmedInput);
      case 'key-value':
        return this._parseKeyValue(trimmedInput);
      case 'space-separated':
        return this._parseSpaceSeparated(trimmedInput);
      default:
        return [];
    }
  }

  public detectFormat(input: string): InputFormat {
    const trimmed = input.trim();

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) return 'json';
    if (/--[\w-]+\s*:/.test(trimmed)) return 'css';
    if (/[\w-]+\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\s*\()/i.test(trimmed)) return 'key-value';
    if (/--[\w-]+\s+[0-9a-fA-F]{3,8}\b/.test(trimmed)) return 'space-separated';

    return 'unknown';
  }

  private _parseJson(input: string): CssVariable[] {
    try {
      const parsed = JSON.parse(input);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      return items
        .filter((item) => item && typeof item === 'object' && item.name && item.value)
        .map((item) => this._normalizeVariable(item.name, item.value));
    } catch {
      return [];
    }
  }

  private _parseCss(input: string): CssVariable[] {
    const variables: CssVariable[] = [];
    const lines = input.split(/[;\n]/).filter((line) => line.trim());

    for (const line of lines) {
      const match = line.match(/(--[\w-]+)\s*:\s*(.+)/);
      if (match) {
        const [, name, value] = match;
        variables.push(this._normalizeVariable(name, value.trim()));
      }
    }

    return variables;
  }

  private _parseKeyValue(input: string): CssVariable[] {
    const variables: CssVariable[] = [];
    const regex = /([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\s*\([^)]+\))/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
      const [, name, value] = match;
      variables.push(this._normalizeVariable(name, value.trim()));
    }

    return variables;
  }

  private _parseSpaceSeparated(input: string): CssVariable[] {
    const variables: CssVariable[] = [];
    const lines = input.split(/\n/).filter((line) => line.trim());

    for (const line of lines) {
      const match = line.trim().match(/^(--[\w-]+)\s+([0-9a-fA-F]{3,8})$/);
      if (match) {
        const [, name, value] = match;
        variables.push(this._normalizeVariable(name, `#${value}`));
      }
    }

    return variables;
  }

  private _normalizeVariable(name: string, value: string): CssVariable {
    let normalizedName = name.trim().toLowerCase();

    if (!normalizedName.startsWith('--')) {
      normalizedName = `--${normalizedName}`;
    }

    return {
      name: normalizedName,
      value: value.trim(),
    };
  }
}
