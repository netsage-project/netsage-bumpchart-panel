import { test, expect } from '@grafana/plugin-e2e';

// The provisioned dashboard has two bump chart panels:
//   id 1 — wide-format sample data (12 entities x 8 time buckets)
//   id 2 — a target that returns no data points

test('should display "No data" when the query returns no data points', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '2' });
  await expect(panelEditPage.panel.locator).toContainText('No data');
});

test('should draw nodes when time series data is passed to the panel', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  await gotoPanelEditPage({ dashboard, id: '1' });
  await expect(page.getByTestId('bumpchart-node').first()).toBeVisible();
});
