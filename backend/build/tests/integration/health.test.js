import { test } from 'node:test';
import assert from 'node:assert';
const BASE_URL = 'http://localhost:3000/api';
test('database connection integration test', async () => {
    //* test the database endpoint
    try {
        const response = await fetch(`${BASE_URL}/db/test`);
        const data = await response.json();
        assert.strictEqual(response.status, 200);
        assert.strictEqual(data.success, true);
        assert.strictEqual(typeof data.stats.users, 'number');
        assert.strictEqual(Array.isArray(data.tables), true);
        console.log('Database connection integration test passed');
    }
    catch (error) {
        console.error('Database connection integration test failed:', error);
        throw error;
    }
});
