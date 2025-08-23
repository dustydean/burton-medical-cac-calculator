# 🤝 Contributing to Strategic CAC Calculator Test Suite

Thank you for your interest in contributing! This document provides guidelines for contributing to the test suite.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Writing Tests](#writing-tests)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Git
- Basic understanding of JavaScript testing

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/strategic-cac-calculator-tests.git
cd strategic-cac-calculator-tests

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run tests to verify setup
npm test
```

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 2. Make Changes

- Write your code/tests
- Follow existing patterns and conventions
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test file
npm test -- your-test-file.test.js

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Check code quality
npm run lint
```

### 4. Commit Changes

```bash
# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: add new test for edge case handling

- Add tests for zero AOV scenarios
- Improve error handling validation
- Update test data fixtures"
```

## 🧪 Writing Tests

### Test Categories

1. **Unit Tests** (`tests/unit/`) - Test individual functions
2. **Integration Tests** (`tests/integration/`) - Test component interactions
3. **E2E Tests** (`tests/e2e/`) - Test complete user workflows
4. **Performance Tests** (`tests/performance/`) - Test performance benchmarks
5. **Edge Cases** (`tests/edge-cases/`) - Test error conditions

### Test Structure

```javascript
/**
 * Test Description
 * 
 * Brief explanation of what this test validates.
 */
describe('Feature Being Tested', () => {
  let helper;

  beforeEach(async () => {
    helper = new CalculatorTestHelper();
    await helper.setup();
  });

  afterEach(() => {
    helper.cleanup();
  });

  test('should do something specific', () => {
    // Arrange - Set up test data
    helper.setInput('aov', '1500');
    
    // Act - Perform action
    helper.calculate();
    
    // Assert - Verify results
    expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
  });
});
```

### Test Naming Conventions

- Use descriptive test names
- Start with "should" for behavior tests
- Include the scenario being tested

**Good Examples:**
```javascript
test('should calculate CAC correctly with default values')
test('should handle zero AOV gracefully')  
test('should update CPL when conversion rate changes')
```

**Avoid:**
```javascript
test('test CAC calculation')
test('basic test')
test('it works')
```

### Test Data

- Use existing test data from `tests/fixtures/testData.js`
- Create new data sets for specific scenarios
- Document expected results

```javascript
// Add new test data
export const newScenario = {
  aov: 2000,
  taxRate: 8.5,
  // ... other values
  description: 'High-value B2B business scenario'
};

// Add expected results
export const expectedResults = {
  newScenario: {
    profitDrivenCAC: 425.75,
    customerLifetimeValue: 2150.00
  }
};
```

## 🎨 Code Style

### JavaScript Style

- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add comments for complex logic

```javascript
// Good
const calculatedCAC = helper.getResult('profitDrivenCAC');
const expectedCAC = 317.74;
expect(calculatedCAC).toBeCloseTo(expectedCAC, 2);

// Avoid
const c = helper.getResult('profitDrivenCAC');
expect(c).toBe(317.74);
```

### Documentation

- Add JSDoc comments for new functions
- Update README for new features
- Include examples in documentation

```javascript
/**
 * Validates calculation accuracy within tolerance
 * 
 * @param {number} actual - The calculated result
 * @param {number} expected - The expected value  
 * @param {number} tolerance - Acceptable percentage difference
 * @returns {boolean} True if within tolerance
 */
function validateWithinTolerance(actual, expected, tolerance = 0.1) {
  // Implementation
}
```

### Linting

Follow ESLint rules:

```bash
# Check for linting issues
npm run lint

# Auto-fix issues where possible
npm run lint -- --fix
```

## 📝 Submitting Changes

### 1. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 2. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Performance improvement
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] Added new tests for changes
- [ ] Tested manually

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

### 3. Address Review Feedback

- Respond to reviewer comments
- Make requested changes
- Push updates to the same branch

## 🐛 Reporting Issues

### Bug Reports

Use the bug report template:

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Error occurs

**Expected Behavior**
What should happen

**Environment**
- OS: [e.g., macOS, Windows]
- Node.js version: [e.g., 18.0.0]
- Browser: [if applicable]

**Additional Context**
Screenshots, logs, etc.
```

### Feature Requests

```markdown
**Feature Description**
Clear description of proposed feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered
```

## 🧪 Test Categories Guide

### Unit Tests
- Test individual calculation functions
- Mock external dependencies
- Focus on pure function behavior
- Aim for 95%+ code coverage

### Integration Tests  
- Test UI component interactions
- Verify form state management
- Test real-time updates
- Validate event handling

### E2E Tests
- Test complete user workflows
- Simulate real user interactions
- Test cross-browser compatibility
- Validate end-to-end functionality

### Performance Tests
- Set performance benchmarks
- Test under load conditions
- Monitor memory usage
- Validate response times

### Edge Case Tests
- Test boundary conditions
- Validate error handling
- Test with invalid input
- Ensure graceful failures

## 🏆 Best Practices

### General Guidelines
- Write tests first when possible (TDD)
- Keep tests simple and focused
- Use descriptive assertions
- Avoid testing implementation details

### Performance Considerations
- Keep test execution time under 30 seconds
- Use appropriate timeouts
- Clean up resources after tests
- Avoid unnecessary DOM operations

### Maintainability
- Use page object patterns for E2E tests
- Share common test utilities
- Keep test data organized
- Document complex test scenarios

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)

## 🎉 Recognition

Contributors will be recognized in:
- Repository contributors list
- Release notes for significant contributions
- README acknowledgments

Thank you for contributing to the Strategic CAC Calculator Test Suite! 🚀