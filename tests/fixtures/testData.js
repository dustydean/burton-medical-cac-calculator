// Test data fixtures for Strategic CAC Calculator tests

export const testDataSets = {
  // Default VersaTube values from the calculator
  versaTubeDefaults: {
    aov: 1500,
    taxRate: 6.5,
    returnRate: 3.5,
    cosPercent: 42.0,
    gaPercent: 14.0,
    fulfillmentCost: 120,
    returningCustomers: 11.0,
    repeatOrderRate: 1.4,
    targetNetMargin: 12.0,
    leadConversionRate: 10.0
  },

  // High margin business scenario
  highMarginBusiness: {
    aov: 2000,
    taxRate: 0,
    returnRate: 1.0,
    cosPercent: 25.0,
    gaPercent: 8.0,
    fulfillmentCost: 50,
    returningCustomers: 25.0,
    repeatOrderRate: 2.0,
    targetNetMargin: 15.0,
    leadConversionRate: 12.0
  },

  // Low margin business scenario
  lowMarginBusiness: {
    aov: 800,
    taxRate: 8.5,
    returnRate: 5.0,
    cosPercent: 65.0,
    gaPercent: 18.0,
    fulfillmentCost: 75,
    returningCustomers: 5.0,
    repeatOrderRate: 1.1,
    targetNetMargin: 8.0,
    leadConversionRate: 8.0
  },

  // Unrealistic high margin scenario (should trigger warnings)
  unrealisticHighMargin: {
    aov: 1000,
    taxRate: 5.0,
    returnRate: 2.0,
    cosPercent: 70.0,
    gaPercent: 15.0,
    fulfillmentCost: 100,
    returningCustomers: 8.0,
    repeatOrderRate: 1.2,
    targetNetMargin: 25.0, // Unrealistically high
    leadConversionRate: 10.0
  },

  // Zero values scenario (edge cases)
  zeroValues: {
    aov: 0,
    taxRate: 0,
    returnRate: 0,
    cosPercent: 0,
    gaPercent: 0,
    fulfillmentCost: 0,
    returningCustomers: 0,
    repeatOrderRate: 0,
    targetNetMargin: 0,
    leadConversionRate: 0
  },

  // Extreme values scenario
  extremeValues: {
    aov: 10000,
    taxRate: 15.0,
    returnRate: 10.0,
    cosPercent: 80.0,
    gaPercent: 25.0,
    fulfillmentCost: 500,
    returningCustomers: 50.0,
    repeatOrderRate: 5.0,
    targetNetMargin: 5.0,
    leadConversionRate: 25.0
  },

  // Business with no repeat customers
  noRepeatBusiness: {
    aov: 1200,
    taxRate: 7.0,
    returnRate: 4.0,
    cosPercent: 45.0,
    gaPercent: 12.0,
    fulfillmentCost: 80,
    returningCustomers: 0,
    repeatOrderRate: 0,
    targetNetMargin: 10.0,
    leadConversionRate: 15.0
  },

  // Service business (low fulfillment costs)
  serviceBusiness: {
    aov: 5000,
    taxRate: 6.0,
    returnRate: 1.0,
    cosPercent: 15.0,
    gaPercent: 20.0,
    fulfillmentCost: 10,
    returningCustomers: 40.0,
    repeatOrderRate: 3.0,
    targetNetMargin: 20.0,
    leadConversionRate: 5.0
  }
};

// Expected results for known scenarios (calculated manually for validation)
export const expectedResults = {
  versaTubeDefaults: {
    aovPostTaxReturns: 1359.15,
    grossMarginPercent: 58.0,
    contributionMargin: 668.31,
    contributionMarginPercent: 49.16,
    operatingProfitPerOrder: 478.03,
    customerLifetimeValue: 1568.46,
    customerLifetimeProfit: 551.64,
    profitDrivenCAC: 363.43,
    breakEvenCAC: 551.64,
    ltvCacRatio: 4.32,
    targetROAS: 4.32,
    targetCpl: 3634.30
  },

  highMarginBusiness: {
    aovPostTaxReturns: 1980.00,
    grossMarginPercent: 75.0,
    contributionMargin: 1435.00,
    operatingProfitPerOrder: 1276.60,
    customerLifetimeValue: 2970.00,
    customerLifetimeProfit: 1914.90,
    profitDrivenCAC: 1469.40,
    targetCpl: 1224.50
  },

  lowMarginBusiness: {
    aovPostTaxReturns: 699.77,
    grossMarginPercent: 35.0,
    contributionMargin: 169.92,
    operatingProfitPerOrder: 43.96,
    customerLifetimeValue: 739.76,
    customerLifetimeProfit: 46.44,
    profitDrivenCAC: -12.74, // Should be set to 0 in implementation
    targetCpl: 0
  }
};

// Utility functions for test data
export const testUtils = {
  // Create input event for form fields
  createInputEvent(value) {
    return new Event('input', { 
      bubbles: true, 
      cancelable: true,
      target: { value: value.toString() }
    });
  },

  // Convert test data object to form inputs
  fillFormInputs(data) {
    const inputs = {
      'aov': data.aov,
      'taxRate': data.taxRate,
      'returnRate': data.returnRate,
      'cosPercent': data.cosPercent,
      'gaPercent': data.gaPercent,
      'fulfillmentCost': data.fulfillmentCost,
      'returningCustomers': data.returningCustomers,
      'repeatOrderRate': data.repeatOrderRate,
      'targetNetMargin': data.targetNetMargin,
      'leadConversionRate': data.leadConversionRate
    };

    Object.entries(inputs).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value.toString();
        element.dispatchEvent(this.createInputEvent(value));
      }
    });
  },

  // Get all current form values
  getFormValues() {
    return {
      aov: parseFloat(document.getElementById('aov').value) || 0,
      taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
      returnRate: parseFloat(document.getElementById('returnRate').value) || 0,
      cosPercent: parseFloat(document.getElementById('cosPercent').value) || 0,
      gaPercent: parseFloat(document.getElementById('gaPercent').value) || 0,
      fulfillmentCost: parseFloat(document.getElementById('fulfillmentCost').value) || 0,
      returningCustomers: parseFloat(document.getElementById('returningCustomers').value) || 0,
      repeatOrderRate: parseFloat(document.getElementById('repeatOrderRate').value) || 0,
      targetNetMargin: parseFloat(document.getElementById('targetNetMargin').value) || 0,
      leadConversionRate: parseFloat(document.getElementById('leadConversionRate').value) || 0
    };
  },

  // Get result value by ID
  getResultValue(id) {
    const element = document.getElementById(id);
    return element ? parseFloat(element.textContent.replace(/[,$]/g, '')) : null;
  },

  // Trigger calculation
  triggerCalculation() {
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
      calculateBtn.click();
    }
  },

  // Wait for calculations to complete (allows for async operations)
  async waitForCalculation(timeout = 1000) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  },

  // Create mock file for import tests
  createMockFile(data, filename = 'test_settings.json') {
    const content = JSON.stringify(data, null, 2);
    return new File([content], filename, { type: 'application/json' });
  },

  // Validate calculation accuracy within tolerance
  expectValueWithinTolerance(actual, expected, tolerance = 0.01) {
    const diff = Math.abs(actual - expected);
    const percentDiff = expected !== 0 ? (diff / Math.abs(expected)) * 100 : diff;
    return percentDiff <= tolerance;
  }
};

export default {
  testDataSets,
  expectedResults,
  testUtils
};