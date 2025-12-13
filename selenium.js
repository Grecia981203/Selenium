// Import the builder class from selenium-webdriver
const { Builder, Browser } = require('selenium-webdriver');

// Function to open Google in chrome
async function openGoogleInChrome() {
    // create a new Chrome browser instance
    let driver = await new Builder().forBrowser(Browser.CHROME).build();

    // Navigate to Google's homepage
    await driver.get('https://www.google.com');

    //Make the browser window full screen
    await driver.manage().window().maximize();

    // Wait for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Click on button with xpath
    await driver.findElement({xpath: '//*[@id="gb"]/div[3]/a'}).click();

    // Close the driver
    //await driver.quit();
}

openGoogleInChrome();
