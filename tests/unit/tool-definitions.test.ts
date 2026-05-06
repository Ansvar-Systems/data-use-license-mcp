import { describe, it, expect } from 'vitest';
import { TOOLS } from '../../src/tool-definitions.js';

describe('TOOLS', () => {
  it('exports 5 domain tools + 3 mandatory meta-tools = 8 total', () => {
    expect(TOOLS).toHaveLength(8);
  });

  it('lists tools in canonical order (domain tools first, meta-tools last)', () => {
    expect(TOOLS.map(t => t.name)).toEqual([
      'search_entities',
      'get_entity',
      'check_compatibility',
      'get_obligations',
      'search_vendor_templates',
      'list_sources',
      'about',
      'check_data_freshness',
    ]);
  });

  it('every tool has name, description, and an object inputSchema', () => {
    for (const t of TOOLS) {
      expect(typeof t.name).toBe('string');
      expect(typeof t.description).toBe('string');
      expect(t.inputSchema).toMatchObject({ type: 'object' });
    }
  });

  it('domain tools declare required fields; meta-tools take no input', () => {
    const META_TOOLS = new Set(['list_sources', 'about', 'check_data_freshness']);
    for (const t of TOOLS) {
      const schema = t.inputSchema as { required?: string[] };
      if (META_TOOLS.has(t.name)) {
        // Meta-tools have no required input.
        expect(schema.required).toBeUndefined();
      } else {
        expect(Array.isArray(schema.required)).toBe(true);
      }
    }
  });
});
