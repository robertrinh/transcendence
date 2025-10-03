import { test } from 'node:test'
import assert from 'node:assert'

test('health endpoint integration test', async () => {
  //* test runs inside Docker with the actual database connection
  //* tests the actual health endpoint with real services
  
  try {
    const response = await fetch('http://localhost:3000/api/health')
    const data = await response.json()
    
    assert.strictEqual(response.status, 200)
    assert.strictEqual(data.status, 'OK')
    assert.strictEqual(typeof data.message, 'string')
    
    console.log('Health endpoint integration test passed')
  } catch (error) {
    console.error('Health endpoint integration test failed:', error)
    throw error
  }
})

test('database connection integration test', async () => {
  //* test the database endpoint
  try {
    const response = await fetch('http://localhost:3000/api/db/test')
    const data = await response.json()
    
    assert.strictEqual(response.status, 200)
    assert.strictEqual(data.success, true)
    assert.strictEqual(typeof data.userCount, 'number')
    assert.strictEqual(Array.isArray(data.tables), true)
    
    console.log('Database connection integration test passed')
  } catch (error) {
    console.error('Database connection integration test failed:', error)
    throw error
  }
})
