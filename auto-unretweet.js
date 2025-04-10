/**
 * Twitter Auto-Unretweet Script
 * --------------------------------
 * Automatically unretweets tweets from your timeline or profile page.
 * Handles hidden retweet states by re-retweeting first when necessary.
 *
 * ⚠️ Use this responsibly. Twitter may restrict accounts using automation.
 * 
 * Instructions:
 * 1. Open your Twitter profile or timeline..
 * 2. Open Developer Tools (F12), go to the Console tab.
 * 3. Paste and run this script.
 * 4. To stop, simply refresh the page.
 * 
 * Author: [Your Name or GitHub]
 * License: MIT
 */

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Unretweet a tweet using the visible green "Retweeted" button.
 */
const unretweetTweet = async (tweet) => {
    try {
        const unretweetBtn = tweet.querySelector('[data-testid="unretweet"]');
        if (unretweetBtn) {
            unretweetBtn.click();
            await wait(100);
            const confirmBtn = document.querySelector('[data-testid="unretweetConfirm"]');
            if (confirmBtn) {
                confirmBtn.click();
                console.log('✅ Successfully unretweeted');
            }
        }
    } catch (error) {
        console.error('❌ Error while unretweeting:', error);
    }
};

/**
 * If the green retweet button is not present, re-retweet the tweet
 * and then immediately unretweet it.
 */
const unretweetFallback = async (tweet) => {
    try {
        const retweetBtn = tweet.querySelector('[data-testid="retweet"]');
        if (retweetBtn) {
            retweetBtn.click();
            await wait(100);
            const confirmBtn = document.querySelector('[data-testid="retweetConfirm"]');
            if (confirmBtn) {
                confirmBtn.click();
                console.log('🔁 Retweeted again to allow unretweet');
                await wait(150);
                await unretweetTweet(tweet);
            }
        }
    } catch (error) {
        console.error('❌ Error during fallback retweet:', error);
    }
};

/**
 * Process all currently loaded retweeted tweets on the page.
 */
const processRetweets = async () => {
    const noticeElements = document.querySelectorAll('[data-testid="socialContext"]');
    const tweetList = [];

    // Traverse upward to get the main tweet article
    for (const notice of noticeElements) {
        const tweet = notice.closest('article');
        if (tweet && !tweetList.includes(tweet)) {
            tweetList.push(tweet);
        }
    }

    console.log(`🔍 Found ${tweetList.length} retweeted tweets`);

    for (let i = 0; i < tweetList.length; i++) {
        const tweet = tweetList[i];
        tweet.scrollIntoView({ behavior: 'instant', block: 'center' });

        const hasUnretweet = tweet.querySelector('[data-testid="unretweet"]');
        if (hasUnretweet) {
            console.log(`🔹[${i + 1}] Unretweeting normally`);
            await unretweetTweet(tweet);
        } else {
            console.log(`🔸[${i + 1}] Retweeting again before unretweet`);
            await unretweetFallback(tweet);
        }

        await wait(200); // Delay between tweets
    }

    console.log('✅ Batch completed. Scrolling for more...');
};

/**
 * Main infinite loop to continuously find and unretweet tweets while scrolling down.
 */
const autoUnretweetLoop = async () => {
    let round = 1;
    while (true) {
        console.log(`\n⏱️ Starting round ${round}...`);
        await processRetweets();
        window.scrollBy(0, 1500);
        await wait(2000); // Allow time for new tweets to load
        round++;
    }
};

// 🚀 Start the script
autoUnretweetLoop();
