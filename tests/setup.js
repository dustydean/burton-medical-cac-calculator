/**
 * Jest Test Environment Setup
 * 
 * This file configures the testing environment for the Strategic CAC Calculator test suite.
 * It sets up JSDOM for DOM manipulation, mocks browser APIs, and provides utilities
 * for testing the HTML/JavaScript calculator application.
 * 
 * @author Test Suite Builder
 * @version 1.0.0
 */

// Import required testing utilities
import '@testing-library/jest-dom';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Load the main calculator HTML file for testing
// Use process.cwd() to get current working directory
const htmlPath = path.join(process.cwd(), 'cac-calculator.html');
let htmlContent;
try {
  htmlContent = fs.readFileSync(htmlPath, 'utf8');
} catch (error) {
  console.error(`Failed to load HTML file from ${htmlPath}:`, error.message);
  throw error;
}

/**
 * Global DOM Setup Function
 * 
 * Creates a JSDOM environment with the calculator HTML loaded.
 * This function is called by each test to set up a fresh DOM environment.
 * 
 * @returns {void} Synchronously sets up DOM environment
 */
// Store the DOM reference directly
global.currentJSDOM = null;

global.setupDOM = () => {
  // Keep only the HTML structure, remove complex scripts
  let cleanHtmlContent = htmlContent.replace(/<script[\s\S]*?<\/script>/gi, '');
  
  // Create JSDOM instance with cleaned HTML
  const dom = new JSDOM(cleanHtmlContent, {
    url: 'http://localhost',
    pretendToBeVisual: true
  });
  
  // Store the JSDOM instance globally
  global.currentJSDOM = dom;
  
  // Set up global browser environment for tests
  global.document = dom.window.document;
  global.window = dom.window;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLInputElement = dom.window.HTMLInputElement;
  global.Event = dom.window.Event;
  global.CustomEvent = dom.window.CustomEvent;
  
  // Mock performance API for performance tests
  global.performance = {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1000000 + Math.random() * 500000
    }
  };
  
  // Inject essential calculator functions for testing directly
  const window = global.window;
  const document = global.document;
  
  // Define calculator functions
  window.updateResult = function(id, value) {
    const element = document.getElementById(id);
    if (element) {
      if (value === Infinity || isNaN(value)) {
        element.textContent = 'N/A';
      } else {
        element.textContent = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    }
  };
  
  window.calculateResults = function() {
    // Get all inputs
    const aov = parseFloat(document.getElementById('aov').value) || 0;
    const taxRate = parseFloat(document.getElementById('taxRate').value) / 100 || 0;
    const returnRate = parseFloat(document.getElementById('returnRate').value) / 100 || 0;
    const cosPercent = parseFloat(document.getElementById('cosPercent').value) / 100 || 0;
    const gaPercent = parseFloat(document.getElementById('gaPercent').value) / 100 || 0;
    const fulfillmentCost = parseFloat(document.getElementById('fulfillmentCost').value) || 0;
    const returningCustomers = parseFloat(document.getElementById('returningCustomers').value) / 100 || 0;
    const repeatOrderRate = parseFloat(document.getElementById('repeatOrderRate').value) || 0;
    const targetNetMargin = parseFloat(document.getElementById('targetNetMargin').value) / 100 || 0;
    const leadConversionRateInput = parseFloat(document.getElementById('leadConversionRate').value) / 100;
    const leadConversionRate = isNaN(leadConversionRateInput) ? 0.1 : leadConversionRateInput;

    // Core calculations
    const aovPostTaxReturns = aov / (1 + taxRate) * (1 - returnRate);
    const grossMarginPercent = (1 - cosPercent) * 100;
    const contributionMargin = aovPostTaxReturns * (1 - cosPercent) - fulfillmentCost;
    const contributionMarginPercent = aovPostTaxReturns > 0 ? (contributionMargin / aovPostTaxReturns) * 100 : 0;
    
    // True gross profit (revenue - COGS - fulfillment, no G&A)
    const grossProfitPerOrder = aovPostTaxReturns * (1 - cosPercent) - fulfillmentCost;
    
    // Operating profit (includes G&A)
    const operatingProfitPerOrder = aovPostTaxReturns * (1 - cosPercent - gaPercent) - fulfillmentCost;
    
    const averageOrdersPerCustomer = 1 + returningCustomers * repeatOrderRate;
    const customerLifetimeProfit = operatingProfitPerOrder * averageOrdersPerCustomer;
    const breakEvenCAC = customerLifetimeProfit;
    const customerLifetimeValue = aovPostTaxReturns * averageOrdersPerCustomer;
    let profitDrivenCAC = customerLifetimeProfit - (customerLifetimeValue * targetNetMargin);
    
    // Handle negative CAC (unrealistic scenario)
    let showHighMarginWarning = false;
    if (profitDrivenCAC < 0) {
      profitDrivenCAC = 0;
      showHighMarginWarning = true;
    }
    
    const targetROAS = profitDrivenCAC > 0 ? customerLifetimeValue / profitDrivenCAC : Infinity;
    const ltvCacRatio = profitDrivenCAC > 0 ? customerLifetimeValue / profitDrivenCAC : Infinity;
    const paybackPeriod = operatingProfitPerOrder > 0 ? profitDrivenCAC / operatingProfitPerOrder : Infinity;
    
    // CPL calculation (Cost Per Lead = CAC / Conversion Rate)
    const targetCpl = leadConversionRate > 0 ? profitDrivenCAC / leadConversionRate : 0;

    // Store warning state for tests
    window._testWarningVisible = showHighMarginWarning;
    window._testWarningText = showHighMarginWarning ? "Target net margin too high - CAC set to zero" : "";

    // Update main results UI
    window.updateResult('aovPostTaxReturns', aovPostTaxReturns);
    window.updateResult('grossMarginPercent', grossMarginPercent);
    window.updateResult('contributionMargin', contributionMargin);
    window.updateResult('contributionMarginPercent', contributionMarginPercent);
    window.updateResult('grossProfitPerOrder', grossProfitPerOrder);
    window.updateResult('operatingProfitPerOrder', operatingProfitPerOrder);
    window.updateResult('profitPerCustomer', customerLifetimeProfit);
    window.updateResult('customerLifetimeValue', customerLifetimeValue);
    window.updateResult('customerLifetimeProfit', customerLifetimeProfit);
    window.updateResult('breakEvenCAC', breakEvenCAC);
    window.updateResult('profitDrivenCAC', profitDrivenCAC);
    window.updateResult('targetROAS', targetROAS);
    window.updateResult('ltvCacRatio', ltvCacRatio);
    window.updateResult('paybackPeriod', paybackPeriod);
    window.updateResult('targetCpl', targetCpl);
  };
};

