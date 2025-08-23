// Integration tests for UI component interactions
import CalculatorTestHelper from '../utils/calculatorHelpers.js';
import { testDataSets } from '../fixtures/testData.js';

describe('UI Component Integration Tests', () => {
  let helper;

  beforeEach(async () => {
    helper = new CalculatorTestHelper();
    await helper.setup();
  });

  afterEach(() => {
    helper.cleanup();
  });

  describe('Tab Navigation and Form State', () => {
    test('tab switching preserves input values', () => {
      // Fill out Business Basics tab
      helper
        .switchToTab('basics')
        .setInput('aov', '2000')
        .setInput('taxRate', '8.5');

      // Switch to Customer Metrics and fill
      helper
        .switchToTab('customer')
        .setInput('returningCustomers', '15')
        .setInput('fulfillmentCost', '150');

      // Switch to Financial Targets and fill
      helper
        .switchToTab('financial')
        .setInput('gaPercent', '12')
        .setInput('targetNetMargin', '15');

      // Verify tab switching works
      expect(helper.isTabActive('financial')).toBe(true);

      // Go back to first tab and verify values preserved
      helper.switchToTab('basics');
      expect(helper.isTabActive('basics')).toBe(true);
      expect(helper.getInput('aov')).toBe('2000');
      expect(helper.getInput('taxRate')).toBe('8.5');

      // Check other tabs maintained their values
      helper.switchToTab('customer');
      expect(helper.getInput('returningCustomers')).toBe('15');
      expect(helper.getInput('fulfillmentCost')).toBe('150');

      helper.switchToTab('financial');
      expect(helper.getInput('gaPercent')).toBe('12');
      expect(helper.getInput('targetNetMargin')).toBe('15');
    });

    test('form validation works across tabs', () => {
      // Test that required fields work across tabs
      helper
        .switchToTab('basics')
        .setInput('aov', '')
        .calculate();

      // Should handle empty required field gracefully
      const aovResult = helper.getResult('aovPostTaxReturns');
      expect(aovResult === 0 || aovResult === 'N/A').toBe(true);
    });

    test('calculations persist during tab navigation', () => {
      const data = testDataSets.versaTubeDefaults;
      
      // Fill all inputs across tabs
      helper.switchToTab('basics');
      helper
        .setInput('aov', data.aov)
        .setInput('taxRate', data.taxRate)
        .setInput('returnRate', data.returnRate)
        .setInput('cosPercent', data.cosPercent);

      helper.switchToTab('customer');
      helper
        .setInput('returningCustomers', data.returningCustomers)
        .setInput('repeatOrderRate', data.repeatOrderRate)
        .setInput('fulfillmentCost', data.fulfillmentCost);

      helper.switchToTab('financial');
      helper
        .setInput('gaPercent', data.gaPercent)
        .setInput('targetNetMargin', data.targetNetMargin);

      // Calculate results
      helper.calculate();
      const initialCAC = helper.getResult('profitDrivenCAC');

      // Switch tabs and verify results persist
      helper.switchToTab('basics');
      expect(helper.getResult('profitDrivenCAC')).toBeCloseTo(initialCAC, 2);

      helper.switchToTab('customer');
      expect(helper.getResult('profitDrivenCAC')).toBeCloseTo(initialCAC, 2);
    });
  });

  describe('Real-time Calculation Updates', () => {
    test('calculation details update when inputs change', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });

      helper.calculate();

      // Expand calculation details for AOV
      helper.expandCalculationDetails('aov-calc');
      expect(helper.isCalculationDetailExpanded('aov-calc')).toBe(true);

      // Change AOV and verify details update
      helper.setInput('aov', '2000');
      
      // Details should update (even without explicit recalculation in some implementations)
      const calcStep = helper.getCalculationDetail('aov-calc', 'aov-calc-step');
      expect(calcStep).toContain('2000');
    });

    test('CPL recalculates when conversion rate changes', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        helper.setInput(key, value);
      });

      helper.calculate();
      const initialCPL = helper.getResult('targetCpl');

      // Change conversion rate
      helper.setInput('leadConversionRate', '20');
      
      // CPL should update automatically or after recalculate button
      helper.clickButton('recalculateCplBtn');
      const newCPL = helper.getResult('targetCpl');

      expect(newCPL).toBeCloseTo(initialCPL * 2, 1);
    });

    test('waterfall chart updates with input changes', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });

      helper.calculate();
      const initialAOV = helper.getWaterfallValue('aov');

      // Change AOV
      helper.setInput('aov', '3000').calculate();
      const newAOV = helper.getWaterfallValue('aov');

      expect(newAOV).toBeGreaterThan(initialAOV);
      expect(newAOV).toBeCloseTo(3000 / 1.065 * 0.965, 10); // Adjusted for tax and returns
    });

    test('waterfall bar heights update with values', () => {
      helper
        .setInput('aov', '1000')
        .setInput('taxRate', '0')
        .setInput('returnRate', '0')
        .setInput('cosPercent', '50')
        .setInput('fulfillmentCost', '100')
        .calculate();

      // Wait for animation to complete
      setTimeout(() => {
        const aovHeight = helper.getWaterfallBarHeight('aov');
        const cogsHeight = helper.getWaterfallBarHeight('cogs');

        // AOV bar should be taller than COGS bar (1000 vs 500)
        expect(aovHeight).toBeGreaterThan(cogsHeight);
      }, 200);
    });
  });

  describe('Button and Control Interactions', () => {
    test('calculate button triggers full computation', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });

      // Before calculation
      expect(helper.getResult('profitDrivenCAC')).toBeLessThan(100);

      helper.calculate();

      // After calculation
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(200);
    });

    test('reset button clears all inputs and results', () => {
      const data = testDataSets.highMarginBusiness;
      Object.entries(data).forEach(([key, value]) => {
        helper.setInput(key, value);
      });

      helper.calculate();
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);

      helper.reset();

      // Verify form reset to defaults
      expect(helper.getInput('aov')).toBe('1500');
      expect(helper.getInput('taxRate')).toBe('6.5');
      expect(helper.getInput('targetNetMargin')).toBe('12.0');

      // Verify results cleared/reset
      const resetCAC = helper.getResult('profitDrivenCAC');
      expect(resetCAC).toBeLessThan(data.aov); // Should be much smaller after reset
    });

    test('recalculate CPL button updates CPL section', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        helper.setInput(key, value);
      });

      helper.calculate();
      const initialCPL = helper.getResult('targetCpl');

      // Change only conversion rate (not triggering full calculate)
      helper.setInput('leadConversionRate', '15');
      helper.clickButton('recalculateCplBtn');

      const newCPL = helper.getResult('targetCpl');
      expect(newCPL).toBeCloseTo(initialCPL * 1.5, 1);
    });
  });

  describe('Calculation Details Expansion', () => {
    test('calculation details expand and collapse correctly', () => {
      helper.calculate();

      // Initially collapsed
      expect(helper.isCalculationDetailExpanded('aov-calc')).toBe(false);

      // Expand
      helper.expandCalculationDetails('aov-calc');
      expect(helper.isCalculationDetailExpanded('aov-calc')).toBe(true);

      // Collapse again
      helper.expandCalculationDetails('aov-calc');
      expect(helper.isCalculationDetailExpanded('aov-calc')).toBe(false);
    });

    test('multiple calculation details can be expanded simultaneously', () => {
      helper.calculate();

      helper.expandCalculationDetails('aov-calc');
      helper.expandCalculationDetails('cltv-calc');
      helper.expandCalculationDetails('profit-cac-calc');

      expect(helper.isCalculationDetailExpanded('aov-calc')).toBe(true);
      expect(helper.isCalculationDetailExpanded('cltv-calc')).toBe(true);
      expect(helper.isCalculationDetailExpanded('profit-cac-calc')).toBe(true);
    });

    test('calculation details show correct formulas', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });

      helper.calculate();
      helper.expandCalculationDetails('aov-calc');

      const formula = helper.getCalculationDetail('aov-calc', 'calc-formula');
      expect(formula).toContain('AOV');
      expect(formula).toContain('Tax Rate');
      expect(formula).toContain('Return Rate');
    });
  });

  describe('Theme and Presentation Mode', () => {
    test('dark mode toggle changes theme', () => {
      expect(helper.isDarkMode()).toBe(false);

      helper.toggleDarkMode();
      expect(helper.isDarkMode()).toBe(true);

      helper.toggleDarkMode();
      expect(helper.isDarkMode()).toBe(false);
    });

    test('presentation mode hides input panel', () => {
      expect(helper.isPresentationModeActive()).toBe(false);
      expect(helper.isElementVisible('topPanel')).toBe(true);

      helper.togglePresentationMode();
      expect(helper.isPresentationModeActive()).toBe(true);
      
      // In presentation mode, top panel should be hidden
      const topPanel = helper.dom.getElementById('topPanel');
      expect(topPanel.classList.contains('collapsed') || 
             helper.dom.body.classList.contains('presentation-mode-active')).toBe(true);
    });

    test('floating calculate button appears in presentation mode', () => {
      helper.togglePresentationMode();
      expect(helper.isPresentationModeActive()).toBe(true);

      const floatingButton = helper.dom.getElementById('floatingCalculate');
      const computedStyle = helper.dom.defaultView.getComputedStyle(floatingButton);
      
      // In presentation mode, floating button should be visible
      expect(computedStyle.display !== 'none').toBe(true);
    });
  });

  describe('Settings Import/Export Integration', () => {
    test('save settings creates downloadable file', async () => {
      const data = testDataSets.highMarginBusiness;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });

      const download = await helper.saveSettings();
      expect(download).toBeTruthy();
      expect(download.url).toContain('blob:mock-');
    });

    test('import settings restores form values', async () => {
      const testSettings = {
        aov: '2500',
        taxRate: '9.5',
        returnRate: '2.0',
        cosPercent: '35.0',
        gaPercent: '10.0',
        fulfillmentCost: '200',
        returningCustomers: '20.0',
        repeatOrderRate: '2.5',
        targetNetMargin: '18.0'
      };

      await helper.importSettings(testSettings);

      // Verify all values were imported
      expect(helper.getInput('aov')).toBe('2500');
      expect(helper.getInput('taxRate')).toBe('9.5');
      expect(helper.getInput('returnRate')).toBe('2.0');
      expect(helper.getInput('targetNetMargin')).toBe('18.0');
    });

    test('import settings triggers automatic recalculation', async () => {
      const testSettings = {
        aov: '5000',
        taxRate: '0',
        returnRate: '0',
        cosPercent: '20.0',
        gaPercent: '5.0',
        fulfillmentCost: '50',
        returningCustomers: '30.0',
        repeatOrderRate: '2.0',
        targetNetMargin: '10.0'
      };

      await helper.importSettings(testSettings);

      // Results should be calculated automatically after import
      const cac = helper.getResult('profitDrivenCAC');
      expect(cac).toBeGreaterThan(1000); // Should be substantial with these high-value inputs
    });
  });

  describe('Notification System', () => {
    test('success notification appears after calculation', () => {
      helper.calculate();
      
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('completed');
    });

    test('warning notification appears for unrealistic scenarios', () => {
      const data = testDataSets.unrealisticHighMargin;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });

      helper.calculate();
      
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('Target net margin too high');
    });

    test('notification appears after reset', () => {
      helper.reset();
      
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('reset');
    });

    test('presentation mode toggle shows notification', () => {
      helper.togglePresentationMode();
      
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('Presentation mode');
    });
  });

  describe('Form Input Validation and Parsing', () => {
    test('handles decimal input correctly', () => {
      helper
        .setInput('aov', '1500.75')
        .setInput('taxRate', '6.75')
        .setInput('returnRate', '3.25')
        .calculate();

      const aov = helper.getResult('aovPostTaxReturns');
      expect(aov).toBeCloseTo(1356.54, 1); // Should handle decimals properly
    });

    test('handles empty inputs gracefully', () => {
      helper
        .setInput('aov', '')
        .setInput('taxRate', '')
        .calculate();

      // Should not crash and should handle empty inputs as zeros
      const results = helper.getAllResults();
      expect(Object.values(results).some(val => isNaN(val) && val !== 'N/A')).toBe(false);
    });

    test('handles negative inputs appropriately', () => {
      helper
        .setInput('aov', '-100')
        .setInput('taxRate', '-5')
        .calculate();

      // Should handle negative inputs without crashing
      const aov = helper.getResult('aovPostTaxReturns');
      expect(typeof aov === 'number' || aov === 'N/A').toBe(true);
    });

    test('handles very large numbers', () => {
      helper
        .setInput('aov', '999999999')
        .setInput('cosPercent', '10')
        .calculate();

      const cltv = helper.getResult('customerLifetimeValue');
      expect(isFinite(cltv)).toBe(true);
    });
  });

  describe('UI State Consistency', () => {
    test('form maintains state during rapid interactions', () => {
      // Rapidly switch tabs and change inputs
      helper
        .switchToTab('basics')
        .setInput('aov', '1000')
        .switchToTab('customer')
        .setInput('fulfillmentCost', '50')
        .switchToTab('financial')
        .setInput('targetNetMargin', '15')
        .switchToTab('basics');

      expect(helper.getInput('aov')).toBe('1000');
      
      helper.switchToTab('customer');
      expect(helper.getInput('fulfillmentCost')).toBe('50');
    });

    test('calculations remain consistent during UI interactions', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });

      helper.calculate();
      const originalCAC = helper.getResult('profitDrivenCAC');

      // Interact with UI elements
      helper.toggleDarkMode();
      helper.expandCalculationDetails('aov-calc');
      helper.switchToTab('customer');
      helper.switchToTab('basics');

      // Results should remain the same
      expect(helper.getResult('profitDrivenCAC')).toBeCloseTo(originalCAC, 2);
    });
  });
});