import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCompactCurrency, formatPercent, formatNumber, timeAgo, cn } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats USD values', () => {
    expect(formatCurrency(1.5)).toBe('$1.50');
    expect(formatCurrency(67000)).toBe('$67,000.00');
  });

  it('shows more decimals for small values', () => {
    const result = formatCurrency(0.00001234);
    expect(result).toContain('$0.000012');
  });
});

describe('formatCompactCurrency', () => {
  it('formats billions', () => {
    expect(formatCompactCurrency(1_300_000_000_000)).toContain('T');
  });

  it('formats millions', () => {
    expect(formatCompactCurrency(28_000_000_000)).toContain('B');
  });
});

describe('formatPercent', () => {
  it('handles positive values', () => {
    expect(formatPercent(2.45)).toBe('+2.45%');
  });

  it('handles negative values', () => {
    expect(formatPercent(-1.20)).toBe('-1.20%');
  });

  it('handles null', () => {
    expect(formatPercent(null)).toBe('—');
  });
});

describe('formatNumber', () => {
  it('formats with commas', () => {
    expect(formatNumber(12045)).toBe('12,045');
  });
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('base', 'extra')).toBe('base extra');
  });

  it('handles conditionals', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra');
  });
});

describe('timeAgo', () => {
  it('returns "just now" for recent dates', () => {
    expect(timeAgo(new Date().toISOString())).toBe('just now');
  });
});
