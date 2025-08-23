// End-to-end test scenarios for complete user workflows
import CalculatorTestHelper from '../utils/calculatorHelpers.js';
import { testDataSets } from '../fixtures/testData.js';

describe('End-to-End User Workflows', () => {
  let helper;

  beforeEach(async () => {
    helper = new CalculatorTestHelper();
    await helper.setup();
  });

  afterEach(() => {
    helper.cleanup();
  });

  describe('New User Complete Setup Workflow', () => {
    test('first-time user completes full business analysis', async () => {
      // Scenario: Marketing manager sets up CAC analysis for new business
      
      // Step 1: User loads calculator and sees defaults
      expect(helper.getInput('aov')).toBe('1500');
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);

      // Step 2: Navigate through all tabs entering real business data
      helper.switchToTab('basics');
      expect(helper.isTabActive('basics')).toBe(true);

      // Enter business basics
      helper
        .setInput('aov', '2400')
        .setInput('taxRate', '8.25')
        .setInput('returnRate', '2.5')
        .setInput('cosPercent', '55.0');

      // Navigate to customer metrics
      helper.switchToTab('customer');
      expect(helper.isTabActive('customer')).toBe(true);

      helper
        .setInput('returningCustomers', '18.0')
        .setInput('repeatOrderRate', '1.8')
        .setInput('fulfillmentCost', '180');

      // Navigate to financial targets
      helper.switchToTab('financial');
      expect(helper.isTabActive('financial')).toBe(true);

      helper
        .setInput('gaPercent', '12.5')
        .setInput('targetNetMargin', '15.0');

      // Step 3: Calculate and verify comprehensive results
      helper.calculate();
      
      // Verify key metrics are calculated
      const profitDrivenCAC = helper.getResult('profitDrivenCAC');
      const customerLTV = helper.getResult('customerLifetimeValue');
      const ltvCacRatio = helper.getResult('ltvCacRatio');
      
      expect(profitDrivenCAC).toBeGreaterThan(0);
      expect(customerLTV).toBeGreaterThan(2000);
      expect(ltvCacRatio).toBeGreaterThan(2);

      // Step 4: User explores calculation details
      helper.expandCalculationDetails('cltv-calc');
      expect(helper.isCalculationDetailExpanded('cltv-calc')).toBe(true);

      helper.expandCalculationDetails('profit-cac-calc');
      expect(helper.isCalculationDetailExpanded('profit-cac-calc')).toBe(true);

      // Verify formulas are displayed
      const cltvFormula = helper.getCalculationDetail('cltv-calc', 'calc-formula');
      expect(cltvFormula).toContain('AOV');

      // Step 5: Configure lead funnel modeling
      helper.setInput('leadConversionRate', '12.5');
      helper.clickButton('recalculateCplBtn');
      
      const targetCPL = helper.getResult('targetCpl');
      expect(targetCPL).toBeGreaterThan(0);
      expect(targetCPL).toBeLessThan(profitDrivenCAC);

      // Step 6: Verify waterfall chart updates
      const waterfallAOV = helper.getWaterfallValue('aov');
      const waterfallNet = helper.getWaterfallValue('net');
      
      expect(waterfallAOV).toBeCloseTo(2400 / 1.0825 * 0.975, 10);
      expect(waterfallNet).toBeGreaterThan(0);

      // Verify success notification
      expect(helper.isNotificationVisible()).toBe(true);
    });

    test('user handles unrealistic margin scenario', async () => {
      // Scenario: User enters business data that results in impossible margins
      
      helper
        .switchToTab('basics')
        .setInput('aov', '500')
        .setInput('cosPercent', '75.0')
        .switchToTab('customer')
        .setInput('fulfillmentCost', '200')
        .switchToTab('financial')
        .setInput('gaPercent', '20.0')
        .setInput('targetNetMargin', '25.0')
        .calculate();

      // Should show warning and set CAC to zero
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('Target net margin too high');
      expect(helper.getResult('profitDrivenCAC')).toBe(0);

      // User adjusts to realistic margin
      helper
        .setInput('targetNetMargin', '8.0')
        .calculate();

      // Now should have positive CAC
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
    });
  });

  describe('Settings Management Workflow', () => {
    test('user saves, resets, and reloads business scenario', async () => {
      // Scenario: Business analyst comparing different scenarios
      
      // Step 1: Set up first scenario (High Margin Business)
      const scenario1 = testDataSets.highMarginBusiness;
      Object.entries(scenario1).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper.calculate();
      const scenario1CAC = helper.getResult('profitDrivenCAC');
      expect(scenario1CAC).toBeGreaterThan(500); // High margin should allow high CAC

      // Step 2: Save this scenario
      const savedFile = await helper.saveSettings();
      expect(savedFile).toBeTruthy();
      expect(savedFile.blob).toBeTruthy();

      // Step 3: Reset to defaults
      helper.reset();
      expect(helper.getInput('aov')).toBe('1500'); // Back to defaults
      expect(helper.getResult('profitDrivenCAC')).toBeLessThan(scenario1CAC);

      // Step 4: Import saved scenario
      await helper.importSettings(scenario1);
      
      // Verify all settings restored
      expect(helper.getInput('aov')).toBe(scenario1.aov.toString());
      expect(helper.getInput('targetNetMargin')).toBe(scenario1.targetNetMargin.toString());
      
      // Verify calculations automatically updated
      const restoredCAC = helper.getResult('profitDrivenCAC');
      expect(restoredCAC).toBeCloseTo(scenario1CAC, 10);

      // Step 5: Compare with different scenario
      const scenario2 = testDataSets.lowMarginBusiness;
      Object.entries(scenario2).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper.calculate();
      const scenario2CAC = helper.getResult('profitDrivenCAC');
      
      // Low margin business should have much lower CAC
      expect(scenario2CAC).toBeLessThan(scenario1CAC / 2);
    });

    test('user handles import error gracefully', async () => {
      // Scenario: User tries to import corrupted/invalid settings file
      
      // Try to import invalid JSON
      const invalidSettings = '{ invalid json }';
      
      // Mock FileReader to return invalid JSON
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        readAsText(file) {
          setTimeout(() => {
            this.result = invalidSettings;
            if (this.onload) this.onload({ target: this });
          }, 10);
        }
      };

      const fileInput = helper.dom.getElementById('fileInput');
      const file = new File([invalidSettings], 'invalid_settings.json', {
        type: 'application/json'
      });

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        configurable: true
      });

      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should show error notification and not change form
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('Error importing');
      
      // Form should remain unchanged
      expect(helper.getInput('aov')).toBe('1500'); // Still at defaults

      global.FileReader = originalFileReader;
    });
  });

  describe('Presentation Mode Workflow', () => {
    test('user prepares and delivers client presentation', async () => {
      // Scenario: Marketing manager preparing for client meeting
      
      // Step 1: Set up client's business data
      const clientData = {
        aov: 3200,
        taxRate: 7.5,
        returnRate: 1.8,
        cosPercent: 38.5,
        gaPercent: 11.2,
        fulfillmentCost: 225,
        returningCustomers: 22.0,
        repeatOrderRate: 2.1,
        targetNetMargin: 18.0
      };

      Object.entries(clientData).forEach(([key, value]) => {
        helper.setInput(key, value);
      });

      helper.calculate();
      
      // Step 2: Verify key metrics for presentation
      const profitCAC = helper.getResult('profitDrivenCAC');
      const targetROAS = helper.getResult('targetROAS');
      const ltvRatio = helper.getResult('ltvCacRatio');
      
      expect(profitCAC).toBeGreaterThan(800); // Should be substantial
      expect(targetROAS).toBeGreaterThan(3);
      expect(ltvRatio).toBeGreaterThan(3); // Healthy ratio

      // Step 3: Activate presentation mode
      helper.togglePresentationMode();
      expect(helper.isPresentationModeActive()).toBe(true);
      
      // Input panel should be hidden
      const topPanel = helper.dom.getElementById('topPanel');
      expect(topPanel.style.maxHeight === '0px' || 
             helper.dom.body.classList.contains('presentation-mode-active')).toBe(true);

      // Floating button should be visible
      const floatingBtn = helper.dom.getElementById('floatingCalculate');
      expect(floatingBtn.style.display !== 'none').toBe(true);

      // Step 4: Make quick adjustment during presentation
      helper.togglePresentationMode(); // Exit to make changes
      helper.setInput('targetNetMargin', '15.0'); // Client wants lower margin
      helper.togglePresentationMode(); // Back to presentation

      // Results should update
      const adjustedCAC = helper.getResult('profitDrivenCAC');
      expect(adjustedCAC).toBeGreaterThan(profitCAC); // Lower margin = higher allowable CAC

      // Step 5: Exit presentation mode
      helper.togglePresentationMode();
      expect(helper.isPresentationModeActive()).toBe(false);
    });

    test('floating calculate button works in presentation mode', async () => {
      helper
        .setInput('aov', '1800')
        .setInput('targetNetMargin', '10')
        .calculate();

      const initialCAC = helper.getResult('profitDrivenCAC');

      // Enter presentation mode
      helper.togglePresentationMode();
      
      // Change a value and use floating button to recalculate
      // (Note: This test assumes there's a way to change values in presentation mode)
      helper.setInput('targetNetMargin', '8'); // More aggressive margin
      
      // Click floating calculate button
      helper.clickButton('floatingCalculate');
      
      const newCAC = helper.getResult('profitDrivenCAC');
      expect(newCAC).toBeGreaterThan(initialCAC);
    });
  });

  describe('Advanced Analysis Workflow', () => {
    test('power user performs comprehensive business analysis', async () => {
      // Scenario: CFO performing detailed unit economics analysis
      
      // Step 1: Set up current business metrics
      const currentMetrics = testDataSets.versaTubeDefaults;
      Object.entries(currentMetrics).forEach(([key, value]) => {
        helper.setInput(key, value);
      });
      
      helper.calculate();
      const baselineCAC = helper.getResult('profitDrivenCAC');
      const baselineLTV = helper.getResult('customerLifetimeValue');
      
      // Step 2: Analyze impact of improving customer retention
      helper
        .setInput('returningCustomers', '25.0') // Improve from 11% to 25%
        .setInput('repeatOrderRate', '2.2') // More orders from repeats
        .calculate();
        
      const improvedLTV = helper.getResult('customerLifetimeValue');
      const improvedCAC = helper.getResult('profitDrivenCAC');
      
      expect(improvedLTV).toBeGreaterThan(baselineLTV * 1.5);
      expect(improvedCAC).toBeGreaterThan(baselineCAC * 1.5);

      // Step 3: Analyze waterfall chart to understand cost structure
      const waterfallCOGS = helper.getWaterfallValue('cogs');
      const waterfallGA = helper.getWaterfallValue('ga');
      const waterfallNet = helper.getWaterfallValue('net');
      
      expect(waterfallCOGS).toBeGreaterThan(waterfallGA); // COGS should be larger
      expect(waterfallNet).toBeGreaterThan(0); // Profitable

      // Step 4: Explore calculation details for understanding
      helper.expandCalculationDetails('cltv-calc');
      helper.expandCalculationDetails('profit-cac-calc');
      helper.expandCalculationDetails('ltv-cac-calc');
      
      // Verify all details are expanded
      expect(helper.isCalculationDetailExpanded('cltv-calc')).toBe(true);
      expect(helper.isCalculationDetailExpanded('profit-cac-calc')).toBe(true);
      expect(helper.isCalculationDetailExpanded('ltv-cac-calc')).toBe(true);

      // Step 5: Test sensitivity to margin changes
      const margins = [8, 10, 12, 15, 18];
      const cacValues = [];
      
      for (const margin of margins) {
        helper.setInput('targetNetMargin', margin).calculate();
        cacValues.push(helper.getResult('profitDrivenCAC'));
      }
      
      // CAC should decrease as target margin increases
      expect(cacValues[0]).toBeGreaterThan(cacValues[cacValues.length - 1]);
      
      // Step 6: Optimize lead conversion funnel
      helper.setInput('leadConversionRate', '8.0'); // Lower conversion
      helper.clickButton('recalculateCplBtn');
      const lowConversionCPL = helper.getResult('targetCpl');
      
      helper.setInput('leadConversionRate', '15.0'); // Higher conversion
      helper.clickButton('recalculateCplBtn');
      const highConversionCPL = helper.getResult('targetCpl');
      
      expect(highConversionCPL).toBeGreaterThan(lowConversionCPL * 1.5);
    });

    test('user identifies business optimization opportunities', async () => {
      // Scenario: Business consultant analyzing optimization potential
      
      // Step 1: Analyze current poor-performing business
      const poorBusiness = testDataSets.lowMarginBusiness;
      Object.entries(poorBusiness).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper.calculate();
      const poorCAC = helper.getResult('profitDrivenCAC');
      const poorLTVRatio = helper.getResult('ltvCacRatio');
      
      expect(poorCAC).toBeLessThan(100); // Very low CAC allowable
      expect(poorLTVRatio).toBeLessThan(3); // Poor ratio

      // Step 2: Test impact of reducing fulfillment costs
      helper.setInput('fulfillmentCost', '40').calculate(); // Reduce from 75 to 40
      const improvedFulfillmentCAC = helper.getResult('profitDrivenCAC');
      expect(improvedFulfillmentCAC).toBeGreaterThan(poorCAC);

      // Step 3: Test impact of improving product margins
      helper.setInput('cosPercent', '55.0').calculate(); // Reduce from 65% to 55%
      const improvedMarginCAC = helper.getResult('profitDrivenCAC');
      expect(improvedMarginCAC).toBeGreaterThan(improvedFulfillmentCAC);

      // Step 4: Test impact of customer retention improvements
      helper
        .setInput('returningCustomers', '15.0') // Improve from 5% to 15%
        .setInput('repeatOrderRate', '1.8') // Improve from 1.1 to 1.8
        .calculate();
        
      const improvedRetentionCAC = helper.getResult('profitDrivenCAC');
      const improvedRetentionLTV = helper.getResult('customerLifetimeValue');
      
      expect(improvedRetentionCAC).toBeGreaterThan(improvedMarginCAC * 1.5);
      expect(improvedRetentionLTV).toBeGreaterThan(poorBusiness.aov * 1.3);

      // Step 5: Verify business is now healthy
      const finalLTVRatio = helper.getResult('ltvCacRatio');
      expect(finalLTVRatio).toBeGreaterThan(3); // Now healthy
    });
  });

  describe('Error Recovery Workflow', () => {
    test('user recovers from invalid input scenarios', async () => {
      // Step 1: Enter obviously wrong data
      helper
        .setInput('aov', '0')
        .setInput('cosPercent', '150') // Over 100%
        .setInput('returnRate', '50') // Very high return rate
        .calculate();

      // Should handle gracefully without crashing
      const results = helper.getAllResults();
      expect(Object.values(results).some(val => val !== null)).toBe(true);

      // Step 2: Correct the errors
      helper
        .setInput('aov', '1200')
        .setInput('cosPercent', '60')
        .setInput('returnRate', '4')
        .calculate();

      // Should now show reasonable results
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
      expect(helper.getResult('customerLifetimeValue')).toBeGreaterThan(1000);
    });

    test('user handles system notification and continues workflow', async () => {
      // Generate warning scenario
      const data = testDataSets.unrealisticHighMargin;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper.calculate();
      
      // Should show warning
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getResult('profitDrivenCAC')).toBe(0);

      // User adjusts and continues
      helper.setInput('targetNetMargin', '10').calculate();
      
      // Should now work normally
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
      
      // Success notification should appear
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('completed');
    });
  });

  describe('Multi-Tab Complex Workflow', () => {
    test('user navigates complex multi-tab data entry efficiently', async () => {
      // Scenario: Detailed business setup across all tabs with validation
      
      // Step 1: Business Basics - E-commerce business
      helper.switchToTab('basics');
      helper
        .setInput('aov', '2800')
        .setInput('taxRate', '8.875') // NY tax rate
        .setInput('returnRate', '3.2')
        .setInput('cosPercent', '45.5');

      // Step 2: Customer Metrics - Growing retention
      helper.switchToTab('customer');
      helper
        .setInput('returningCustomers', '28.5')
        .setInput('repeatOrderRate', '2.4')
        .setInput('fulfillmentCost', '165');

      // Step 3: Financial Targets - Aggressive growth
      helper.switchToTab('financial');
      helper
        .setInput('gaPercent', '15.8')
        .setInput('targetNetMargin', '12.5');

      // Step 4: Calculate comprehensive results
      helper.calculate();
      
      const finalCAC = helper.getResult('profitDrivenCAC');
      const finalLTV = helper.getResult('customerLifetimeValue');
      const finalRatio = helper.getResult('ltvCacRatio');
      
      expect(finalCAC).toBeGreaterThan(1000);
      expect(finalLTV).toBeGreaterThan(5000);
      expect(finalRatio).toBeGreaterThan(4);

      // Step 5: Validate across all tabs that data is preserved
      helper.switchToTab('basics');
      expect(helper.getInput('aov')).toBe('2800');
      expect(helper.getInput('taxRate')).toBe('8.875');

      helper.switchToTab('customer');
      expect(helper.getInput('returningCustomers')).toBe('28.5');
      expect(helper.getInput('fulfillmentCost')).toBe('165');

      helper.switchToTab('financial');
      expect(helper.getInput('targetNetMargin')).toBe('12.5');

      // Step 6: Results should remain consistent across tab switches
      helper.switchToTab('basics');
      expect(helper.getResult('profitDrivenCAC')).toBeCloseTo(finalCAC, 1);
      
      helper.switchToTab('customer');
      expect(helper.getResult('customerLifetimeValue')).toBeCloseTo(finalLTV, 1);
    });
  });
});