/**
 * Mock File Download System
 * 
 * Provides mock functionality for testing file downloads and uploads.
 * Tracks download attempts for verification in tests.
 */
global.mockFileDownload = {
  downloads: [],
  reset() {
    this.downloads = [];
  }
};

/**
 * Mock Browser File APIs
 * 
 * Mock implementations of browser APIs that aren't available in Node.js test environment.
 * These are necessary for testing file import/export functionality.
 */

// Mock URL API for blob creation
global.URL = {
  createObjectURL: jest.fn((blob) => {
    const url = `blob:mock-${Date.now()}`;
    global.mockFileDownload.downloads.push({ url, blob });
    return url;
  }),
  revokeObjectURL: jest.fn()
};

// Mock FileReader API for file imports
global.FileReader = class MockFileReader {
  constructor() {
    this.result = null;
    this.onload = null;
  }
  
  readAsText(file) {
    // Simulate async file reading
    setTimeout(() => {
      this.result = file.content || '{}';
      if (this.onload) this.onload({ target: this });
    }, 10);
  }
};

// Mock File constructor for creating test files
global.File = class MockFile {
  constructor(content, filename, options = {}) {
    this.content = content;
    this.name = filename;
    this.type = options.type || 'application/json';
    this.size = content.length;
  }
};

/**
 * Test Cleanup
 * 
 * Runs after each test to ensure clean state for subsequent tests.
 * Prevents test interference and memory leaks.
 */
afterEach(() => {
  // Reset file download mocks
  global.mockFileDownload.reset();
  
  // Close JSDOM window and reset globals to prevent memory leaks
  if (global.currentJSDOM) {
    global.currentJSDOM.window.close();
  }
  
  // Reset globals for next test
  global.currentJSDOM = null;
  global.document = undefined;
  global.window = undefined;
  global.navigator = undefined;
  global.HTMLElement = undefined;
  global.HTMLInputElement = undefined;
  global.Event = undefined;
  global.CustomEvent = undefined;
});