// Import the builder class from selenium-webdriver
const { Builder } = require('selenium-webdriver');          // For building and configuring WebDriver instances
const chrome = require('selenium-webdriver/chrome');        // For Chrome-specific options and configurations
const fs = require('fs');                   // For file system operations
const path = require('path');               // For handling and transforming file paths


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

async function FillForm(driver, link) {
    // Function to fill out a form can be implemented here
    // Navigate to link page
    await driver.get(link);

    //Make the browser window full screen
    await driver.manage().window().maximize();
    await driver.sleep(3000);

    //Find the username input field by its name and enter text
    await driver.findElement({name: 'username'}).sendKeys('tomsmith');

    //Find the password input field by its name and enter text
    await driver.findElement({name: 'password'}).sendKeys('SuperSecretPassword!');
    await driver.sleep(2000);

    //Find the login button by its class name and click it
    await driver.findElement({className: 'radius'}).click();
    await driver.sleep(5000);

    //Find the logout button by its xpath and click it
    await driver.findElement({xpath: '//*[@id="content"]/div/a/i'}).click();
    await driver.sleep(5000);

}


// Function to open Google in chrome
async function MainControl() {
    // create a new Chrome browser instance
    const { driver, profileDir } = await DriverWithCleanProfile();
    try {
        // Define the link to navigate to
        const link = 'https://the-internet.herokuapp.com/login';

        // Test and actions with the driver can be implemented here
        await FillForm(driver, link);
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
