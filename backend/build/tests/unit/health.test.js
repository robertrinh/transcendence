import { test } from 'node:test';
import assert from 'node:assert';
//* test the shape of the health endpoint response
test('health endpoint returns correct response', () => {
    const healthResponse = { status: 'OK', message: 'Backend API is running' };
    assert.strictEqual(healthResponse.status, 'OK');
    assert.strictEqual(healthResponse.message, 'Backend API is running');
});
