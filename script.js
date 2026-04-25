// Life Countdown JavaScript Logic

// Function to calculate remaining time
function calculateTimeRemaining(targetDate) {
    const now = new Date();
    const total = Date.parse(targetDate) - Date.parse(now);
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    const days = Math.floor(total / 1000 / 60 / 60 / 24);
    return {
        total,
        days,
        hours,
        minutes,
        seconds
    };
}

// Function to start the countdown
function startCountdown(targetDate) {
    const interval = setInterval(() => {
        const remaining = calculateTimeRemaining(targetDate);
        if (remaining.total <= 0) {
            clearInterval(interval);
            console.log("Countdown finished!");
        } else {
            console.log(`Time remaining: ${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes, ${remaining.seconds} seconds`);
        }
    }, 1000);
}

// Function to share the countdown
function shareCountdown(targetDate) {
    const url = encodeURIComponent(window.location.href);
    const text = `Countdown to ${targetDate}: ${calculateTimeRemaining(targetDate).days} days left!`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(shareUrl, '_blank');
}

// Function to download countdown as a text file
function downloadCountdown(targetDate) {
    const remaining = calculateTimeRemaining(targetDate);
    const element = document.createElement('a');
    const file = new Blob([
        `Countdown to ${targetDate}: ${remaining.days} days left!`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'countdown.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Example usage
const countdownDate = '2026-12-31T00:00:00';
startCountdown(countdownDate);