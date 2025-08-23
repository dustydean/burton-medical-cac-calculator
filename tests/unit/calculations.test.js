// Unit tests for calculation functions
import CalculatorTestHelper from '../utils/calculatorHelpers.js';
import { testDataSets, expectedResults } from '../fixtures/testData.js';

describe('Calculator Core Functions', () => {
  let helper;

  beforeEach(async () => {
    helper = new CalculatorTestHelper();
    await helper.setup();
  });

  afterEach(() => {
    helper.cleanup();
  });

  describe('AOV Post Tax/Returns Calculation', () => {
    test('calculates AOV correctly with default values', () => {
      const data = testDataSets.versaTubeDefaults;
      helper
        .setInput('aov', data.aov)
        .setInput('taxRate', data.taxRate)
        .setInput('returnRate', data.returnRate)
        .calculate()
        .expectResult('aovPostTaxReturns', expectedResults.versaTubeDefaults.aovPostTaxReturns, 0.1);
    });

    test('handles zero tax rate', () => {
      helper
        .setInput('aov', 1500)
        .setInput('taxRate', 0)
        .setInput('returnRate', 3.5)
        .calculate();
      
      const expected = 1500 * (1 - 0.035); // 1447.5
      helper.expectResult('aovPostTaxReturns', expected, 0.1);
    });

    test('handles zero return rate', () => {
      helper
        .setInput('aov', 1500)
        .setInput('taxRate', 6.5)
        .setInput('returnRate', 0)
        .calculate();
      
      const expected = 1500 / 1.065; // 1408.45
      helper.expectResult('aovPostTaxReturns', expected, 0.1);
    });

    test('handles high tax and return rates', () => {
      helper
        .setInput('aov', 2000)
        .setInput('taxRate', 15)
        .setInput('returnRate', 10)
        .calculate();
      
      const expected = (2000 / 1.15) * 0.9; // 1565.22
      helper.expectResult('aovPostTaxReturns', expected, 0.1);
    });
  });

  describe('Gross Margin Calculation', () => {
    test('calculates gross margin percentage correctly', () => {
      const data = testDataSets.versaTubeDefaults;
      helper
        .setInput('cosPercent', data.cosPercent)
        .calculate()
        .expectResult('grossMarginPercent', expectedResults.versaTubeDefaults.grossMarginPercent);
    });

    test('handles zero cost of sales', () => {
      helper
        .setInput('cosPercent', 0)
        .calculate()
        .expectResult('grossMarginPercent', 100);
    });

    test('handles high cost of sales', () => {
      helper
        .setInput('cosPercent', 90)
        .calculate()
        .expectResult('grossMarginPercent', 10);
    });
  });

  describe('Contribution Margin Calculation', () => {
    test('calculates contribution margin correctly', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper
        .calculate()
        .expectResult('contributionMargin', expectedResults.versaTubeDefaults.contributionMargin, 0.5)
        .expectResult('contributionMarginPercent', expectedResults.versaTubeDefaults.contributionMarginPercent, 0.5);
    });

    test('handles negative contribution margin', () => {
      helper
        .setInput('aov', 100)
        .setInput('taxRate', 0)
        .setInput('returnRate', 0)
        .setInput('cosPercent', 50)
        .setInput('fulfillmentCost', 60)
        .calculate();
      
      const expected = (100 * 0.5) - 60; // -10
      helper.expectResult('contributionMargin', expected, 0.1);
    });
  });

  describe('Operating Profit Calculation', () => {
    test('calculates operating profit per order correctly', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper
        .calculate()
        .expectResult('operatingProfitPerOrder', expectedResults.versaTubeDefaults.operatingProfitPerOrder, 0.5);
    });

    test('handles negative operating profit', () => {
      helper
        .setInput('aov', 100)
        .setInput('taxRate', 0)
        .setInput('returnRate', 0)
        .setInput('cosPercent', 40)
        .setInput('gaPercent', 30)
        .setInput('fulfillmentCost', 50)
        .calculate();
      
      const expected = (100 * (1 - 0.4 - 0.3)) - 50; // -20
      helper.expectResult('operatingProfitPerOrder', expected, 0.1);
    });
  });

  describe('Customer Lifetime Value Calculation', () => {
    test('calculates CLTV correctly with repeat customers', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper
        .calculate()
        .expectResult('customerLifetimeValue', expectedResults.versaTubeDefaults.customerLifetimeValue, 0.5);
    });

    test('calculates CLTV with no repeat customers', () => {
      const data = testDataSets.noRepeatBusiness;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper.calculate();
      
      // Should equal AOV post tax/returns when no repeats
      const aovPostTax = helper.getResult('aovPostTaxReturns');
      helper.expectResult('customerLifetimeValue', aovPostTax, 0.1);
    });

    test('calculates CLTV with high repeat rates', () => {
      helper
        .setInput('aov', 1000)
        .setInput('taxRate', 0)
        .setInput('returnRate', 0)
        .setInput('returningCustomers', 50)
        .setInput('repeatOrderRate', 3)
        .calculate();
      
      // Average orders = 1 + (0.5 * 3) = 2.5
      // CLTV = 1000 * 2.5 = 2500
      helper.expectResult('customerLifetimeValue', 2500, 0.1);
    });
  });

  describe('Profit Driven CAC Calculation', () => {
    test('calculates profit driven CAC correctly', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper
        .calculate()
        .expectResult('profitDrivenCAC', expectedResults.versaTubeDefaults.profitDrivenCAC, 1.0);
    });

    test('sets CAC to zero when target margin is too high', () => {
      const data = testDataSets.unrealisticHighMargin;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper
        .calculate()
        .expectResult('profitDrivenCAC', 0, 0.1);
      
      // Should show warning notification
      expect(helper.isNotificationVisible()).toBe(true);
      expect(helper.getNotificationText()).toContain('Target net margin too high');
    });

    test('handles zero profit scenario', () => {
      helper
        .setInput('aov', 100)
        .setInput('taxRate', 0)
        .setInput('returnRate', 0)
        .setInput('cosPercent', 70)
        .setInput('gaPercent', 20)
        .setInput('fulfillmentCost', 10)
        .setInput('targetNetMargin', 0)
        .setInput('returningCustomers', 0)
        .setInput('repeatOrderRate', 0)
        .calculate();
      
      // Operating profit = (100 * 0.1) - 10 = 0
      // CAC should be 0
      helper.expectResult('profitDrivenCAC', 0, 0.1);
    });
  });

  describe('Target ROAS Calculation', () => {
    test('calculates target ROAS correctly', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper
        .calculate()
        .expectResult('targetROAS', expectedResults.versaTubeDefaults.targetROAS, 0.1);
    });

    test('handles zero CAC scenario (shows N/A or Infinity)', () => {
      const data = testDataSets.unrealisticHighMargin;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper.calculate();
      
      const roas = helper.getResult('targetROAS');
      expect(roas === 'N/A' || roas === Infinity || isNaN(roas)).toBe(true);
    });
  });

  describe('LTV:CAC Ratio Calculation', () => {
    test('calculates LTV:CAC ratio correctly', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper
        .calculate()
        .expectResult('ltvCacRatio', expectedResults.versaTubeDefaults.ltvCacRatio, 0.1);
    });

    test('shows healthy ratio for high margin business', () => {
      const data = testDataSets.highMarginBusiness;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper.calculate();
      
      const ratio = helper.getResult('ltvCacRatio');
      expect(ratio).toBeCloseTo(2.02, 1); // Expected ratio for this scenario
    });
  });

  describe('Target CPL Calculation', () => {
    test('calculates target CPL correctly', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        helper.setInput(key, value);
      });
      
      helper
        .calculate()
        .expectResult('targetCpl', expectedResults.versaTubeDefaults.targetCpl, 0.5);
    });

    test('updates CPL when conversion rate changes', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        helper.setInput(key, value);
      });
      
      helper.calculate();
      const initialCPL = helper.getResult('targetCpl');
      
      // Double the conversion rate (from 10% to 20%)
      helper.setInput('leadConversionRate', data.leadConversionRate * 2);
      helper.calculate();
      
      const newCPL = helper.getResult('targetCpl');
      expect(newCPL).toBeCloseTo(initialCPL / 2, 1); // CPL should halve when conversion rate doubles
    });

    test('handles zero conversion rate', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper
        .setInput('leadConversionRate', 0)
        .calculate()
        .expectResult('targetCpl', 0, 0.1);
    });
  });

  describe('Break-Even CAC Calculation', () => {
    test('calculates break-even CAC correctly', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper
        .calculate()
        .expectResult('breakEvenCAC', expectedResults.versaTubeDefaults.breakEvenCAC, 1.0);
    });

    test('break-even CAC equals customer lifetime profit', () => {
      const data = testDataSets.versaTubeDefaults;
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'leadConversionRate') {
          helper.setInput(key, value);
        }
      });
      
      helper.calculate();
      
      const breakEvenCAC = helper.getResult('breakEvenCAC');
      const lifetimeProfit = helper.getResult('customerLifetimeProfit');
      
      expect(Math.abs(breakEvenCAC - lifetimeProfit)).toBeLessThan(0.01);
    });
  });

  describe('Mathematical Edge Cases', () => {
    test('handles division by zero gracefully', () => {
      helper
        .setInput('aov', 0)
        .setInput('taxRate', 0)
        .setInput('returnRate', 0)
        .calculate();
      
      // Key ratios should show N/A when CAC is 0
      expect(helper.getResult('targetROAS')).toBe('N/A');
      expect(helper.getResult('ltvCacRatio')).toBe('N/A');
      expect(helper.getResult('paybackPeriod')).toBe('N/A');
      
      // Other values can be legitimate negative numbers due to fixed costs
      expect(helper.getResult('aovPostTaxReturns')).toBe(0);
      expect(helper.getResult('profitDrivenCAC')).toBe(0);
      expect(helper.getResult('targetCpl')).toBe(0);
    });

    test('handles very large numbers', () => {
      helper
        .setInput('aov', 1000000)
        .setInput('taxRate', 0)
        .setInput('returnRate', 0)
        .setInput('cosPercent', 10)
        .setInput('gaPercent', 5)
        .setInput('fulfillmentCost', 1000)
        .setInput('targetNetMargin', 10)
        .calculate();
      
      const cltv = helper.getResult('customerLifetimeValue');
      expect(cltv).toBeGreaterThan(900000);
      expect(isFinite(cltv)).toBe(true);
    });

    test('handles precision with small decimal numbers', () => {
      helper
        .setInput('aov', 0.01)
        .setInput('taxRate', 0.1)
        .setInput('returnRate', 0.1)
        .setInput('cosPercent', 50)
        .setInput('gaPercent', 10)
        .setInput('fulfillmentCost', 0.001)
        .calculate();
      
      const results = helper.getAllResults();
      Object.values(results).forEach(value => {
        if (typeof value === 'number') {
          expect(isFinite(value)).toBe(true);
        }
      });
    });
  });
});