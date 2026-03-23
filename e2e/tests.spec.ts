import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'https://localhost:3333';
const PIN = '1234';

test.setTimeout(30000);

test.describe('Antigravity Remote - E2E Tests', () => {
  
  test('✓ should navigate to login page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
    
    const title = await page.title();
    console.log(`Page loaded: ${title}`);
    expect(title).toBeTruthy();
  });

  test('✓ should show form inputs', async ({ page }) => {
    await page.goto(BASE_URL);
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields`);
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('✓ should authenticate with PIN', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: { pin: PIN },
    });
    
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.token).toBeTruthy();
  });

  test('✓ should validate token', async ({ request }) => {
    const login = await request.post(`${API_URL}/api/auth/login`, {
      data: { pin: PIN },
    });
    const token = (await login.json()).token;
    
    const validate = await request.get(`${API_URL}/api/auth/validate`, {
      headers: { 'x-session-token': token },
    });
    
    expect(validate.status()).toBe(200);
    expect((await validate.json()).valid).toBe(true);
  });

  test('✓ should fetch files', async ({ request }) => {
    const login = await request.post(`${API_URL}/api/auth/login`, {
      data: { pin: PIN },
    });
    const token = (await login.json()).token;
    
    const files = await request.get(`${API_URL}/api/files/list`, {
      headers: { 'x-session-token': token },
    });
    
    expect(files.status()).toBe(200);
    expect(Array.isArray((await files.json()).entries)).toBe(true);
  });

  test('✓ should fetch git status', async ({ request }) => {
    const login = await request.post(`${API_URL}/api/auth/login`, {
      data: { pin: PIN },
    });
    const token = (await login.json()).token;
    
    const git = await request.get(`${API_URL}/api/git/status`, {
      headers: { 'x-session-token': token },
    });
    
    expect(git.status()).toBe(200);
    expect((await git.json()).current).toBeDefined();
  });

  test('✓ should reject invalid PIN', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: { pin: '0000' },
    });
    
    expect(response.status()).toBe(401);
  });

  test('✓ should handle chat endpoint', async ({ request }) => {
    const login = await request.post(`${API_URL}/api/auth/login`, {
      data: { pin: PIN },
    });
    const token = (await login.json()).token;
    
    const chat = await request.post(`${API_URL}/api/chat/prompt`, {
      headers: { 'x-session-token': token, 'Content-Type': 'application/json' },
      data: { message: 'test' },
    });
    
    expect(chat.status()).toBeLessThan(500);
  });

  test('✓ should verify server headers', async ({ request }) => {
    const response = await request.get(`${API_URL}/`);
    const headers = response.headers();
    
    expect(headers['x-powered-by']).toBeDefined();
  });
});
