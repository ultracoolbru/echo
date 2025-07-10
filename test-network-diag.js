
// Test the network diagnostics function directly
async function testNetworkDiag() {
    console.log('Testing network diagnostics...\n');

    // We need to extract just the network function since it's not exported
    // Let's just run a simple test of the logic

    const axios = require('axios');
    const chalk = require('chalk');

    console.log('\n--- Network Connectivity Check ---');
    const urlsToCheck = ['http://localhost:11434'];
    let allUrlsReachable = true;

    for (const url of urlsToCheck) {
        try {
            if (!url) {
                console.log(chalk.red('URL is undefined or invalid.'));
                allUrlsReachable = false;
                console.log(chalk.red(`URL ${url} is not reachable.`));
                continue;
            }

            let response = await axios.get(url, { timeout: 5000 });

            if (response.status === 200) {
                console.log(chalk.green(`URL ${url} is reachable.`));
                console.log(`Response status: ${response.status}`);
                console.log(`Response status text: ${response.statusText}`);
            } else {
                console.log(chalk.red(`URL ${url} is not reachable.`));
                allUrlsReachable = false;
            }
        } catch (error) {
            console.log(chalk.red(`Error checking URL ${url}: ${error.constructor.name}`));
            allUrlsReachable = false;
        }
    }

    // Final status check after all URLs have been tested
    if (!allUrlsReachable) {
        console.log(chalk.yellow('Warning: Some URLs are not reachable. The CLI might not function correctly.'));
    } else {
        console.log(chalk.green('All URLs are reachable.'));
    }
}

testNetworkDiag();
