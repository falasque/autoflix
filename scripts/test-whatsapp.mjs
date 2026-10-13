import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const code = ts.transpileModule(readFileSync('src/lib/whatsapp.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { normalizeWhatsAppNumber } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
for (const [input, expected] of [
  ['(41) 99588-0292', '5541995880292'],
  ['5541995880292', '5541995880292'],
  ['+55 (41) 99501-1170', '5541995011170'],
  ['(41) 3333-4444', '554133334444'],
  ['', ''],
]) assert.equal(normalizeWhatsAppNumber(input), expected);
console.log('WhatsApp normalization: 5 cases passed');
