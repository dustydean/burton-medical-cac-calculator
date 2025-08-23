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
const htmlPath = path.join(__dirname, '../cac-calculator.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

/**
 * Global DOM Setup Function
 * 
 * Creates a JSDOM environment with the calculator HTML loaded.
 * This function is called by each test to set up a fresh DOM environment.
 * 
 * @returns {Promise} Resolves when DOM is ready for testing
 */
global.setupDOM = () => {
  // Create JSDOM instance with calculator HTML
  const dom = new JSDOM(htmlContent, {
    runScripts: 'dangerously',    // Allow JavaScript execution
    resources: 'usable',          // Enable resource loading
    pretendToBeVisual: true       // Pretend to be a visual browser
  });
  
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
  
  // Wait for DOM to be ready
  return new Promise((resolve) => {
    if (dom.window.document.readyState === 'loading') {
      dom.window.document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
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
  
  // Close JSDOM window to prevent memory leaks
  if (global.window) {
    global.window.close();
  }
});