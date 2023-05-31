export default async ({ page }) => {
	await page.setViewport({ width: 1920, height: 1080 });
	await page.goto('http://resume:4000/resume');
	await page.waitForTimeout(1000);
	const elem = await page.$('html');
	const box = await elem.boundingBox();
	const height = `${box.height}px`;
	return page.pdf({ printBackground: true, height });
};
