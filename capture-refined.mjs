/**
 * Refined Playwright script for Send to Timeline feature workflow
 * Focus on capturing detailed chat interactions
 */

import { chromium } from 'playwright';

const baseUrl = 'http://localhost:5173';
const outputDir = '/Users/prithvi/os/tmp/send-to-timeline-screenshots';

async function captureWorkflow() {
  console.log('🚀 Launching browser...\n');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300  // Slower for better visibility
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Navigate directly to project with chat open
    console.log('1️⃣  Navigating to Project-0001...');
    await page.goto(`${baseUrl}/projects/Project-0001`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Ensure chat is visible
    const chatVisible = await page.locator('aside:has-text("Project chat")').isVisible();

    if (!chatVisible) {
      console.log('   Opening chat panel...');
      const meButton = await page.locator('button:has-text("Me")').last();
      if (await meButton.isVisible()) {
        await meButton.click();
        await page.waitForTimeout(500);
        const showChat = await page.locator('text="Show Chat"').first();
        if (await showChat.isVisible()) {
          await showChat.click();
          await page.waitForTimeout(1500);
        }
      }
    }

    console.log('   Chat is visible!\n');

    // SCREENSHOT 1: Initial state
    console.log('📸 Screenshot 1: Initial chat state');
    await page.screenshot({
      path: `${outputDir}/01-chat-initial.png`,
      fullPage: true
    });
    console.log('   ✅ Saved: 01-chat-initial.png\n');

    // Find chat messages - prefer group messages with avatars
    const groupMessages = await page.locator('div.flex.items-end.gap-\\[14px\\]').all();
    console.log(`   Found ${groupMessages.length} group chat messages\n`);

    if (groupMessages.length === 0) {
      console.log('❌ No group messages found, cannot continue');
      return;
    }

    // Select a message to hover (try the second one)
    const messageIndex = Math.min(1, groupMessages.length - 1);
    const targetMessage = groupMessages[messageIndex];

    // Scroll message into view
    await targetMessage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // SCREENSHOT 2: Hover to show action buttons
    console.log('📸 Screenshot 2: Hovering to show Copy and Post buttons');
    await targetMessage.hover({ force: true, position: { x: 100, y: 20 } });
    await page.waitForTimeout(1200); // Wait for hover card to appear

    await page.screenshot({
      path: `${outputDir}/02-hover-icons.png`,
      fullPage: true
    });
    console.log('   ✅ Saved: 02-hover-icons.png\n');

    // Look for the hover card buttons
    const hoverCard = await page.locator('div[class*="absolute"][class*="flex"]:has(button)').first();

    if (await hoverCard.isVisible()) {
      console.log('   ✨ Hover card is visible!');

      // Find Copy and Post buttons
      const allButtons = await hoverCard.locator('button').all();
      console.log(`   Found ${allButtons.length} buttons in hover card\n`);

      if (allButtons.length >= 2) {
        const postButton = allButtons[1]; // Second button should be Post

        // SCREENSHOT 3: Hover over Post button for tooltip
        console.log('📸 Screenshot 3: Hovering over Post button to show tooltip');
        await postButton.hover();
        await page.waitForTimeout(600); // Wait for tooltip animation (400ms + buffer)

        await page.screenshot({
          path: `${outputDir}/03-tooltip.png`,
          fullPage: true
        });
        console.log('   ✅ Saved: 03-tooltip.png\n');

        // SCREENSHOT 4: Click Post button for success state
        console.log('📸 Screenshot 4: Clicking Post button - success state');
        await postButton.click();
        await page.waitForTimeout(500); // Capture during success animation

        await page.screenshot({
          path: `${outputDir}/04-success-feedback.png`,
          fullPage: true
        });
        console.log('   ✅ Saved: 04-success-feedback.png\n');

        // Wait for success animation to complete
        await page.waitForTimeout(1500);

        // SCREENSHOT 5: Switch to History tab
        console.log('📸 Screenshot 5: Switching to History tab to show timeline');
        const historyTab = await page.locator('button:has-text("History")').first();

        if (await historyTab.isVisible()) {
          await historyTab.click();
          await page.waitForTimeout(2000); // Wait for content to load

          // Look for highlighted timeline item
          const highlightedItem = await page.locator('[style*="background"]').first();
          if (await highlightedItem.isVisible()) {
            await highlightedItem.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
          }

          await page.screenshot({
            path: `${outputDir}/05-timeline-highlight.png`,
            fullPage: true
          });
          console.log('   ✅ Saved: 05-timeline-highlight.png\n');
        } else {
          console.log('   ⚠️  History tab not found\n');
        }

      } else {
        console.log('   ⚠️  Expected 2 buttons but found', allButtons.length);
      }
    } else {
      console.log('   ⚠️  Hover card not visible\n');
    }

    console.log('✨ All screenshots captured successfully!\n');
    console.log(`📁 Location: ${outputDir}`);
    console.log('\n📸 Screenshots:');
    console.log('   • 01-chat-initial.png       - Project chat with messages');
    console.log('   • 02-hover-icons.png        - Hover card with Copy + Post buttons');
    console.log('   • 03-tooltip.png            - Post button tooltip');
    console.log('   • 04-success-feedback.png   - Success checkmark after posting');
    console.log('   • 05-timeline-highlight.png - History tab with posted message');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);

    // Take a debug screenshot
    await page.screenshot({ path: `${outputDir}/debug-error.png` });
    console.log('Saved debug screenshot');
  } finally {
    console.log('\n🔒 Closing browser...');
    await browser.close();
  }
}

captureWorkflow();
