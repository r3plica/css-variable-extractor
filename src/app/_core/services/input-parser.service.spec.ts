import { TestBed } from '@angular/core/testing';

import { InputParserService } from './input-parser.service';

describe('InputParserService', () => {
  let service: InputParserService;

  beforeEach(() => {
    // Assemble
    TestBed.configureTestingModule({
      providers: [InputParserService],
    });
    service = TestBed.inject(InputParserService);
  });

  it('should be created', () => {
    // Assert
    expect(service).toBeTruthy();
  });

  describe('detectFormat', () => {
    it('should detect JSON array format', () => {
      // Assemble
      const input = '[{"name": "--color", "value": "#fff"}]';

      // Act
      const result = service.detectFormat(input);

      // Assert
      expect(result).toBe('json');
    });

    it('should detect JSON object format', () => {
      // Assemble
      const input = '{"name": "--color", "value": "#fff"}';

      // Act
      const result = service.detectFormat(input);

      // Assert
      expect(result).toBe('json');
    });

    it('should detect CSS variable format', () => {
      // Assemble
      const input = '--tru-menu: #192a67;';

      // Act
      const result = service.detectFormat(input);

      // Assert
      expect(result).toBe('css');
    });

    it('should detect key-value format', () => {
      // Assemble
      const input = 'tru-menu: #192a67';

      // Act
      const result = service.detectFormat(input);

      // Assert
      expect(result).toBe('key-value');
    });

    it('should detect space-separated format', () => {
      // Assemble
      const input = '--tru-menu 192a67';

      // Act
      const result = service.detectFormat(input);

      // Assert
      expect(result).toBe('space-separated');
    });

    it('should return unknown for invalid input', () => {
      // Assemble
      const input = 'just some random text';

      // Act
      const result = service.detectFormat(input);

      // Assert
      expect(result).toBe('unknown');
    });
  });

  describe('parse - JSON format', () => {
    it('should parse JSON array with name/value objects', () => {
      // Assemble
      const input = '[{"name": "--tru-menu", "value": "#192a67"}, {"name": "--tru-primary", "value": "#cd1719"}]';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ name: '--tru-menu', value: '#192a67' });
      expect(result[1]).toEqual({ name: '--tru-primary', value: '#cd1719' });
    });

    it('should parse single JSON object', () => {
      // Assemble
      const input = '{"name": "--tru-menu", "value": "#192a67"}';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ name: '--tru-menu', value: '#192a67' });
    });

    it('should normalize names without -- prefix in JSON', () => {
      // Assemble
      const input = '[{"name": "tru-menu", "value": "#192a67"}]';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result[0].name).toBe('--tru-menu');
    });

    it('should normalize uppercase names in JSON', () => {
      // Assemble
      const input = '[{"name": "Tru-Menu", "value": "#192a67"}]';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result[0].name).toBe('--tru-menu');
    });

    it('should return empty array for invalid JSON', () => {
      // Assemble
      const input = '[{"name": "invalid}';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result).toEqual([]);
    });

    it('should filter out objects without name or value', () => {
      // Assemble
      const input = '[{"name": "--color"}, {"value": "#fff"}, {"name": "--valid", "value": "#000"}]';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ name: '--valid', value: '#000' });
    });
  });

  describe('parse - Key-value format', () => {
    it('should parse comma-separated key-value pairs', () => {
      // Assemble
      const input = 'tru-menu: #192a67, Tru-on-menu: #FFFFFF, Tru-primary: #cd1719';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(3);
      expect(result[0]).toEqual({ name: '--tru-menu', value: '#192a67' });
      expect(result[1]).toEqual({ name: '--tru-on-menu', value: '#FFFFFF' });
      expect(result[2]).toEqual({ name: '--tru-primary', value: '#cd1719' });
    });

    it('should parse newline-separated key-value pairs', () => {
      // Assemble
      const input = `tru-menu: #192a67
Tru-on-menu: #FFFFFF
Tru-primary: #cd1719`;

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(3);
      expect(result[0]).toEqual({ name: '--tru-menu', value: '#192a67' });
      expect(result[1]).toEqual({ name: '--tru-on-menu', value: '#FFFFFF' });
      expect(result[2]).toEqual({ name: '--tru-primary', value: '#cd1719' });
    });

    it('should handle mixed comma and newline separators', () => {
      // Assemble
      const input = `tru-menu: #192a67,
Tru-on-menu: #FFFFFF
Tru-primary: #cd1719`;

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(3);
    });

    it('should normalize uppercase names to lowercase', () => {
      // Assemble
      const input = 'TRU-MENU: #192a67';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result[0].name).toBe('--tru-menu');
    });

    it('should add -- prefix if missing', () => {
      // Assemble
      const input = 'menu-color: #192a67';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result[0].name).toBe('--menu-color');
    });

    it('should handle extra whitespace', () => {
      // Assemble
      const input = '  tru-menu  :   #192a67  ,   tru-primary  :  #cd1719  ';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ name: '--tru-menu', value: '#192a67' });
      expect(result[1]).toEqual({ name: '--tru-primary', value: '#cd1719' });
    });

    it('should skip empty lines', () => {
      // Assemble
      const input = `tru-menu: #192a67

tru-primary: #cd1719`;

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(2);
    });
  });

  describe('parse - CSS variable format', () => {
    it('should parse CSS variable declarations with semicolons', () => {
      // Assemble
      const input = '--tru-menu: #192a67; --tru-primary: #cd1719;';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ name: '--tru-menu', value: '#192a67' });
      expect(result[1]).toEqual({ name: '--tru-primary', value: '#cd1719' });
    });

    it('should parse CSS variable declarations on multiple lines', () => {
      // Assemble
      const input = `--tru-menu: #192a67;
--tru-on-menu: #FFFFFF;
--tru-primary: #cd1719;`;

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(3);
      expect(result[0]).toEqual({ name: '--tru-menu', value: '#192a67' });
      expect(result[1]).toEqual({ name: '--tru-on-menu', value: '#FFFFFF' });
      expect(result[2]).toEqual({ name: '--tru-primary', value: '#cd1719' });
    });

    it('should normalize uppercase CSS variable names', () => {
      // Assemble
      const input = '--TRU-MENU: #192a67;';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result[0].name).toBe('--tru-menu');
    });

    it('should handle CSS variables without trailing semicolon', () => {
      // Assemble
      const input = '--tru-menu: #192a67';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ name: '--tru-menu', value: '#192a67' });
    });
  });

  describe('parse - Space-separated format', () => {
    it('should parse space-separated variable declarations', () => {
      // Assemble
      const input = `--tru-primary 0D4A82
--tru-on-primary FFFFFF
--tru-secondary FFFFFF
--tru-on-secondary FFFFFF
--tru-menu 000000
--tru-on-menu 0D4A82
--tru-background FFFFFF
--tru-background-fade F5F6F7
--tru-on-background 000000`;

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(9);
      expect(result[0]).toEqual({ name: '--tru-primary', value: '#0D4A82' });
      expect(result[1]).toEqual({ name: '--tru-on-primary', value: '#FFFFFF' });
      expect(result[4]).toEqual({ name: '--tru-menu', value: '#000000' });
      expect(result[7]).toEqual({ name: '--tru-background-fade', value: '#F5F6F7' });
    });

    it('should add # prefix to hex values', () => {
      // Assemble
      const input = '--color FF0000';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result[0].value).toBe('#FF0000');
    });

    it('should normalize variable names to lowercase', () => {
      // Assemble
      const input = '--TRU-MENU 192a67';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result[0].name).toBe('--tru-menu');
    });

    it('should handle 3-digit hex values', () => {
      // Assemble
      const input = '--color FFF';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result[0].value).toBe('#FFF');
    });

    it('should skip invalid lines', () => {
      // Assemble
      const input = `--valid-color 192a67
invalid line without proper format
--another-color FFFFFF`;

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('--valid-color');
      expect(result[1].name).toBe('--another-color');
    });

    it('should handle extra whitespace between name and value', () => {
      // Assemble
      const input = '--color    192a67';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ name: '--color', value: '#192a67' });
    });
  });

  describe('parse - Edge cases', () => {
    it('should return empty array for empty string', () => {
      // Assemble
      const input = '';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace only', () => {
      // Assemble
      const input = '   \n\t  ';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array for unknown format', () => {
      // Assemble
      const input = 'random garbage that is not valid';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle rgb color values', () => {
      // Assemble
      const input = 'menu-color: rgb(25, 42, 103)';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(1);
      expect(result[0].value).toBe('rgb(25, 42, 103)');
    });

    it('should handle rgba color values', () => {
      // Assemble
      const input = '--menu-color: rgba(25, 42, 103, 0.5);';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result.length).toBe(1);
      expect(result[0].value).toBe('rgba(25, 42, 103, 0.5)');
    });

    it('should handle 3-digit hex colors', () => {
      // Assemble
      const input = 'color: #fff';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result[0].value).toBe('#fff');
    });

    it('should handle 8-digit hex colors with alpha', () => {
      // Assemble
      const input = 'color: #192a67ff';

      // Act
      const result = service.parse(input);

      // Assert
      expect(result[0].value).toBe('#192a67ff');
    });
  });
});
