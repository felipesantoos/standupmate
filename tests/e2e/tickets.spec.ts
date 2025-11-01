/**
 * Ticket Management E2E Tests
 * 
 * Tests complete user journeys for ticket management.
 * Following 08e-frontend-testing.md pattern (Section 5.2).
 */

import { test, expect } from '@playwright/test';

test.describe('Ticket Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tickets page
    await page.goto('/tickets');
    await expect(page).toHaveURL('/tickets');
  });

  test('should display tickets page', async ({ page }) => {
    // Assert: page title
    await expect(page.locator('h1:has-text("Tickets")')).toBeVisible();
    
    // Assert: "New Ticket" button
    await expect(page.locator('button:has-text("New Ticket")')).toBeVisible();
    
    // Assert: view toggle buttons
    await expect(page.locator('button[aria-label="Card view"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Table view"]')).toBeVisible();
  });

  test('should toggle between card and table view', async ({ page }) => {
    // Assert: initially in card view (or table view, depending on localStorage)
    const cardViewButton = page.locator('button[aria-label="Card view"]');
    const tableViewButton = page.locator('button[aria-label="Table view"]');
    
    // Click table view
    await tableViewButton.click();
    
    // Wait a bit for view to change
    await page.waitForTimeout(300);
    
    // Assert: table view button should be active (secondary variant)
    await expect(tableViewButton).toHaveAttribute('aria-pressed', 'true');
    
    // Click card view
    await cardViewButton.click();
    
    await page.waitForTimeout(300);
    
    // Assert: card view button should be active
    await expect(cardViewButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should navigate to create new ticket page', async ({ page }) => {
    // Click "New Ticket"
    await page.click('button:has-text("New Ticket")');
    
    // Assert: navigated to new ticket page
    await expect(page).toHaveURL('/tickets/new');
  });

  test('should display empty state when no tickets', async ({ page }) => {
    // This test assumes fresh database
    // If tickets exist, it will show the list instead
    
    const emptyState = page.locator('text=No tickets found');
    const ticketList = page.locator('[role="list"]');
    
    // Either empty state OR ticket list should be visible
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasTicketList = await ticketList.isVisible().catch(() => false);
    
    expect(hasEmptyState || hasTicketList).toBe(true);
  });

  test('should persist view mode in localStorage', async ({ page }) => {
    // Switch to table view
    await page.click('button[aria-label="Table view"]');
    await page.waitForTimeout(300);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Assert: should still be in table view
    const tableViewButton = page.locator('button[aria-label="Table view"]');
    await expect(tableViewButton).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Ticket Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tickets');
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should have filter controls', async ({ page }) => {
    // Assert: filter section exists
    const filterSection = page.locator('section[aria-label="Ticket filters"]');
    await expect(filterSection).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    // Start at dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to tickets
    await page.click('a[href="/tickets"]');
    await expect(page).toHaveURL('/tickets');
    
    // Navigate to templates
    await page.click('a[href="/templates"]');
    await expect(page).toHaveURL('/templates');
    
    // Navigate to settings
    await page.click('a[href="/settings"]');
    await expect(page).toHaveURL('/settings');
  });
});

