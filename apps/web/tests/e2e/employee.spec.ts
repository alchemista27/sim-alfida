import { test, expect } from '@playwright/test';

test.describe('Employee Modul Phase 3', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'karyawan@alfida.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/staff/dashboard');
  });

  test('Karyawan dapat check-in GPS', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: -6.200000, longitude: 106.816666 });

    await page.goto('/staff/attendance');
    await expect(page.locator('text=Check In GPS')).toBeVisible();
    await page.click('button:has-text("Check In GPS")');
    // Assume success notification
    await expect(page.locator('text=Berhasil Check In')).toBeVisible();
  });

  test('Karyawan dapat mengajukan permohonan cuti', async ({ page }) => {
    await page.goto('/staff/leaves');
    await page.click('button:has-text("Ajukan Izin/Cuti")');
    await page.selectOption('select[name="type"]', 'cuti');
    await page.fill('input[name="startDate"]', '2026-09-01');
    await page.fill('input[name="endDate"]', '2026-09-03');
    await page.fill('textarea[name="reason"]', 'Cuti tahunan untuk urusan keluarga');
    await page.click('button:has-text("Submit")');

    await expect(page.locator('text=Pengajuan berhasil disimpan')).toBeVisible();
  });
});
