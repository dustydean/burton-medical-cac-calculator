# Strategic CAC Calculator

A sophisticated web-based tool for calculating Customer Acquisition Cost (CAC), Customer Lifetime Value (CLTV), and optimizing marketing spend. Originally built for VersaTube, this calculator helps businesses determine their optimal marketing budgets and customer acquisition strategies.

## 🎯 Overview

The Strategic CAC Calculator is a comprehensive financial tool that helps businesses:
- **Calculate Customer Acquisition Cost (CAC)** with profit targets
- **Determine Customer Lifetime Value (CLTV)** with repeat purchase modeling
- **Optimize marketing spend** with target ROAS and CPL calculations
- **Analyze unit economics** with waterfall visualization
- **Plan growth strategies** with scenario modeling

This repository includes both the calculator application and a comprehensive test suite ensuring reliability and accuracy.

## 🚀 Features

### Core Calculations
- **Customer Acquisition Cost (CAC)** - Profit-driven and break-even calculations
- **Customer Lifetime Value (CLTV)** - Including repeat purchase modeling
- **Return on Ad Spend (ROAS)** - Target efficiency metrics
- **Cost Per Lead (CPL)** - Lead funnel optimization
- **LTV:CAC Ratios** - Unit economics health indicators

### Interactive Features
- **Multi-tab Interface** - Organized data entry (Business Basics, Customer Metrics, Financial Targets)
- **Real-time Calculations** - Instant updates as you change inputs
- **Expandable Details** - See formulas and calculation breakdowns
- **Waterfall Visualization** - Visual breakdown of unit economics
- **Dark/Light Themes** - Customizable appearance
- **Presentation Mode** - Clean view for client presentations
- **Settings Import/Export** - Save and share configurations

## 🏗️ Technical Architecture

### Application Structure
- **Single Page Application** - Pure HTML/CSS/JavaScript
- **Responsive Design** - Works on desktop and mobile
- **Progressive Enhancement** - Functional without JavaScript frameworks
- **Accessibility Compliant** - Screen reader and keyboard navigation support

### Test Suite

This repository includes a focused test suite ensuring core calculation reliability:

- **Unit Tests** (`tests/unit/`) - Comprehensive testing of all mathematical calculation functions

## 🚀 Getting Started

### Using the Calculator

1. **Open the Calculator**
   - Open `cac-calculator.html` in any modern web browser
   - Or visit the live demo: [Strategic CAC Calculator](https://dustydean.github.io/cac-calculator)

2. **Enter Your Business Data**
   - **Business Basics**: AOV, tax rate, return rate, cost of sales
   - **Customer Metrics**: Retention rates, fulfillment costs
   - **Financial Targets**: G&A costs, target profit margins

3. **View Results**
   - See calculated CAC, CLTV, ROAS targets
   - Explore calculation details by clicking "+" buttons
   - Use the waterfall chart to understand unit economics

### For Developers

#### Prerequisites
- Node.js 18+ 
- npm or yarn

#### Installation
```bash
# Clone the repository
git clone https://github.com/dustydean/cac-calculator.git
cd cac-calculator

# Install test dependencies
npm install
```

#### Running Tests

```bash
# Run unit tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Start local development server
npm run serve
```

## 🧪 Testing

### Test Coverage

The unit test suite provides comprehensive coverage of all core mathematical functions:

- ✅ **AOV Calculations** - Post-tax and returns calculations with various rates
- ✅ **Margin Calculations** - Gross and contribution margins with edge cases  
- ✅ **Profit Calculations** - Operating profit per order with cost scenarios
- ✅ **Customer Metrics** - Lifetime value and profit with repeat purchase modeling
- ✅ **CAC Calculations** - Profit-driven and break-even CAC with target margins
- ✅ **ROAS & Ratios** - Target ROAS and LTV:CAC ratio calculations
- ✅ **CPL Calculations** - Cost per lead with conversion rate modeling
- ✅ **Edge Cases** - Division by zero, negative values, and boundary conditions

**Current Status**: 29 unit tests with 100% pass rate

### Test Structure

```
tests/
├── setup.js                    # Jest and JSDOM configuration
├── polyfills.js                # Node.js polyfills for browser APIs  
├── fixtures/
│   └── testData.js             # Test scenarios and expected results
├── utils/
│   └── calculatorHelpers.js    # Test helper functions and utilities
└── unit/
    └── calculations.test.js    # Core calculation function tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report  
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 🤝 Contributing

When contributing to the calculator:

1. **Add Tests** - Include unit tests for any new calculations
2. **Update Test Data** - Modify expected results when changing logic  
3. **Test Edge Cases** - Ensure proper handling of boundary conditions
4. **Validate Accuracy** - Verify mathematical correctness with manual calculations

## 📄 License

MIT License. See LICENSE file for details.

---

**Calculator Version**: 1.0.0  
**Last Updated**: 2024