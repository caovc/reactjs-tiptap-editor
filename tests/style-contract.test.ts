import assert from 'node:assert/strict';
import test from 'node:test';

import { cn } from '../src/lib/utils';

test('namespaced component layout overrides resolve to the last requested layout', () => {
  assert.equal(
    cn(
      'richtext-flex richtext-flex-col richtext-items-stretch',
      'richtext-flex-row richtext-items-center'
    ),
    'richtext-flex richtext-flex-row richtext-items-center'
  );
  assert.equal(
    cn('richtext-min-h-14 richtext-w-full richtext-p-5', [
      'richtext-p-0',
      'richtext-w-48',
      { 'richtext-min-h-0': true },
    ]),
    'richtext-p-0 richtext-w-48 richtext-min-h-0'
  );
});
test('scoped variants and business classes remain independent', () => {
  assert.equal(
    cn(
      'sap-ribbon richtext-flex-col hover:richtext-flex-col',
      'richtext-flex-row hover:richtext-flex-row'
    ),
    'sap-ribbon richtext-flex-row hover:richtext-flex-row'
  );
  assert.equal(cn('!richtext-p-2 richtext-p-4', '!richtext-p-1'), 'richtext-p-4 !richtext-p-1');
  assert.deepEqual(
    new Set(
      cn('richtext-border richtext-border-input richtext-text-sm richtext-text-primary').split(' ')
    ),
    new Set([
      'richtext-text-sm',
      'richtext-text-primary',
      'richtext-border',
      'richtext-border-input',
    ])
  );
});
