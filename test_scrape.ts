import * as fs from 'fs';

async function testFetch() {
  const url = "https://missoula.craigslist.org/search/zip";
  console.log("Fetching", url);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
      }
    });
    console.log("Status:", response.status);
    const html = await response.text();
    fs.writeFileSync('c:\\Downloads\\TSS\\Craigslist-Item-Scanner\\Craigslist-Item-Scanner\\cl_test.html', html);
    console.log("Wrote html to cl_test.html. Length:", html.length);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testFetch();
