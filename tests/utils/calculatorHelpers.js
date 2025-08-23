// Helper functions for calculator testing

export class CalculatorTestHelper {
  constructor() {
    this.dom = null;
  }

  // Initialize DOM for testing
  async setup() {
    await global.setupDOM();
    // Get the document reference directly from the JSDOM instance
    this.dom = global.currentJSDOM.window.document;
    // DOM validation check
    if (!this.dom || !this.dom.documentElement) {
      throw new Error('DOM not available after setup');
    }
    // Wait for any initialization scripts to run
    await this.waitForReady();
  }

  async waitForReady(timeout = 2000) {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.dom.getElementById('cpaForm')) {
          resolve();
        } else if (timeout > 0) {
          timeout -= 100;
          setTimeout(checkReady, 100);
        } else {
          resolve(); // Timeout reached
        }
      };
      checkReady();
    });
  }

  // Form interaction methods
  setInput(id, value) {
    const element = this.dom.getElementById(id);
    if (!element) throw new Error(`Element with id '${id}' not found`);
    
    element.value = value.toString();
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
    return this;
  }

  getInput(id) {
    const element = this.dom.getElementById(id);
    return element ? element.value : null;
  }

  clickButton(id) {
    const element = this.dom.getElementById(id);
    if (!element) throw new Error(`Button with id '${id}' not found`);
    
    const event = new Event('click', { bubbles: true });
    element.dispatchEvent(event);
    return this;
  }

  // Tab navigation
  switchToTab(tabName) {
    const tabs = this.dom.querySelectorAll('.tab');
    const targetTab = Array.from(tabs).find(tab => 
      tab.getAttribute('data-tab') === tabName
    );
    
    if (!targetTab) throw new Error(`Tab '${tabName}' not found`);
    
    const event = new Event('click', { bubbles: true });
    targetTab.dispatchEvent(event);
    return this;
  }

  // Result retrieval methods
  getResult(id) {
    const element = this.dom.getElementById(id);
    if (!element) return null;
    
    const text = element.textContent;
    // Handle different number formats
    const cleanText = text.replace(/[,$%]/g, '');
    const parsed = parseFloat(cleanText);
    return isNaN(parsed) ? text : parsed;
  }

  getAllResults() {
    const resultIds = [
      'aovPostTaxReturns', 'grossMarginPercent', 'contributionMargin',
      'contributionMarginPercent', 'grossProfitPerOrder', 'operatingProfitPerOrder',
      'profitPerCustomer', 'customerLifetimeValue', 'customerLifetimeProfit',
      'breakEvenCAC', 'profitDrivenCAC', 'targetROAS', 'ltvCacRatio',
      'paybackPeriod', 'targetCpl'
    ];

    const results = {};
    resultIds.forEach(id => {
      results[id] = this.getResult(id);
    });
    return results;
  }

  // Calculation methods
  calculate() {
    // Call the calculator function directly since we injected it
    global.currentJSDOM.window.calculateResults();
    return this;
  }

  reset() {
    this.clickButton('resetBtn');
    return this;
  }

  // Validation methods
  expectResult(id, expectedValue, tolerance = 0.01) {
    const actual = this.getResult(id);
    if (actual === null) {
      throw new Error(`Result '${id}' not found`);
    }
    
    if (typeof expectedValue === 'number') {
      const diff = Math.abs(actual - expectedValue);
      const percentDiff = expectedValue !== 0 ? (diff / Math.abs(expectedValue)) * 100 : diff;
      if (percentDiff > tolerance) {
        throw new Error(
          `Expected ${id} to be ${expectedValue} (±${tolerance}%), but got ${actual} (${percentDiff.toFixed(2)}% difference)`
        );
      }
    } else {
      if (actual !== expectedValue) {
        throw new Error(`Expected ${id} to be '${expectedValue}', but got '${actual}'`);
      }
    }
    return this;
  }

  expectResultWithinRange(id, min, max) {
    const actual = this.getResult(id);
    if (actual === null) {
      throw new Error(`Result '${id}' not found`);
    }
    
    if (actual < min || actual > max) {
      throw new Error(`Expected ${id} to be between ${min} and ${max}, but got ${actual}`);
    }
    return this;
  }

  // UI state verification
  isElementVisible(id) {
    const element = this.dom.getElementById(id);
    return element && element.style.display !== 'none';
  }

  isTabActive(tabName) {
    const tab = this.dom.querySelector(`[data-tab="${tabName}"]`);
    return tab && tab.classList.contains('active');
  }

  isPresentationModeActive() {
    return this.dom.body.classList.contains('presentation-mode-active');
  }

  isCalculationDetailExpanded(targetId) {
    const detail = this.dom.getElementById(targetId);
    return detail && detail.classList.contains('expanded');
  }

  // Theme and mode methods
  toggleDarkMode() {
    this.clickButton('themeToggle');
    return this;
  }

  togglePresentationMode() {
    this.clickButton('presentationModeBtn');
    return this;
  }

  isDarkMode() {
    return this.dom.body.getAttribute('data-theme') === 'dark';
  }

  // Calculation details interaction
  expandCalculationDetails(targetId) {
    const toggle = this.dom.querySelector(`[data-target="${targetId}"]`);
    if (!toggle) throw new Error(`Calculation toggle for '${targetId}' not found`);
    
    const event = new Event('click', { bubbles: true });
    toggle.dispatchEvent(event);
    return this;
  }

  getCalculationDetail(detailId, stepId) {
    const element = this.dom.querySelector(`#${detailId} #${stepId}`);
    return element ? element.textContent : null;
  }

  // Waterfall chart methods
  getWaterfallValue(id) {
    const element = this.dom.getElementById(`waterfall-${id}`);
    return element ? parseFloat(element.textContent.replace(/[,$]/g, '')) : null;
  }

  getWaterfallBarHeight(id) {
    const element = this.dom.getElementById(`waterfall-${id}-bar`);
    return element ? parseInt(element.style.height) : null;
  }

  // Settings import/export
  async saveSettings() {
    const originalCreateObjectURL = global.URL.createObjectURL;
    const downloads = [];
    
    global.URL.createObjectURL = (blob) => {
      const url = `blob:mock-${Date.now()}`;
      downloads.push({ url, blob });
      return url;
    };

    this.clickButton('saveBtn');
    
    // Wait for download to process
    await new Promise(resolve => setTimeout(resolve, 100));
    
    global.URL.createObjectURL = originalCreateObjectURL;
    return downloads.length > 0 ? downloads[0] : null;
  }

  async importSettings(data) {
    const fileInput = this.dom.getElementById('fileInput');
    if (!fileInput) throw new Error('File input not found');

    const file = new File([JSON.stringify(data)], 'test_settings.json', {
      type: 'application/json'
    });

    // Mock the file input change event
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true
    });

    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);

    // Wait for import to process
    await new Promise(resolve => setTimeout(resolve, 100));
    return this;
  }

  // Notification checking
  isNotificationVisible() {
    return global.window._testWarningVisible || false;
  }

  getNotificationText() {
    return global.window._testWarningText || "";
  }

  // Performance timing
  timeCalculation() {
    const start = performance.now();
    this.calculate();
    const end = performance.now();
    return end - start;
  }

  // Cleanup
  cleanup() {
    if (global.window) {
      global.window.close();
    }
  }
}

export default CalculatorTestHelper;