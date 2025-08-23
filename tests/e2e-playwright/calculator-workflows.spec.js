// Playwright E2E tests for real browser testing
import { test, expect } from '@playwright/test';

test.describe('Strategic CAC Calculator - Browser E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cac-calculator.html');
    // Wait for calculator to be ready
    await expect(page.locator('#cpaForm')).toBeVisible();
  });

  test.describe('Core Functionality', () => {
    test('loads calculator with default values and calculates', async ({ page }) => {
      // Verify default values are loaded
      await expect(page.locator('#aov')).toHaveValue('1500');
      await expect(page.locator('#taxRate')).toHaveValue('6.5');
      await expect(page.locator('#targetNetMargin')).toHaveValue('12.0');

      // Click calculate button
      await page.click('#calculateBtn');

      // Verify results are displayed
      await expect(page.locator('#profitDrivenCAC')).not.toHaveText('0.00');
      await expect(page.locator('#customerLifetimeValue')).not.toHaveText('0.00');

      // Verify specific result is reasonable
      const cacValue = await page.locator('#profitDrivenCAC').textContent();
      const numericCAC = parseFloat(cacValue.replace(/[,$]/g, ''));
      expect(numericCAC).toBeGreaterThan(200);
      expect(numericCAC).toBeLessThan(500);
    });

    test('tab navigation preserves form state', async ({ page }) => {
      // Fill Business Basics
      await page.click('[data-tab="basics"]');
      await page.fill('#aov', '2500');
      await page.fill('#taxRate', '8.5');

      // Switch to Customer Metrics
      await page.click('[data-tab="customer"]');
      await expect(page.locator('[data-tab="customer"]')).toHaveClass(/active/);
      await page.fill('#returningCustomers', '20');
      await page.fill('#fulfillmentCost', '200');

      // Switch to Financial Targets
      await page.click('[data-tab="financial"]');
      await page.fill('#targetNetMargin', '15');

      // Go back to basics and verify values preserved
      await page.click('[data-tab="basics"]');
      await expect(page.locator('#aov')).toHaveValue('2500');
      await expect(page.locator('#taxRate')).toHaveValue('8.5');

      // Check other tabs too
      await page.click('[data-tab="customer"]');
      await expect(page.locator('#returningCustomers')).toHaveValue('20');
      await expect(page.locator('#fulfillmentCost')).toHaveValue('200');

      await page.click('[data-tab="financial"]');
      await expect(page.locator('#targetNetMargin')).toHaveValue('15');
    });

    test('calculation details expand and show formulas', async ({ page }) => {
      await page.click('#calculateBtn');

      // Expand CLTV calculation details
      await page.click('[data-target="cltv-calc"]');
      await expect(page.locator('#cltv-calc')).toHaveClass(/expanded/);

      // Verify formula is shown
      await expect(page.locator('#cltv-calc .calc-formula')).toContainText('AOV');
      await expect(page.locator('#cltv-calc .calc-formula')).toContainText('Average Orders');

      // Expand another section
      await page.click('[data-target="profit-cac-calc"]');
      await expect(page.locator('#profit-cac-calc')).toHaveClass(/expanded/);

      // Both should be expanded simultaneously
      await expect(page.locator('#cltv-calc')).toHaveClass(/expanded/);
      await expect(page.locator('#profit-cac-calc')).toHaveClass(/expanded/);

      // Collapse one
      await page.click('[data-target="cltv-calc"]');
      await expect(page.locator('#cltv-calc')).not.toHaveClass(/expanded/);
      await expect(page.locator('#profit-cac-calc')).toHaveClass(/expanded/); // Other stays expanded
    });

    test('CPL calculation updates correctly', async ({ page }) => {
      await page.click('#calculateBtn');
      
      // Get initial CPL value
      const initialCPL = await page.locator('#targetCpl').textContent();

      // Change conversion rate
      await page.fill('#leadConversionRate', '20');
      await page.click('#recalculateCplBtn');

      // CPL should update
      const newCPL = await page.locator('#targetCpl').textContent();
      expect(newCPL).not.toBe(initialCPL);

      // New CPL should be higher (double the conversion rate)
      const initialNum = parseFloat(initialCPL.replace(/[,$]/g, ''));
      const newNum = parseFloat(newCPL.replace(/[,$]/g, ''));
      expect(newNum).toBeGreaterThan(initialNum * 1.8); // Approximately double
    });
  });

  test.describe('Advanced Features', () => {
    test('theme toggle works correctly', async ({ page }) => {
      // Initially light theme
      await expect(page.locator('body')).not.toHaveAttribute('data-theme', 'dark');

      // Toggle to dark
      await page.click('#themeToggle');
      await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');

      // Verify theme icon changed
      await expect(page.locator('#themeToggle')).toContainText('🌙');

      // Toggle back to light
      await page.click('#themeToggle');
      await expect(page.locator('body')).not.toHaveAttribute('data-theme', 'dark');
      await expect(page.locator('#themeToggle')).toContainText('☀️');
    });

    test('presentation mode hides input panel', async ({ page }) => {
      // Initially input panel visible
      await expect(page.locator('#topPanel')).toBeVisible();

      // Activate presentation mode
      await page.click('#presentationModeBtn');
      await expect(page.locator('body')).toHaveClass(/presentation-mode-active/);

      // Input panel should be hidden or collapsed
      const topPanel = page.locator('#topPanel');
      const isCollapsed = await topPanel.evaluate(el => 
        el.classList.contains('collapsed') || 
        getComputedStyle(el).maxHeight === '0px'
      );
      expect(isCollapsed).toBe(true);

      // Floating calculate button should be visible
      await expect(page.locator('#floatingCalculate')).toBeVisible();

      // Deactivate presentation mode
      await page.click('#presentationModeBtn');
      await expect(page.locator('body')).not.toHaveClass(/presentation-mode-active/);
      await expect(page.locator('#topPanel')).toBeVisible();
    });

    test('waterfall chart updates with calculations', async ({ page }) => {
      // Set specific values for predictable waterfall
      await page.fill('#aov', '1000');
      await page.fill('#taxRate', '0');
      await page.fill('#returnRate', '0');
      await page.fill('#cosPercent', '50');
      await page.fill('#fulfillmentCost', '100');
      await page.click('#calculateBtn');

      // Check waterfall values
      await expect(page.locator('#waterfall-aov')).toContainText('1000');
      await expect(page.locator('#waterfall-cogs')).toContainText('500');
      await expect(page.locator('#waterfall-fulfillment')).toContainText('100');

      // Net should be positive
      const netText = await page.locator('#waterfall-net').textContent();
      const netValue = parseFloat(netText.replace(/[,$]/g, ''));
      expect(netValue).toBeGreaterThan(0);

      // Change values and recalculate
      await page.fill('#cosPercent', '75');
      await page.click('#calculateBtn');

      // COGS should increase
      await expect(page.locator('#waterfall-cogs')).toContainText('750');
    });

    test('reset button restores defaults', async ({ page }) => {
      // Change all values
      await page.fill('#aov', '5000');
      await page.fill('#taxRate', '10');
      await page.fill('#targetNetMargin', '20');
      await page.click('#calculateBtn');

      // Verify values are changed
      await expect(page.locator('#aov')).toHaveValue('5000');
      const initialCAC = await page.locator('#profitDrivenCAC').textContent();

      // Reset
      await page.click('#resetBtn');

      // Verify defaults restored
      await expect(page.locator('#aov')).toHaveValue('1500');
      await expect(page.locator('#taxRate')).toHaveValue('6.5');
      await expect(page.locator('#targetNetMargin')).toHaveValue('12.0');

      // Results should be reset too
      const resetCAC = await page.locator('#profitDrivenCAC').textContent();
      expect(resetCAC).not.toBe(initialCAC);
    });
  });

  test.describe('Error Handling', () => {
    test('handles unrealistic margin scenario gracefully', async ({ page }) => {
      // Set up scenario that results in negative CAC
      await page.fill('#aov', '500');
      await page.fill('#cosPercent', '75');
      await page.fill('#gaPercent', '20');
      await page.fill('#fulfillmentCost', '200');
      await page.fill('#targetNetMargin', '25'); // Unrealistic
      await page.click('#calculateBtn');

      // Should show notification
      await expect(page.locator('#notification')).toBeVisible();
      await expect(page.locator('#notification')).toContainText('Target net margin too high');

      // CAC should be 0
      await expect(page.locator('#profitDrivenCAC')).toContainText('0.00');
    });

    test('handles zero and empty inputs gracefully', async ({ page }) => {
      // Clear all inputs
      await page.fill('#aov', '');
      await page.fill('#taxRate', '');
      await page.fill('#returnRate', '');
      await page.click('#calculateBtn');

      // Should not crash
      await expect(page.locator('#aovPostTaxReturns')).toBeVisible();
      
      // Test with zero AOV
      await page.fill('#aov', '0');
      await page.click('#calculateBtn');
      
      // Should handle gracefully
      await expect(page.locator('#aovPostTaxReturns')).toContainText('0.00');
    });

    test('notifications auto-hide after timeout', async ({ page }) => {
      await page.click('#calculateBtn');
      
      // Notification should appear
      await expect(page.locator('#notification')).toBeVisible();
      
      // Wait for auto-hide (3 seconds)
      await page.waitForTimeout(3500);
      await expect(page.locator('#notification')).not.toBeVisible();
    });
  });

  test.describe('File Operations', () => {
    test('save and import settings workflow', async ({ page }) => {
      // Set custom values
      await page.fill('#aov', '3000');
      await page.fill('#taxRate', '7.25');
      await page.fill('#targetNetMargin', '18');

      // Start download
      const downloadPromise = page.waitForEvent('download');
      await page.click('#saveBtn');
      const download = await downloadPromise;

      // Verify download started
      expect(download.suggestedFilename()).toBe('cac_calculator_settings.json');

      // Reset form
      await page.click('#resetBtn');
      await expect(page.locator('#aov')).toHaveValue('1500');

      // Simulate file import (Note: file upload in Playwright requires special handling)
      const fileContent = JSON.stringify({
        aov: '3000',
        taxRate: '7.25',
        targetNetMargin: '18'
      });

      // Create a file and upload it
      await page.setInputFiles('#fileInput', {
        name: 'test_settings.json',
        mimeType: 'application/json',
        buffer: Buffer.from(fileContent)
      });

      // Values should be restored
      await expect(page.locator('#aov')).toHaveValue('3000');
      await expect(page.locator('#taxRate')).toHaveValue('7.25');
      await expect(page.locator('#targetNetMargin')).toHaveValue('18');
    });

    test('handles invalid file import gracefully', async ({ page }) => {
      const invalidJSON = '{ invalid json content }';

      // Try to upload invalid file
      await page.setInputFiles('#fileInput', {
        name: 'invalid.json',
        mimeType: 'application/json',
        buffer: Buffer.from(invalidJSON)
      });

      // Should show error notification
      await expect(page.locator('#notification')).toBeVisible();
      await expect(page.locator('#notification')).toContainText('Error importing');

      // Form should remain unchanged (still at defaults)
      await expect(page.locator('#aov')).toHaveValue('1500');
    });
  });

  test.describe('Responsive Design', () => {
    test('works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size

      // Calculator should still be functional
      await page.click('#calculateBtn');
      await expect(page.locator('#profitDrivenCAC')).not.toContainText('0.00');

      // Tabs should work on mobile
      await page.click('[data-tab="customer"]');
      await expect(page.locator('[data-tab="customer"]')).toHaveClass(/active/);

      // Form inputs should be accessible
      await page.fill('#aov', '2000');
      await expect(page.locator('#aov')).toHaveValue('2000');
    });

    test('waterfall chart adapts to mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('#calculateBtn');
      
      // Waterfall chart should be visible and functional
      await expect(page.locator('.waterfall-chart')).toBeVisible();
      await expect(page.locator('#waterfall-aov')).toContainText(/\d+/);
    });
  });

  test.describe('Accessibility', () => {
    test('keyboard navigation works', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('#aov')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('#taxRate')).toBeFocused();

      // Should be able to navigate to calculate button
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
      }
      await expect(page.locator('#calculateBtn')).toBeFocused();

      // Should be able to activate with Enter
      await page.keyboard.press('Enter');
      await expect(page.locator('#profitDrivenCAC')).not.toContainText('0.00');
    });

    test('form labels are properly associated', async ({ page }) => {
      // Check that labels are properly associated with inputs
      const aovLabel = page.locator('label[for="aov"]');
      const aovInput = page.locator('#aov');
      
      await expect(aovLabel).toBeVisible();
      await expect(aovLabel).toContainText('Average Order Value');
      
      // Click label should focus input
      await aovLabel.click();
      await expect(aovInput).toBeFocused();
    });

    test('calculation details are keyboard accessible', async ({ page }) => {
      await page.click('#calculateBtn');
      
      // Should be able to tab to calculation toggle buttons
      const calcToggle = page.locator('[data-target="aov-calc"]');
      await calcToggle.focus();
      
      // Should be able to activate with keyboard
      await page.keyboard.press('Enter');
      await expect(page.locator('#aov-calc')).toHaveClass(/expanded/);
    });
  });

  test.describe('Performance', () => {
    test('calculations complete quickly', async ({ page }) => {
      await page.fill('#aov', '2500');
      
      const startTime = Date.now();
      await page.click('#calculateBtn');
      
      // Wait for results to appear
      await expect(page.locator('#profitDrivenCAC')).not.toContainText('0.00');
      const endTime = Date.now();
      
      // Should complete in under 1 second
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('UI interactions are responsive', async ({ page }) => {
      // Theme toggle should be immediate
      const startTime = Date.now();
      await page.click('#themeToggle');
      await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('calculations produce consistent results', async ({ page, browserName }) => {
      // Set specific inputs
      await page.fill('#aov', '1500');
      await page.fill('#taxRate', '6.5');
      await page.fill('#returnRate', '3.5');
      await page.fill('#cosPercent', '42.0');
      await page.fill('#targetNetMargin', '12.0');
      await page.click('#calculateBtn');

      // Get result
      const cacText = await page.locator('#profitDrivenCAC').textContent();
      const cacValue = parseFloat(cacText.replace(/[,$]/g, ''));

      // Should be consistent across browsers (within small tolerance)
      expect(cacValue).toBeGreaterThan(315);
      expect(cacValue).toBeLessThan(320);
      
      // Log for debugging different browsers
      console.log(`${browserName}: CAC = ${cacValue}`);
    });

    test('UI elements render correctly', async ({ page, browserName }) => {
      // Check that key UI elements are visible and positioned correctly
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.tabs')).toBeVisible();
      await expect(page.locator('#calculateBtn')).toBeVisible();
      await expect(page.locator('.results-container')).toBeVisible();

      // Take screenshot for visual comparison across browsers
      await page.screenshot({ 
        path: `test-results/screenshots/calculator-${browserName}.png`,
        fullPage: true
      });
    });
  });
});