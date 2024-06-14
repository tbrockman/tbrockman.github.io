curl -X POST \
  http://localhost:3000/function?token=who-cares-token \
  -H 'Content-Type: application/javascript' \
  -d 'export default async function ({ page }) {
    await page.goto("http://web:4000/resume.html", { waitUntil: "networkidle2" });

    // Get the height of the rendered page, so we can print a single-page PDF
    const bodyHandle = await page.$("body");
    const { height } = await bodyHandle.boundingBox();
    await bodyHandle.dispose();
    return page.pdf({
        printBackground: true,
        height,
    });
}' > $1