// TASK: Generate a selenium code to comparing data from a web page and csv file and highlight the differences on the web page
// Import the builder class from selenium-webdriver and all the libraries needed
const { Builder, By } = require('selenium-webdriver');          // For building and configuring WebDriver instances
const chrome = require('selenium-webdriver/chrome');        // For Chrome-specific options and configurations
const fs = require('fs');                   // For file system operations
const csv = require('csv-parser');          // For parsing CSV files    
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
    const { driver, profileDir } = DriverWithCleanProfile();

    try {
        const link = 'https://books.toscrape.com/';

        // ESPERAS a que el CSV esté listo
        savedData = await readCSV('books_titles_prices.csv');

        // AHORA sí comparas
        await PriceAndTitleComparison(driver, link);

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await driver.quit();
        fs.rmSync(profileDir, { recursive: true, force: true });
    }
}

MainControl();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///                 FUNCTIONS USED IN THE MAIN CONTROL FUNCTION BELOW HERE                 ///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let savedData = [];

// Read data from CSV file and store it in savedData array
function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => data.push(row))
            .on('end', () => {
                console.log('CSV file successfully processed');
                resolve(data);
            })
            .on('error', reject);
    });
}

async function PriceAndTitleComparison(driver, link) {
    // Navigate to the link page
    await driver.get(link);
    try {
        //Array to hold current page data
        let currentPageData = [];
        const LimitPage = 2;
        //Loop through the pages
        for (let page = 1; page <= LimitPage; page++) {
            if (page == 1) {
                await driver.get(link);
            } else {
                await driver.get(`${link}catalogue/page-${page}.html`);
            }
            //Wait for the page to load
            await driver.sleep(2000);

            // Find all book elements on the page
            let books = await driver.findElements(By.css('.product_pod')); 
            for (let book of books) {
                let title = await book.findElement(By.css('h3 a')).getAttribute('title');
                let price = await book.findElement(By.css('.price_color')).getText();
                currentPageData.push({Title: title,Price: price }); 
            }
        }
        // Compare current page data with savedData from CSV
        let differences = [];

        for (let i=0; i < savedData.length; i++) {
            let savedItem = savedData[i];
            let currentItem = currentPageData.find(item => item.Title === savedItem.Title);

            if (currentItem) {
                if (currentItem.Price !== savedItem.Price) {
                    differences.push({
                        Title: savedItem.Title,
                        SavedPrice: savedItem.Price,
                        CurrentPrice: currentItem.Price
                    });
                    console.log(`Difference found for "${savedItem.Title}": CSV Price = ${savedItem.Price}, Current Price = ${currentItem.Price}`);
                } else {
                    console.log(`No difference for "${savedItem.Title}": Price = ${savedItem.Price}`);
                }
            } else {
                console.log(`Title "${savedItem.Title}" not found on the web page.`);
            }
        }

        // Save differences to a new CSV file
        if (differences.length > 0) {
            let differenceContent = 'Title,SavedPrice,CurrentPrice\n';
            for (let item of differences) {
                differenceContent += `"${item.Title}","${item.SavedPrice}","${item.CurrentPrice}"\n`;
            }
            fs.writeFileSync('differences_found.csv', differenceContent);
            console.log('Differences saved to differences_found.csv');
        } else {
            console.log('No differences found between CSV and web page data.');
        }
    }
    catch (error) {
        console.error('An error occurred during comparison:', error);
    }

}
