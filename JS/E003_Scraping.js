// Selenium program to take tittles and prices of the first 2 pages of a website


// Import the builder class from selenium-webdriver and all the libraries needed
const { Builder, By } = require('selenium-webdriver');          // For building and configuring WebDriver instances
const chrome = require('selenium-webdriver/chrome');        // For Chrome-specific options and configurations
const fs = require('fs');                   // For file system operations
const path = require('path');               // For handling and transforming file paths

// Options to a clean profile in Chrome browser
function DriverWithCleanProfile() {
    // Create a new Chrome options instance
    // Base directory for temporary profiles
    const baseDir = 'C:\\Temp\\SeleniumProfiles';
    
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }
    // Unique profile each execution
    const profileDir = path.join(baseDir, `profile_${Date.now()}`);
    fs.mkdirSync(profileDir, { recursive: true });

    let options = new chrome.Options();
    // Clean profile by specifying user data directory
    options.addArguments(`--user-data-dir=${profileDir}`);

    // Disable Password Leak Detection
    options.setUserPreferences({
    "credentials_enable_service": false,
    "profile.password_manager_enabled": false,
    "profile.password_manager_leak_detection": false
    });
    options.addArguments('--disable-features=PasswordLeakDetection');

    // Avoid noise in chrome
    options.addArguments('--no-first-run');
    options.addArguments('--no-default-browser-check');
    options.addArguments('--disable-sync');
    options.addArguments('--disable-notifications');
    options.addArguments('--disable-background-networking');
    options.addArguments('--disable-usb-discovery');
    options.addArguments('--log-level=3');
    options.addArguments('--disable-logging');
    options.addArguments('--silent');

    // Create a new Chrome driver with the specified options
    return { driver: new Builder().forBrowser('chrome').setChromeOptions(options).build(), profileDir };
}

async function MainControl() {
    // create a new Chrome browser instance
    const { driver, profileDir } = await DriverWithCleanProfile();
    try {
        // Define the link to navigate to
        const link = 'https://books.toscrape.com/';

        // Test and actions with the driver can be implemented here
        await ScrapeTitlesAndPrices(driver, link);
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
    await driver.quit();
    try {
        fs.rmSync(profileDir, { recursive: true, force: true });
    } catch (err) {
        console.error('Error deleting profile directory:', err);
    }
    }
}

MainControl();

async function ScrapeTitlesAndPrices(driver, url) {
    // Navigate to the specified URL
    await driver.get(url);
    //Make the browser window full screen
    await driver.manage().window().maximize();
    await driver.sleep(3000);
    const LimitPage = 4; // Number of pages to scrape

    let titles = [];
    let prices = [];
    try {
        // Loop through the first 2 pages to extract titles and prices
        for (let page = 1; page <= LimitPage; page++) {
            // Wait for the page to load
            await driver.sleep(2000);

            // Locate all book elements on the page
            let books = await driver.findElements(By.css('.product_pod'));

            // Extract title and price for each book
            for (let book of books) {
                let title = await book.findElement(By.css('h3 a')).getAttribute('title');
                let price = await book.findElement(By.css('.price_color')).getText();
                titles.push(title);
                prices.push(price);
            }

            // Navigate to the next page if not on the last page
            if (page < LimitPage) {
                let nextButton = await driver.findElement(By.css('.next a'));
                await nextButton.click();
            }

        }

        // Save the titles and prices in a CVS file
        let csvContent = 'Title,Price\n';
        for (let i = 0; i < titles.length; i++) { 
            csvContent += `"${titles[i]}","${prices[i]}"\n`;
        }   
        fs.writeFileSync('books_titles_prices.csv', csvContent);
        console.log('Data saved in -- books_titles_prices.csv --');

    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.sleep(3000);
    }
}

