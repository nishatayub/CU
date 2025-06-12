# Jest Learning Guide - Complete Tutorial

## What is Jest?

Jest is a delightful JavaScript testing framework with a focus on simplicity. It works out of the box for most JavaScript projects and provides:

- **Zero configuration** - Works immediately for most projects
- **Snapshot testing** - Capture snapshots of components and objects
- **Built-in test runner** - No need for additional tools
- **Code coverage** - Built-in coverage reports
- **Mocking** - Powerful mocking capabilities
- **Parallel testing** - Fast test execution

## Jest Basics

### 1. Test Structure

```javascript
// Basic test structure
describe('Test Suite Name', () => {
  test('should do something specific', () => {
    // Arrange - Set up test data
    const input = 'hello';
    
    // Act - Execute the function
    const result = myFunction(input);
    
    // Assert - Check the result
    expect(result).toBe('expected output');
  });
});
```

### 2. Common Matchers

```javascript
// Equality
expect(2 + 2).toBe(4);                    // Exact equality
expect({ name: 'John' }).toEqual({ name: 'John' }); // Object equality

// Truthiness
expect(true).toBeTruthy();
expect(false).toBeFalsy();
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect('hello').toBeDefined();

// Numbers
expect(2 + 2).toBeGreaterThan(3);
expect(2 + 2).toBeGreaterThanOrEqual(4);
expect(2 + 2).toBeLessThan(5);
expect(Math.PI).toBeCloseTo(3.14159, 5);

// Strings
expect('Hello World').toMatch(/World/);
expect('Hello World').toContain('World');

// Arrays
expect(['apple', 'banana', 'orange']).toContain('banana');
expect(['a', 'b', 'c']).toHaveLength(3);

// Exceptions
expect(() => {
  throw new Error('Wrong!');
}).toThrow('Wrong!');
```

### 3. Setup and Teardown

```javascript
describe('Database tests', () => {
  // Runs before all tests in this describe block
  beforeAll(async () => {
    await connectToDatabase();
  });

  // Runs after all tests in this describe block
  afterAll(async () => {
    await disconnectFromDatabase();
  });

  // Runs before each test
  beforeEach(() => {
    initializeTestData();
  });

  // Runs after each test
  afterEach(() => {
    cleanupTestData();
  });

  test('should save user to database', () => {
    // Test implementation
  });
});
```

## Testing Different Types of Code

### 1. Testing Pure Functions

```javascript
// utils/math.js
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

module.exports = { add, multiply };

// __tests__/math.test.js
const { add, multiply } = require('../utils/math');

describe('Math utilities', () => {
  test('should add two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });

  test('should multiply two numbers correctly', () => {
    expect(multiply(3, 4)).toBe(12);
    expect(multiply(-2, 3)).toBe(-6);
    expect(multiply(0, 5)).toBe(0);
  });
});
```

### 2. Testing Async Code

```javascript
// Promises
test('async data fetch', async () => {
  const data = await fetchUserData();
  expect(data).toEqual({ id: 1, name: 'John' });
});

// Or using resolves/rejects
test('async data fetch with resolves', () => {
  return expect(fetchUserData()).resolves.toEqual({ id: 1, name: 'John' });
});

test('async error handling', () => {
  return expect(fetchInvalidData()).rejects.toThrow('Invalid data');
});
```

### 3. Testing with Mocks

```javascript
// Mocking functions
const mockCallback = jest.fn();

test('mock implementation', () => {
  [0, 1].forEach(mockCallback);
  
  expect(mockCallback).toHaveBeenCalledTimes(2);
  expect(mockCallback).toHaveBeenCalledWith(0);
  expect(mockCallback).toHaveBeenCalledWith(1);
});

// Mocking modules
jest.mock('../api/userService');
const userService = require('../api/userService');

test('should fetch users', async () => {
  userService.getUsers.mockResolvedValue([{ id: 1, name: 'John' }]);
  
  const users = await getUsers();
  expect(users).toHaveLength(1);
  expect(userService.getUsers).toHaveBeenCalled();
});
```

### 4. Testing React Components (with React Testing Library)

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  const buttonElement = screen.getByText(/click me/i);
  expect(buttonElement).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByText(/click me/i));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 5. Testing Express Routes

```javascript
const request = require('supertest');
const app = require('../app');

describe('POST /api/users', () => {
  test('should create a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body).toMatchObject(userData);
    expect(response.body.id).toBeDefined();
  });
});
```

## Advanced Jest Features

### 1. Snapshot Testing

```javascript
test('component snapshot', () => {
  const component = render(<MyComponent prop="value" />);
  expect(component).toMatchSnapshot();
});
```

### 2. Custom Matchers

```javascript
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

test('numeric ranges', () => {
  expect(100).toBeWithinRange(90, 110);
});
```

### 3. Test Configuration

```javascript
// jest.config.js
module.exports = {
  // Test environment
  testEnvironment: 'node', // or 'jsdom' for browser-like environment
  
  // Test file patterns
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  
  // Coverage
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Module mapping (for imports)
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

## Best Practices

### 1. Test Organization
- Group related tests with `describe()`
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Keep tests focused and simple

### 2. Test Naming
```javascript
// Good test names
test('should return user when valid ID is provided')
test('should throw error when user not found')
test('should validate email format before saving')

// Poor test names
test('user test')
test('it works')
test('test1')
```

### 3. Mocking Guidelines
- Mock external dependencies
- Don't mock what you're testing
- Reset mocks between tests
- Use descriptive mock data

### 4. Coverage Goals
- Aim for 80%+ line coverage
- Focus on critical business logic
- Don't chase 100% coverage blindly
- Test edge cases and error conditions

## Common Testing Patterns

### 1. Testing Error Handling
```javascript
test('should handle network errors gracefully', async () => {
  const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
  global.fetch = mockFetch;
  
  await expect(fetchData()).rejects.toThrow('Network error');
});
```

### 2. Testing with Timers
```javascript
test('should delay execution', () => {
  jest.useFakeTimers();
  const callback = jest.fn();
  
  setTimeout(callback, 1000);
  jest.advanceTimersByTime(1000);
  
  expect(callback).toHaveBeenCalled();
  jest.useRealTimers();
});
```

### 3. Testing Environment Variables
```javascript
test('should use production config', () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  
  const config = getConfig();
  expect(config.debug).toBe(false);
  
  process.env.NODE_ENV = originalEnv;
});
```

## Next Steps

1. **Start Small**: Begin with simple unit tests for pure functions
2. **Practice Regularly**: Write tests for your existing CodeUnity functions
3. **Learn TDD**: Try Test-Driven Development approach
4. **Explore Tools**: Learn React Testing Library, Supertest, etc.
5. **Read Documentation**: Jest docs are excellent and comprehensive

## Useful Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- math.test.js

# Run tests matching pattern
npm test -- --testNamePattern="user"
```

This guide covers the fundamentals of Jest. The key to mastering Jest is practice - start writing tests for your existing code and gradually learn more advanced features!
