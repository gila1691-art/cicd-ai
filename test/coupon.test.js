import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyCoupon, calculateTotal } from '../src/pricing.js';

test('no coupon -> no discount', () => {
  assert.equal(applyCoupon(50, undefined), 50);
  assert.equal(applyCoupon(50, ''), 50);
});

test('unknown coupon -> no discount', () => {
  assert.equal(applyCoupon(50, 'FREECOFFEE'), 50);
});

test('WELCOME10 takes 10% off', () => {
  assert.equal(applyCoupon(50, 'WELCOME10'), 45);
});

test('coupon codes are case-insensitive', () => {
  assert.equal(applyCoupon(50, 'welcome10'), 45);
  assert.equal(applyCoupon(50, 'Welcome10'), 45);
});

test('FIXED20 subtracts 20 from the subtotal', () => {
  assert.equal(applyCoupon(50, 'FIXED20'), 30);
});

test('MEETUP25 requires a subtotal of at least 100', () => {
  assert.equal(applyCoupon(99.99, 'MEETUP25'), 99.99);
  assert.equal(applyCoupon(100, 'MEETUP25'), 75);
  assert.equal(applyCoupon(100.01, 'meetup25'), 75.01);
});

test('a fixed coupon never makes the price negative', () => {
  assert.equal(applyCoupon(15, 'FIXED20'), 0);
});

test('calculateTotal adds VAT after applying the coupon', () => {
  const result = calculateTotal([{ name: 'cake', price: 100, qty: 1 }], 'MEETUP25');
  assert.deepEqual(result, {
    subtotal: 100,
    discount: 25,
    vat: 13.5,
    total: 88.5,
  });
});

test('calculateTotal handles lowercase fixed coupon codes', () => {
  const result = calculateTotal([{ name: 'coffee', price: 30, qty: 2 }], 'fixed20');
  assert.deepEqual(result, {
    subtotal: 60,
    discount: 20,
    vat: 7.2,
    total: 47.2,
  });
});

test('calculateTotal keeps a fixed coupon from going below zero', () => {
  const result = calculateTotal([{ name: 'tea', price: 15, qty: 1 }], 'FIXED20');
  assert.deepEqual(result, {
    subtotal: 15,
    discount: 15,
    vat: 0,
    total: 0,
  });
});
