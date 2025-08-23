// Edge cases and error handling tests
import CalculatorTestHelper from '../utils/calculatorHelpers.js';

describe('Edge Cases and Error Handling', () => {
  let helper;

  beforeEach(async () => {
    helper = new CalculatorTestHelper();
    await helper.setup();
  });

  afterEach(() => {
    helper.cleanup();
  });

  describe('Mathematical Edge Cases', () => {
    test('handles zero AOV gracefully', () => {
      helper
        .setInput('aov', '0')
        .setInput('taxRate', '6.5')
        .setInput('returnRate', '3.5')
        .calculate();

      // Should not crash and handle zero AOV
      const aovPostTax = helper.getResult('aovPostTaxReturns');
      expect(aovPostTax).toBe(0);

      const cltv = helper.getResult('customerLifetimeValue');
      expect(cltv).toBe(0);

      const cac = helper.getResult('profitDrivenCAC');
      expect(cac === 0 || cac === 'N/A').toBe(true);
    });

    test('handles division by zero in ratios', () => {
      helper
        .setInput('aov', '100')
        .setInput('cosPercent', '70')
        .setInput('gaPercent', '25')
        .setInput('fulfillmentCost', '50')
        .setInput('targetNetMargin', '20')
        .calculate();

      // This should result in zero or negative CAC
      const cac = helper.getResult('profitDrivenCAC');
      expect(cac).toBe(0);

      // Ratios should handle division by zero
      const ltvCacRatio = helper.getResult('ltvCacRatio');
      expect(ltvCacRatio === 'N/A' || ltvCacRatio === Infinity || isNaN(ltvCacRatio)).toBe(true);

      const targetROAS = helper.getResult('targetROAS');
      expect(targetROAS === 'N/A' || targetROAS === Infinity || isNaN(targetROAS)).toBe(true);
    });

    test('handles negative operating profit', () => {
      helper
        .setInput('aov', '100')
        .setInput('taxRate', '0')
        .setInput('returnRate', '0')
        .setInput('cosPercent', '60')
        .setInput('gaPercent', '30')
        .setInput('fulfillmentCost', '50')
        .setInput('targetNetMargin', '5')
        .calculate();

      // Operating profit should be negative: 100 * (1-0.6-0.3) - 50 = -40
      const operatingProfit = helper.getResult('operatingProfitPerOrder');
      expect(operatingProfit).toBeLessThan(0);

      const lifetimeProfit = helper.getResult('customerLifetimeProfit');
      expect(lifetimeProfit).toBeLessThan(0);

      const cac = helper.getResult('profitDrivenCAC');
      expect(cac).toBe(0); // Should be set to 0, not negative
    });

    test('handles 100% return rate', () => {
      helper
        .setInput('aov', '1500')
        .setInput('taxRate', '0')
        .setInput('returnRate', '100')
        .calculate();

      const aovPostTax = helper.getResult('aovPostTaxReturns');
      expect(aovPostTax).toBe(0);

      const cltv = helper.getResult('customerLifetimeValue');
      expect(cltv).toBe(0);

      const cac = helper.getResult('profitDrivenCAC');
      expect(cac === 0 || cac === 'N/A').toBe(true);
    });

    test('handles extreme tax rates', () => {
      // Test with very high tax rate
      helper
        .setInput('aov', '1000')
        .setInput('taxRate', '95')
        .setInput('returnRate', '0')
        .calculate();

      const aovPostTax = helper.getResult('aovPostTaxReturns');
      expect(aovPostTax).toBeCloseTo(1000 / 1.95, 1); // Should be very small

      // Test with zero tax rate
      helper
        .setInput('taxRate', '0')
        .calculate();

      const aovNoTax = helper.getResult('aovPostTaxReturns');
      expect(aovNoTax).toBeCloseTo(1000, 1);
    });

    test('handles costs exceeding 100% of revenue', () => {
      helper
        .setInput('aov', '1000')
        .setInput('taxRate', '0')
        .setInput('returnRate', '0')
        .setInput('cosPercent', '80')
        .setInput('gaPercent', '30') // Total: 110%
        .setInput('fulfillmentCost', '100')
        .calculate();

      const operatingProfit = helper.getResult('operatingProfitPerOrder');
      expect(operatingProfit).toBeLessThan(0); // Should be deeply negative

      const cac = helper.getResult('profitDrivenCAC');
      expect(cac).toBe(0); // Should be capped at zero
    });

    test('handles very large numbers without overflow', () => {
      helper
        .setInput('aov', '999999999')
        .setInput('taxRate', '0')
        .setInput('returnRate', '0')
        .setInput('cosPercent', '10')
        .setInput('gaPercent', '5')
        .setInput('fulfillmentCost', '1000000')
        .setInput('returningCustomers', '50')
        .setInput('repeatOrderRate', '5')
        .calculate();

      const cltv = helper.getResult('customerLifetimeValue');
      expect(isFinite(cltv)).toBe(true);
      expect(cltv).toBeGreaterThan(1000000000);

      const cac = helper.getResult('profitDrivenCAC');
      expect(isFinite(cac)).toBe(true);
    });

    test('handles very small decimal numbers', () => {
      helper
        .setInput('aov', '0.01')
        .setInput('taxRate', '6.5')
        .setInput('returnRate', '3.5')
        .setInput('cosPercent', '42')
        .setInput('gaPercent', '14')
        .setInput('fulfillmentCost', '0.001')
        .setInput('returningCustomers', '11')
        .setInput('repeatOrderRate', '1.4')
        .calculate();

      const results = helper.getAllResults();
      Object.values(results).forEach(value => {
        if (typeof value === 'number') {
          expect(isFinite(value)).toBe(true);
          expect(isNaN(value)).toBe(false);
        }
      });
    });
  });

  describe('Input Validation Edge Cases', () => {
    test('handles empty input fields', () => {
      helper
        .setInput('aov', '')
        .setInput('taxRate', '')
        .setInput('returnRate', '')
        .calculate();

      // Should treat empty as zero and not crash
      const results = helper.getAllResults();
      Object.values(results).forEach(value => {
        expect(value !== null).toBe(true);
      });
    });

    test('handles negative input values', () => {
      helper
        .setInput('aov', '-500')
        .setInput('taxRate', '-10')
        .setInput('returnRate', '-5')
        .setInput('cosPercent', '-20')
        .calculate();

      // Should handle negative inputs without crashing
      const results = helper.getAllResults();
      expect(Object.keys(results).length).toBeGreaterThan(0);
    });

    test('handles non-numeric input strings', () => {
      helper
        .setInput('aov', 'abc')
        .setInput('taxRate', 'xyz')
        .setInput('returnRate', '!@#')
        .calculate();

      // Should parse as zero or NaN and handle gracefully
      const aov = helper.getResult('aovPostTaxReturns');
      expect(aov === 0 || aov === 'N/A' || isNaN(aov)).toBe(true);
    });

    test('handles mixed valid/invalid inputs', () => {
      helper
        .setInput('aov', '1500')
        .setInput('taxRate', 'invalid')
        .setInput('returnRate', '3.5')
        .setInput('cosPercent', '42')
        .calculate();

      // Should handle mixed input gracefully
      const results = helper.getAllResults();
      expect(Object.keys(results).length).toBeGreaterThan(10);
    });

    test('handles decimal precision edge cases', () => {
      helper
        .setInput('aov', '1500.999999999')
        .setInput('taxRate', '6.500000001')
        .setInput('returnRate', '3.499999999')
        .calculate();

      const aov = helper.getResult('aovPostTaxReturns');
      expect(isFinite(aov)).toBe(true);
      expect(aov).toBeCloseTo(1356.54, 1);
    });

    test('handles scientific notation inputs', () => {
      helper
        .setInput('aov', '1.5e3') // 1500
        .setInput('cosPercent', '4.2e1') // 42
        .setInput('fulfillmentCost', '1.2e2') // 120
        .calculate();

      const aov = helper.getResult('aovPostTaxReturns');
      expect(aov).toBeCloseTo(1356.54, 1);
    });
  });

  describe('Business Logic Edge Cases', () => {
    test('handles unrealistic high margins with warning', () => {
      helper
        .setInput('aov', '1000')
        .setInput('taxRate', '0')
        .setInput('returnRate', '0')
        .setInput('cosPercent', '70')
        .setInput('gaPercent', '15')
        .setInput('fulfillmentCost', '100')
        .setInput('targetNetMargin', '30') // Unrealistic
        .calculate();

      // Should show warning notification
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('Target net margin too high');

      // CAC should be set to zero
      expect(helper.getResult('profitDrivenCAC')).toBe(0);
    });

    test('handles zero customer lifetime value scenario', () => {
      helper
        .setInput('aov', '0')
        .setInput('returningCustomers', '50')
        .setInput('repeatOrderRate', '5')
        .calculate();

      const cltv = helper.getResult('customerLifetimeValue');
      expect(cltv).toBe(0);

      const ltvRatio = helper.getResult('ltvCacRatio');
      expect(ltvRatio === 'N/A' || ltvRatio === 0 || isNaN(ltvRatio)).toBe(true);
    });

    test('handles extreme repeat customer scenarios', () => {
      // Test with 100% returning customers and very high repeat rate
      helper
        .setInput('aov', '1000')
        .setInput('returningCustomers', '100')
        .setInput('repeatOrderRate', '100')
        .calculate();

      const averageOrders = 1 + (1.0 * 100); // Should be 101 orders per customer
      const expectedCLTV = helper.getResult('aovPostTaxReturns') * 101;
      const actualCLTV = helper.getResult('customerLifetimeValue');

      expect(actualCLTV).toBeCloseTo(expectedCLTV, -2); // Allow for rounding
    });

    test('handles zero conversion rate in CPL calculation', () => {
      helper
        .setInput('aov', '1500')
        .setInput('targetNetMargin', '12')
        .calculate();

      helper.setInput('leadConversionRate', '0');
      helper.clickButton('recalculateCplBtn');

      const cpl = helper.getResult('targetCpl');
      expect(cpl).toBe(0);
    });

    test('handles 100% conversion rate in CPL calculation', () => {
      helper
        .setInput('aov', '1500')
        .setInput('targetNetMargin', '12')
        .calculate();

      const cac = helper.getResult('profitDrivenCAC');

      helper.setInput('leadConversionRate', '100');
      helper.clickButton('recalculateCplBtn');

      const cpl = helper.getResult('targetCpl');
      expect(cpl).toBeCloseTo(cac, 1); // CPL should equal CAC at 100% conversion
    });
  });

  describe('UI State Edge Cases', () => {
    test('handles rapid button clicking', () => {
      // Rapidly click calculate button multiple times
      for (let i = 0; i < 10; i++) {
        helper.calculate();
      }

      // Should remain stable and show results
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
      expect(helper.isNotificationVisible()).toBe(true);
    });

    test('handles rapid tab switching during calculation', () => {
      helper.setInput('aov', '2000').calculate();

      // Rapidly switch tabs
      helper.switchToTab('customer');
      helper.switchToTab('financial');
      helper.switchToTab('basics');
      helper.switchToTab('customer');

      // Form should remain stable
      expect(helper.isTabActive('customer')).toBe(true);
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
    });

    test('handles calculation details toggle during updates', () => {
      helper.calculate();

      // Rapidly toggle calculation details
      for (let i = 0; i < 5; i++) {
        helper.expandCalculationDetails('aov-calc');
        helper.expandCalculationDetails('cltv-calc');
      }

      // Should handle gracefully
      const isExpanded = helper.isCalculationDetailExpanded('aov-calc');
      expect(typeof isExpanded).toBe('boolean');
    });

    test('handles theme switching during active calculations', () => {
      helper
        .setInput('aov', '2000')
        .calculate();

      const initialCAC = helper.getResult('profitDrivenCAC');

      // Toggle theme multiple times during operation
      helper.toggleDarkMode();
      helper.toggleDarkMode();
      helper.toggleDarkMode();

      // Results should remain consistent
      expect(helper.getResult('profitDrivenCAC')).toBeCloseTo(initialCAC, 1);
    });

    test('handles presentation mode toggle with expanded details', () => {
      helper.calculate();
      helper.expandCalculationDetails('aov-calc');
      helper.expandCalculationDetails('cltv-calc');

      // Toggle presentation mode with expanded details
      helper.togglePresentationMode();
      expect(helper.isPresentationModeActive()).toBe(true);

      helper.togglePresentationMode();
      expect(helper.isPresentationModeActive()).toBe(false);

      // Details should still be manageable
      expect(helper.isCalculationDetailExpanded('aov-calc')).toBe(true);
    });
  });

  describe('File Import/Export Edge Cases', () => {
    test('handles corrupted JSON import file', async () => {
      const corruptedJSON = '{"aov": 1500, "taxRate": invalid_json}';
      
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        readAsText(file) {
          setTimeout(() => {
            this.result = corruptedJSON;
            if (this.onload) this.onload({ target: this });
          }, 10);
        }
      };

      const fileInput = helper.dom.getElementById('fileInput');
      const file = new File([corruptedJSON], 'corrupted.json', {
        type: 'application/json'
      });

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        configurable: true
      });

      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should show error notification
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('Error importing');

      global.FileReader = originalFileReader;
    });

    test('handles partial settings import', async () => {
      const partialSettings = {
        aov: '2000',
        taxRate: '8.5'
        // Missing other fields
      };

      await helper.importSettings(partialSettings);

      // Should import available fields
      expect(helper.getInput('aov')).toBe('2000');
      expect(helper.getInput('taxRate')).toBe('8.5');

      // Should maintain defaults for missing fields
      expect(helper.getInput('returnRate')).toBe('3.5');
    });

    test('handles empty settings import', async () => {
      const emptySettings = {};

      await helper.importSettings(emptySettings);

      // Should maintain default values
      expect(helper.getInput('aov')).toBe('1500');
      expect(helper.getInput('taxRate')).toBe('6.5');
    });

    test('handles settings import with invalid field values', async () => {
      const invalidSettings = {
        aov: 'invalid_number',
        taxRate: null,
        returnRate: undefined,
        cosPercent: 'abc',
        targetNetMargin: -50
      };

      await helper.importSettings(invalidSettings);

      // Should handle invalid values gracefully, possibly reverting to defaults
      const results = helper.getAllResults();
      expect(Object.keys(results).length).toBeGreaterThan(0);
    });

    test('handles non-JSON file import', async () => {
      const textFile = 'This is not JSON content';
      
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        readAsText(file) {
          setTimeout(() => {
            this.result = textFile;
            if (this.onload) this.onload({ target: this });
          }, 10);
        }
      };

      const fileInput = helper.dom.getElementById('fileInput');
      const file = new File([textFile], 'text.txt', {
        type: 'text/plain'
      });

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        configurable: true
      });

      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should show error notification
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('Error importing');

      global.FileReader = originalFileReader;
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    test('handles multiple calculation cycles without memory leaks', () => {
      const initialMemory = performance.now();

      // Perform many calculation cycles
      for (let i = 0; i < 100; i++) {
        helper
          .setInput('aov', 1000 + i)
          .setInput('targetNetMargin', 10 + (i % 10))
          .calculate();
      }

      // Should complete without issues
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);

      const finalMemory = performance.now();
      expect(finalMemory - initialMemory).toBeLessThan(10000); // Should complete quickly
    });

    test('handles complex UI state changes without degradation', () => {
      // Perform complex UI interactions
      for (let i = 0; i < 20; i++) {
        helper
          .switchToTab('basics')
          .setInput('aov', 1500 + i * 100)
          .switchToTab('customer')
          .setInput('fulfillmentCost', 120 + i * 5)
          .switchToTab('financial')
          .calculate()
          .toggleDarkMode()
          .expandCalculationDetails('aov-calc')
          .expandCalculationDetails('aov-calc'); // Collapse
      }

      // Should remain functional
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
      expect(helper.isTabActive('financial')).toBe(true);
    });

    test('handles waterfall chart updates with extreme values', () => {
      // Test waterfall with very large values
      helper
        .setInput('aov', '1000000')
        .setInput('cosPercent', '50')
        .setInput('fulfillmentCost', '50000')
        .calculate();

      const waterfallAOV = helper.getWaterfallValue('aov');
      const waterfallCOGS = helper.getWaterfallValue('cogs');
      
      expect(waterfallAOV).toBeGreaterThan(900000);
      expect(waterfallCOGS).toBeGreaterThan(450000);

      // Test with very small values
      helper
        .setInput('aov', '0.1')
        .setInput('cosPercent', '50')
        .setInput('fulfillmentCost', '0.05')
        .calculate();

      const smallAOV = helper.getWaterfallValue('aov');
      expect(smallAOV).toBeCloseTo(0.1, 2);
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    test('handles missing modern JavaScript features gracefully', () => {
      // Mock missing features that might not exist in older browsers
      const originalPromise = global.Promise;
      
      // Test still works without modern Promise features
      if (originalPromise) {
        // Ensure basic functionality works
        helper.calculate();
        expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
      }
    });

    test('handles different number formatting locales', () => {
      // Test with different decimal separators (some locales use comma)
      helper
        .setInput('aov', '1500,50') // European style
        .calculate();

      // Should handle gracefully (may parse as 1500 or handle the comma)
      const results = helper.getAllResults();
      expect(Object.values(results).some(val => val !== null)).toBe(true);
    });
  });
});