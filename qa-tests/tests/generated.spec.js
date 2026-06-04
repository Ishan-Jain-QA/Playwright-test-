```javascript
import { expect } from '@playwright/test';
import { BasePage } from '../utils/base.page';

export class OnboardingQuizPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/onboarding/quiz'; // Assuming a base URL is configured in playwright.config.js

    // Locators for core screen elements
    this.heading = page.getByRole('heading', { name: 'What should we keep an eye out for?' });
    this.infoText = page.locator('p').filter({ hasText: 'We use this information to personalize' }); // Adjust locator based on actual text/structure
    this.backToHomeLink = page.getByRole('link', { name: 'Back to home' });
    this.signInLink = page.getByRole('link', { name: 'Sign In' });

    // Locators for predefined allergen/dietary preference options
    this.optionLocator = (optionName) => page.locator(`[data-testid="option-${optionName.toLowerCase().replace(/\s/g, '-')}"], button:has-text("${optionName}")`);
    this.dontAvoidAnyOption = page.getByRole('button', { name: "I don't avoid any of these" });

    // Locators for custom allergen/ingredient input
    this.customInputField = page.getByPlaceholder(/Add custom ingredient|e.g., MSG, Corn Syrup/i);
    this.addCustomIngredientButton = page.getByRole('button', { name: 'Add Ingredient' }); // Assuming an 'Add Ingredient' button
    this.addedCustomIngredientLocator = (ingredient) => page.locator(`[data-testid="custom-ingredient-${ingredient.toLowerCase().replace(/\s/g, '-')}"], .custom-ingredient-tag:has-text("${ingredient}")`);

    // Locators for messages
    this.informationalMessage = page.locator('.info-message'); // Adjust based on actual class/data-testid
    this.warningMessage = page.locator('.warning-message'); // Adjust based on actual class/data-testid
    this.feedbackMessage = page.locator('.feedback-message'); // Adjust based on actual class/data-testid

    // Locators for CTA button
    this.letsKeepGoingButton = page.getByRole('button', { name: "Let's keep going" });
  }

  /**
   * Navigates to the Onboarding Quiz Screen.
   */
  async goto() {
    await this.navigate(this.url);
  }

  /**
   * Checks if a specific option is displayed.
   * @param {string} optionName - The name of the option (e.g., "Dairy").
   */
  async isOptionDisplayed(optionName) {
    await this.assertElementVisible(this.optionLocator(optionName));
  }

  /**
   * Selects a predefined allergen/dietary preference option.
   * @param {string} optionName - The name of the option to select.
   */
  async selectOption(optionName) {
    const locator = this.optionLocator(optionName);
    await this.clickElement(locator);
  }

  /**
   * Deselects a predefined allergen/dietary preference option.
   * Assumes clicking an already selected option deselects it.
   * @param {string} optionName - The name of the option to deselect.
   */
  async deselectOption(optionName) {
    const locator = this.optionLocator(optionName);
    // Only click if it's currently selected
    const isSelected = await this.isOptionSelected(optionName);
    if (isSelected) {
      await this.clickElement(locator);
    }
  }

  /**
   * Checks if a predefined option is visually selected/active.
   * Assumes selected options have an 'active' class or 'aria-selected=true'.
   * @param {string} optionName - The name of the option.
   * @returns {Promise<boolean>} - True if selected, false otherwise.
   */
  async isOptionSelected(optionName) {
    const locator = this.optionLocator(optionName);
    // Check for common active states: 'active' class or 'aria-selected' attribute
    const hasActiveClass = await locator.evaluate(el => el.classList.contains('active') || el.classList.contains('selected'));
    const hasAriaSelected = await locator.getAttribute('aria-selected') === 'true';
    return hasActiveClass || hasAriaSelected;
  }

  /**
   * Asserts that a predefined option is visually selected/active.
   * @param {string} optionName - The name of the option.
   */
  async assertOptionIsSelected(optionName) {
    const locator = this.optionLocator(optionName);
    await expect(locator).toHaveClass(/active|selected/); // Or toHaveAttribute('aria-selected', 'true')
  }

  /**
   * Asserts that a predefined option is visually deselected/inactive.
   * @param {string} optionName - The name of the option.
   */
  async assertOptionIsDeselected(optionName) {
    const locator = this.optionLocator(optionName);
    await expect(locator).not.toHaveClass(/active|selected/); // Or not.toHaveAttribute('aria-selected', 'true')
  }

  /**
   * Enters a custom ingredient into the input field and confirms its addition.
   * @param {string} ingredient - The custom ingredient to add.
   */
  async addCustomIngredient(ingredient) {
    await this.fillElement(this.customInputField, ingredient);
    await this.clickElement(this.addCustomIngredientButton);
    // Wait for the ingredient to appear in the list or for a message to show
    await this.page.waitForTimeout(100); // Small wait for UI update
  }

  /**
   * Checks if a custom ingredient is displayed in the list of added preferences.
   * @param {string} ingredient - The custom ingredient to check.
   */
  async isCustomIngredientAdded(ingredient) {
    await this.assertElementVisible(this.addedCustomIngredientLocator(ingredient));
  }

  /**
   * Simulates navigating to the next onboarding step.
   * For testing persistence, we'll just navigate away and back.
   */
  async proceedToNextOnboardingStep() {
    // In a real app, this would be clicking a "Next" button and navigating to a new page.
    // For simulation, we'll just navigate to a dummy URL.
    await this.page.goto('/onboarding/next-step-dummy');
  }

  /**
   * Simulates returning to the Onboarding Quiz Screen.
   */
  async returnToOnboardingQuizScreen() {
    await this.goto();
  }

  /**
   * Asserts that an informational message is displayed and visually distinguishable.
   * @param {string} expectedText - The expected text of the informational message.
   */
  async assertInformationalMessage(expectedText) {
    await this.assertElementVisible(this.informationalMessage);
    await this.assertElementContainsText(this.informationalMessage, expectedText);
    // Example visual check: assert a specific color or icon
    await expect(this.informationalMessage).toHaveCSS('color', 'rgb(0, 128, 0)'); // Example: green text
  }

  /**
   * Asserts that a warning message is displayed and visually distinguishable.
   * @param {string} expectedText - The expected text of the warning message.
   */
  async assertWarningMessage(expectedText) {
    await this.assertElementVisible(this.warningMessage);
    await this.assertElementContainsText(this.warningMessage, expectedText);
    // Example visual check: assert a specific color or icon
    await expect(this.warningMessage).toHaveCSS('color', 'rgb(255, 0, 0)'); // Example: red text
  }

  /**
   * Asserts that a feedback message for invalid input is displayed and visually distinguishable.
   * @param {string} expectedText - The expected text of the feedback message.
   */
  async assertFeedbackMessage(expectedText) {
    await this.assertElementVisible(this.feedbackMessage);
    await this.assertElementContainsText(this.feedbackMessage, expectedText);
    // Example visual check: assert a specific color or icon
    await expect(this.feedbackMessage).toHaveCSS('color', 'rgb(255, 165, 0)'); // Example: orange text
  }

  /**
   * Clicks the "Let's keep going" CTA button.
   */
  async clickLetsKeepGoingCTA() {
    await this.clickElement(this.letsKeepGoingButton);
  }
}

