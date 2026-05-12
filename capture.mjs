/**
 * Playwright script to capture Send to Timeline feature workflow (ESM format)
 */

import { chromium } from 'playwright';

const baseUrl = 'http://localhost:5173';
const outputDir = '/Users/prithvi/os/tmp/send-to-timeline-screenshots';

async function captureWorkflow() {
  console.log('🚀 Launching browser...\n');
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Step 1: Navigate to app and go to Projects
    console.log('1️⃣  Navigating to app...');
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click on Projects in navigation
    console.log('2️⃣  Navigating to Projects...');
    const projectsNav = await page.locator('text=Projects').first();
    if (await projectsNav.isVisible()) {
      await projectsNav.click();
      await page.waitForTimeout(1500);
    }

    // Navigate directly to a project
    console.log('3️⃣  Opening Project-0001 (Agentic Kanban)...');
    await page.goto(`${baseUrl}/projects/Project-0001`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify we're on a project page
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    // Look for chat panel - check if already open
    console.log('4️⃣  Checking for chat panel...');

    // Check for various chat selectors
    const chatSelectors = [
      'aside:has(header):has-text("Project chat")',
      'aside:has-text("Project chat")',
      '[class*="chat"]',
      'header:has-text("Project chat")'
    ];

    let chatVisible = false;
    for (const selector of chatSelectors) {
      if (await page.locator(selector).first().isVisible()) {
        console.log(`   Found chat with selector: ${selector}`);
        chatVisible = true;
        break;
      }
    }

    if (!chatVisible) {
      console.log('   Chat not visible, looking for toggle...');

      // Try clicking the "Me" button to open menu
      const meButton = await page.locator('button:has-text("Me"), [role="button"]:has-text("Me")').last();
      if (await meButton.isVisible()) {
        console.log('   Found "Me" button, clicking to open menu...');
        await meButton.click();
        await page.waitForTimeout(800);

        // Screenshot the menu
        await page.screenshot({ path: `${outputDir}/debug-menu.png` });
        console.log('   Saved debug screenshot of menu');

        // Look for "Show Chat" option in menu
        const showChatOption = await page.locator('text="Show Chat"').first();
        if (await showChatOption.isVisible()) {
          console.log('   Found "Show Chat" option, clicking...');
          await showChatOption.click();
          await page.waitForTimeout(1500);
          chatVisible = true;
        } else {
          console.log('   "Show Chat" not found in menu, trying "Panels"...');
          // Maybe it's under a Panels submenu
          const panelsOption = await page.locator('text="Panels"').first();
          if (await panelsOption.isVisible()) {
            console.log('   Found "Panels" menu item');
          }
        }
      } else {
        console.log('   "Me" button not found');
      }
    } else {
      console.log('   Chat panel already visible!');
    }

    // SCREENSHOT 1: Initial state with chat visible
    console.log('\n📸 Capture 1: Project page with chat...');
    await page.screenshot({
      path: `${outputDir}/01-chat-initial.png`,
      fullPage: true
    });
    console.log('✅ Saved: 01-chat-initial.png');

    // Find group chat messages (messages with avatar)
    console.log('\n5️⃣  Looking for chat messages...');
    let chatMessages = await page.locator('div.flex.items-end.gap-\\[14px\\]').all();
    console.log(`   Found ${chatMessages.length} group chat messages with standard selector`);

    // If not found, try to find any message in the chat
    if (chatMessages.length === 0) {
      chatMessages = await page.locator('aside div[class*="rounded-"][class*="bg-"]').all();
      console.log(`   Trying alternative selector: found ${chatMessages.length} elements`);
    }

    if (chatMessages.length > 0) {
      // Try hovering over the second message (first might be from current user)
      const messageIndex = chatMessages.length > 1 ? 1 : 0;
      const targetMessage = chatMessages[messageIndex];

      console.log(`\n   Selected message ${messageIndex + 1} of ${chatMessages.length} for hover test`);

      // SCREENSHOT 2: Hover state
      console.log('\n📸 Capture 2: Hovering over message...');
      await targetMessage.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Hover on the message bubble specifically
      await targetMessage.hover({ force: true });
      await page.waitForTimeout(1500); // Wait longer for hover card animation

      await page.screenshot({
        path: `${outputDir}/02-hover-icons.png`,
        fullPage: true
      });
      console.log('✅ Saved: 02-hover-icons.png');

      // Find the Post button - try multiple selectors
      let postButton = await page.locator('button[aria-label="Post to timeline"]').first();

      if (!(await postButton.isVisible())) {
        console.log('   Post button not visible with aria-label, trying text selector...');
        postButton = await page.locator('button:has-text("Post"), button:has-text("timeline")').first();
      }

      if (!(await postButton.isVisible())) {
        console.log('   Checking for any hover buttons...');
        const anyButton = await page.locator('button[class*="hover"], div[class*="hover"] button').first();
        if (await anyButton.isVisible()) {
          console.log('   Found a hover button!');
          postButton = anyButton;
        }
      }

      if (await postButton.isVisible()) {
        // SCREENSHOT 3: Tooltip
        console.log('\n📸 Capture 3: Showing tooltip...');
        await postButton.hover();
        await page.waitForTimeout(600); // Wait for tooltip (400ms delay + buffer)
        await page.screenshot({
          path: `${outputDir}/03-tooltip.png`,
          fullPage: true
        });
        console.log('✅ Saved: 03-tooltip.png');

        // SCREENSHOT 4: Success state
        console.log('\n📸 Capture 4: Clicking Post button...');
        await postButton.click();
        await page.waitForTimeout(400); // Capture during success animation
        await page.screenshot({
          path: `${outputDir}/04-success-feedback.png`,
          fullPage: true
        });
        console.log('✅ Saved: 04-success-feedback.png');

        // Wait for animation to complete
        await page.waitForTimeout(1500);

        // SCREENSHOT 5: History tab with highlight
        console.log('\n📸 Capture 5: Switching to History tab...');
        const historyTab = await page.locator('button:has-text("History")').first();
        if (await historyTab.isVisible()) {
          await historyTab.click();
          await page.waitForTimeout(1500);

          await page.screenshot({
            path: `${outputDir}/05-timeline-highlight.png`,
            fullPage: true
          });
          console.log('✅ Saved: 05-timeline-highlight.png');
        }
      } else {
        console.log('⚠️  Post button not found');
      }
    } else {
      console.log('⚠️  No group chat messages found');
    }

    console.log('\n✨ Screenshot capture complete!');
    console.log(`📁 Location: ${outputDir}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\n🔒 Closing browser...');
    await browser.close();
  }
}

captureWorkflow();
