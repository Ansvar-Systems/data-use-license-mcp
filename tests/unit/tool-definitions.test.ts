import { describe, it, expect } from 'vitest';
import { TOOLS } from '../../src/tool-definitions.js';

describe('TOOLS', () => {
  it('exports exactly 5 tools', () => {
    expect(TOOLS).toHaveLength(5);
  });

  it('lists tools in canonical order', () => {
    expect(TOOLS.map(t => t.name)).toEqual([
      'search_entities',
      'get_entity',
      'check_compatibility',
      'get_obligations',
      'search_vendor_templates',
    ]);
  });

  it('every tool has name, description, inputSchema with required field', () => {
    for (const t of TOOLS) {
      expect(typeof t.name).toBe('string');
      expect(typeof t.description).toBe('string');
      expect(t.inputSchema).toMatchObject({ type: 'object' });
      expect(Array.isArray((t.inputSchema as { required?: string[] }).required)).toBe(true);
    }
  });
});
