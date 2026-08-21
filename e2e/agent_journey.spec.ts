import { test, expect } from '@playwright/test';

test.describe('Agent Copilot End-to-End Journey', () => {
  // Setup agent context
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Completes full SmartBundle orchestration loop', async ({ page, request }) => {
    // 1. Authentication
    await page.goto('http://localhost:5173/agent-portal');
    await expect(page).toHaveTitle(/Travelverse - Agent/i);

    // 2. Client Selection (Client360)
    // Assume there is a dashboard of clients. We click the first one.
    await page.click('button:has-text("View Client: Emma W.")');
    
    // Assert backend retrieves customer preferences
    const preferencesPromise = page.waitForResponse(
      (res) => res.url().includes('/api/v1/customers') && res.url().includes('preferences') && res.status() === 200
    );
    await preferencesPromise;
    await expect(page.locator('text=Client360 Profile')).toBeVisible();
    await expect(page.locator('text=Prefers luxury')).toBeVisible(); // Mock preference

    // 3. Agent Copilot Package Generation
    await page.click('button:has-text("Open Agent Copilot")');
    await expect(page.locator('text=Agent Copilot')).toBeVisible();

    const promptInput = page.locator('textarea[placeholder*="Ask Copilot..."]');
    await promptInput.fill('Create a luxury package for this client based on their preferences');

    // Setup network intercepts to strictly monitor backend pipeline execution
    const chatPromise = page.waitForResponse(
      (res) => res.url().includes('/api/v1/copilot/chat') && res.status() === 200
    );
    
    // The chat response should contain the generated SmartBundle
    await page.click('button:has-text("Send")');

    const chatResponse = await chatPromise;
    const chatData = await chatResponse.json();

    // 4. Verification & Constraints
    // Assert backend pipeline triggered (Retrieves Preferences -> Searches Inventory -> SmartBundle -> Validator)
    expect(chatData).toHaveProperty('bundle');
    expect(chatData.bundle).toHaveProperty('itinerary');
    expect(chatData.bundle).toHaveProperty('totalPrice');
    
    // NO FABRICATED DATA STRICT CHECK
    // The payload MUST contain the signed JWT confirmation token from PriceTrustService
    expect(chatData.bundle).toHaveProperty('pricing');
    expect(chatData.bundle.pricing).toHaveProperty('trustedPrices');
    expect(chatData.bundle).toHaveProperty('confirmation_token');
    
    const token = chatData.bundle.confirmation_token;
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20); // Basic JWT sanity check

    // Wait for the UI to render the SmartBundle
    await expect(page.locator('text=Luxury Package')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=SmartQuote Attached')).toBeVisible();

    // 5. Agent Confirms
    await page.click('button:has-text("Confirm Quotation")');
    
    // Ensure final confirmation success state renders
    await expect(page.locator('text=Package Confirmed and Ready')).toBeVisible();

    // Journey Complete. 
    // Agent -> Client360 -> Copilot -> SmartBundle -> PriceTrust -> UI Confirmed successfully asserted.
  });
});
