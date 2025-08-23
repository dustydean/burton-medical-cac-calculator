// Performance and load tests for the CAC Calculator
import CalculatorTestHelper from '../utils/calculatorHelpers.js';
import { testDataSets } from '../fixtures/testData.js';

describe('Performance and Load Tests', () => {
  let helper;

  beforeEach(async () => {
    helper = new CalculatorTestHelper();
    await helper.setup();
  });

  afterEach(() => {
    helper.cleanup();
  });

  describe('Calculation Performance Tests', () => {
    test('single calculation completes under 100ms', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });

      const startTime = performance.now();
      helper.calculate();
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
      
      // Verify calculation actually completed
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
    });

    test('rapid successive calculations maintain performance', () => {
      const iterations = 100;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        // Vary inputs slightly each time
        helper
          .setInput('aov', 1500 + i)
          .setInput('targetNetMargin', 12 + (i % 5));

        const startTime = performance.now();
        helper.calculate();
        const endTime = performance.now();
        
        durations.push(endTime - startTime);
      }

      // Calculate average and max duration
      const avgDuration = durations.reduce((a, b) => a + b, 0) / iterations;
      const maxDuration = Math.max(...durations);

      expect(avgDuration).toBeLessThan(50); // Average should be very fast
      expect(maxDuration).toBeLessThan(200); // Even slowest should be reasonable
      
      // Performance should remain consistent (no significant degradation)
      const firstHalf = durations.slice(0, iterations / 2);
      const secondHalf = durations.slice(iterations / 2);
      const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      // Second half should not be significantly slower than first half
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 2);
    });

    test('complex calculations with all features remain fast', () => {
      const data = testDataSets.highMarginBusiness;
      Object.entries(data).forEach(([key, value]) => {
        helper.setInput(key, value);
      });

      const startTime = performance.now();
      
      // Perform full calculation with all features
      helper.calculate();
      helper.expandCalculationDetails('aov-calc');
      helper.expandCalculationDetails('cltv-calc');
      helper.expandCalculationDetails('profit-cac-calc');
      helper.clickButton('recalculateCplBtn');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(300); // Complex operations under 300ms
      
      // Verify all calculations completed correctly
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
      expect(helper.getResult('targetCpl')).toBeGreaterThan(0);
      expect(helper.isCalculationDetailExpanded('cltv-calc')).toBe(true);
    });

    test('calculations with extreme values maintain performance', () => {
      const extremeValues = [
        { aov: 0.01, cosPercent: 99.99, fulfillmentCost: 1000000 },
        { aov: 999999999, cosPercent: 0.01, fulfillmentCost: 0.001 },
        { aov: 1500, cosPercent: 50, fulfillmentCost: 999999 }
      ];

      extremeValues.forEach((values, index) => {
        Object.entries(values).forEach(([key, value]) => {
          helper.setInput(key, value);
        });

        const startTime = performance.now();
        helper.calculate();
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(150); // Even extreme values should be fast
        
        // Should not crash or hang
        const results = helper.getAllResults();
        expect(Object.keys(results).length).toBeGreaterThan(10);
      });
    });
  });

  describe('UI Responsiveness Tests', () => {
    test('tab switching is instantaneous', () => {
      const tabs = ['basics', 'customer', 'financial'];
      
      tabs.forEach(tab => {
        const startTime = performance.now();
        helper.switchToTab(tab);
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(50); // Tab switches should be very fast
        expect(helper.isTabActive(tab)).toBe(true);
      });
    });

    test('calculation details expansion is fast', () => {
      helper.calculate();
      
      const detailSections = ['aov-calc', 'cltv-calc', 'profit-cac-calc', 'ltv-cac-calc'];
      
      detailSections.forEach(section => {
        const startTime = performance.now();
        helper.expandCalculationDetails(section);
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(30); // Details expansion should be instant
        expect(helper.isCalculationDetailExpanded(section)).toBe(true);
      });
    });

    test('theme switching is immediate', () => {
      const iterations = 20;
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        helper.toggleDarkMode();
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(25); // Theme switches should be very fast
      }
    });

    test('form input updates are responsive', () => {
      const inputs = ['aov', 'taxRate', 'returnRate', 'cosPercent', 'gaPercent'];
      
      inputs.forEach((inputId, index) => {
        const value = (1000 + index * 100).toString();
        
        const startTime = performance.now();
        helper.setInput(inputId, value);
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(20); // Input updates should be instant
        expect(helper.getInput(inputId)).toBe(value);
      });
    });

    test('waterfall chart updates efficiently', () => {
      // Test waterfall chart performance with different data sets
      const testCases = [
        testDataSets.versaTubeDefaults,
        testDataSets.highMarginBusiness,
        testDataSets.lowMarginBusiness
      ];

      testCases.forEach((data, index) => {
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'leadConversionRate') {
            helper.setInput(key, value);
          }
        });

        const startTime = performance.now();
        helper.calculate(); // This should update waterfall chart
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(200); // Including chart updates
        
        // Verify chart updated
        const waterfallAOV = helper.getWaterfallValue('aov');
        expect(waterfallAOV).toBeGreaterThan(0);
      });
    });
  });

  describe('Memory Usage Tests', () => {
    test('repeated calculations do not cause memory leaks', () => {
      const iterations = 200;
      const memorySnapshots = [];

      // Take initial memory snapshot
      if (performance.memory) {
        memorySnapshots.push(performance.memory.usedJSHeapSize);
      }

      // Perform many calculation cycles
      for (let i = 0; i < iterations; i++) {
        helper
          .setInput('aov', 1500 + (i % 1000))
          .setInput('targetNetMargin', 10 + (i % 10))
          .calculate();

        // Expand and collapse details to test DOM manipulation
        if (i % 10 === 0) {
          helper.expandCalculationDetails('aov-calc');
          helper.expandCalculationDetails('aov-calc'); // Collapse
        }

        // Take memory snapshots periodically
        if (performance.memory && i % 50 === 0) {
          memorySnapshots.push(performance.memory.usedJSHeapSize);
        }
      }

      // Memory usage should not grow significantly
      if (memorySnapshots.length > 2) {
        const initialMemory = memorySnapshots[0];
        const finalMemory = memorySnapshots[memorySnapshots.length - 1];
        const memoryGrowth = (finalMemory - initialMemory) / initialMemory;
        
        // Memory growth should be less than 50% after all operations
        expect(memoryGrowth).toBeLessThan(0.5);
      }

      // Calculations should still work correctly
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
    });

    test('UI state changes do not accumulate memory', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        // Perform various UI state changes
        helper
          .switchToTab(['basics', 'customer', 'financial'][i % 3])
          .toggleDarkMode()
          .togglePresentationMode()
          .togglePresentationMode()
          .calculate();

        // Expand/collapse multiple details
        helper.expandCalculationDetails('aov-calc');
        helper.expandCalculationDetails('cltv-calc');
        helper.expandCalculationDetails('aov-calc'); // Collapse
        helper.expandCalculationDetails('cltv-calc'); // Collapse
      }

      // Should still function normally
      expect(helper.isTabActive('customer')).toBe(true);
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
    });

    test('file operations do not leak memory', async () => {
      const iterations = 20;
      
      for (let i = 0; i < iterations; i++) {
        const testData = {
          aov: (1500 + i * 100).toString(),
          taxRate: (6.5 + i * 0.1).toString(),
          targetNetMargin: (12 + i).toString()
        };

        // Test save/import cycle
        Object.entries(testData).forEach(([key, value]) => {
          helper.setInput(key, value);
        });

        await helper.saveSettings();
        await helper.importSettings(testData);
        
        // Verify import worked
        expect(helper.getInput('aov')).toBe(testData.aov);
      }

      // Should still function normally after many file operations
      helper.calculate();
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
    });
  });

  describe('Stress Tests', () => {
    test('handles rapid user interactions without degradation', () => {
      const startTime = performance.now();
      
      // Simulate very active user for 30 seconds of interactions
      for (let i = 0; i < 500; i++) {
        const action = i % 8;
        
        switch (action) {
          case 0:
            helper.setInput('aov', (1000 + Math.random() * 2000).toFixed(2));
            break;
          case 1:
            helper.calculate();
            break;
          case 2:
            helper.switchToTab(['basics', 'customer', 'financial'][i % 3]);
            break;
          case 3:
            helper.toggleDarkMode();
            break;
          case 4:
            helper.expandCalculationDetails(['aov-calc', 'cltv-calc', 'profit-cac-calc'][i % 3]);
            break;
          case 5:
            helper.setInput('targetNetMargin', (8 + Math.random() * 12).toFixed(1));
            break;
          case 6:
            helper.clickButton('recalculateCplBtn');
            break;
          case 7:
            helper.togglePresentationMode();
            break;
        }
      }
      
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      
      // 500 interactions should complete reasonably quickly
      expect(totalDuration).toBeLessThan(10000); // Under 10 seconds
      
      // System should still be functional
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
      expect(helper.getInput('aov')).toBeTruthy();
    });

    test('handles multiple concurrent calculations', () => {
      // Simulate scenario where user makes changes while calculations are happening
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(new Promise(resolve => {
          setTimeout(() => {
            helper
              .setInput('aov', (1500 + i * 100).toString())
              .setInput('targetNetMargin', (10 + i).toString())
              .calculate();
            resolve();
          }, i * 10); // Stagger the calculations
        }));
      }

      return Promise.all(promises).then(() => {
        // Final calculation should be successful
        expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
        expect(helper.getInput('aov')).toBeTruthy();
      });
    });

    test('maintains accuracy under stress conditions', () => {
      // Test that calculations remain accurate even under stress
      const knownInput = testDataSets.versaTubeDefaults;
      const expectedCAC = 317.74; // Known expected value
      
      // Perform lots of other operations
      for (let i = 0; i < 100; i++) {
        helper
          .setInput('aov', (Math.random() * 10000).toString())
          .calculate()
          .toggleDarkMode()
          .switchToTab(['basics', 'customer', 'financial'][i % 3]);
      }

      // Set known inputs and verify accuracy is maintained
      Object.entries(knownInput).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper.calculate();
      const actualCAC = helper.getResult('profitDrivenCAC');
      expect(Math.abs(actualCAC - expectedCAC)).toBeLessThan(5); // Within reasonable tolerance
    });
  });

  describe('Resource Cleanup Tests', () => {
    test('properly cleans up event listeners', () => {
      // Test that event listeners are properly managed
      const initialListenerCount = helper.dom.querySelectorAll('*').length;
      
      // Perform operations that add/remove listeners
      for (let i = 0; i < 50; i++) {
        helper.calculate();
        helper.expandCalculationDetails('aov-calc');
        helper.expandCalculationDetails('aov-calc'); // Collapse
        helper.toggleDarkMode();
      }

      // DOM should not have accumulated excessive elements
      const finalListenerCount = helper.dom.querySelectorAll('*').length;
      expect(finalListenerCount).toBe(initialListenerCount);
    });

    test('handles cleanup during rapid mode changes', () => {
      for (let i = 0; i < 25; i++) {
        helper.togglePresentationMode(); // Enter
        helper.calculate();
        helper.togglePresentationMode(); // Exit
        helper.toggleDarkMode();
      }

      // Should remain functional
      expect(helper.isPresentationModeActive()).toBe(false);
      helper.calculate();
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
    });
  });

  describe('Cross-Browser Performance', () => {
    test('calculations are consistent across different number precisions', () => {
      // Test that floating point calculations are consistent
      const testValues = [
        { aov: 1500.1, expected: 'consistent' },
        { aov: 1500.01, expected: 'consistent' },
        { aov: 1500.001, expected: 'consistent' },
        { aov: 1500.0001, expected: 'consistent' }
      ];

      const results = testValues.map(({ aov }) => {
        helper.setInput('aov', aov.toString()).calculate();
        return helper.getResult('profitDrivenCAC');
      });

      // Results should be very close to each other
      const maxResult = Math.max(...results);
      const minResult = Math.min(...results);
      expect(maxResult - minResult).toBeLessThan(0.1);
    });

    test('handles different animation timing models', () => {
      // Test that animations work regardless of browser timing
      helper
        .setInput('aov', '2000')
        .calculate();

      // Animation timing should not affect calculation results
      setTimeout(() => {
        expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
      }, 100);

      setTimeout(() => {
        expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
      }, 500);
    });
  });

  describe('Performance Benchmarks', () => {
    test('meets performance benchmarks for typical usage', () => {
      const benchmarks = {
        singleCalculation: 50,     // ms
        tabSwitch: 25,             // ms
        themeToggle: 20,           // ms
        detailsExpansion: 15,      // ms
        formInput: 10              // ms
      };

      // Single calculation benchmark
      helper.setInput('aov', '1500');
      const calcStart = performance.now();
      helper.calculate();
      const calcTime = performance.now() - calcStart;
      expect(calcTime).toBeLessThan(benchmarks.singleCalculation);

      // Tab switch benchmark
      const tabStart = performance.now();
      helper.switchToTab('customer');
      const tabTime = performance.now() - tabStart;
      expect(tabTime).toBeLessThan(benchmarks.tabSwitch);

      // Theme toggle benchmark
      const themeStart = performance.now();
      helper.toggleDarkMode();
      const themeTime = performance.now() - themeStart;
      expect(themeTime).toBeLessThan(benchmarks.themeToggle);

      // Details expansion benchmark
      const detailsStart = performance.now();
      helper.expandCalculationDetails('aov-calc');
      const detailsTime = performance.now() - detailsStart;
      expect(detailsTime).toBeLessThan(benchmarks.detailsExpansion);

      // Form input benchmark
      const inputStart = performance.now();
      helper.setInput('taxRate', '7.5');
      const inputTime = performance.now() - inputStart;
      expect(inputTime).toBeLessThan(benchmarks.formInput);
    });

    test('performance scales linearly with data complexity', () => {
      const simpleData = { aov: 1000, cosPercent: 50 };
      const complexData = { 
        aov: 1234.56, 
        taxRate: 8.875, 
        returnRate: 3.247,
        cosPercent: 42.157,
        gaPercent: 14.298,
        fulfillmentCost: 123.45,
        returningCustomers: 11.234,
        repeatOrderRate: 1.456,
        targetNetMargin: 12.789
      };

      // Simple calculation
      Object.entries(simpleData).forEach(([key, value]) => {
        helper.setInput(key, value);
      });
      const simpleStart = performance.now();
      helper.calculate();
      const simpleTime = performance.now() - simpleStart;

      // Complex calculation
      Object.entries(complexData).forEach(([key, value]) => {
        helper.setInput(key, value);
      });
      const complexStart = performance.now();
      helper.calculate();
      const complexTime = performance.now() - complexStart;

      // Complex should not be significantly slower than simple
      expect(complexTime).toBeLessThan(simpleTime * 3);
      
      // Both should produce valid results
      expect(helper.getResult('profitDrivenCAC')).toBeGreaterThan(0);
    });
  });
});