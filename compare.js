// DOM Elements
const quoteOption1 = document.getElementById('quoteOption1');
const quoteOption2 = document.getElementById('quoteOption2');
const leaderboardEl = document.getElementById('leaderboard');

// Quotes data
const quotes = [
    { 
        id: 1, 
        text: "Jake Paul is not a good role model, guys", 
        author: "Mr. Riggs",
        category: 'wisdom'
    },
    { 
        id: 2, 
        text: "I spend a lot of time with women from age 25-30", 
        author: "Mr. Riggs",
        category: 'comedy'
    },
    { 
        id: 3, 
        text: "You're not as smart as you think you are", 
        author: "Mr. Riggs",
        category: 'based'
    },
    { 
        id: 4,
        text: "To appear tall, surround yourself with short people",
        author: "Mr. Riggs",
        category: 'wisdom'
    },
    { 
        id: 5,
        text: "If you think about it, aren't most stereotypes accurate? I mean, there's a reason they exist.",
        author: "Mr. Riggs",
        category: 'based'
    }
];

let currentPair = [];
let leaderboard = JSON.parse(localStorage.getItem('riggsbookLeaderboard')) || {};

// Initialize leaderboard with default values if not exists
quotes.forEach(quote => {
    if (!leaderboard[quote.id]) {
        leaderboard[quote.id] = {
            ...quote,
            score: 1000,
            wins: 0,
            matches: 0
        };
    }
});

// Save leaderboard to localStorage
function saveLeaderboard() {
    localStorage.setItem('riggsbookLeaderboard', JSON.stringify(leaderboard));
}

// Get two random quotes that aren't the same
function getRandomPair() {
    let firstIndex = Math.floor(Math.random() * quotes.length);
    let secondIndex;
    
    do {
        secondIndex = Math.floor(Math.random() * quotes.length);
    } while (firstIndex === secondIndex);
    
    return [quotes[firstIndex], quotes[secondIndex]];
}

// Update the UI with a new pair of quotes
function selectNewPair() {
    const loading = document.getElementById('loadingIndicator');
    if (loading) loading.style.display = 'block';
    
    setTimeout(() => {
        currentPair = getRandomPair();
        
        if (currentPair.length === 2) {
            updateQuoteCard(quoteOption1, currentPair[0]);
            updateQuoteCard(quoteOption2, currentPair[1]);
        }
        
        if (loading) loading.style.display = 'none';
    }, 100);
}

// Update a quote card with data
function updateQuoteCard(element, quote) {
    if (!quote || !element) return;
    
    try {
        const content = element.querySelector('.quote-content');
        const author = element.querySelector('.quote-author');
        const category = element.querySelector('.quote-category');
        const button = element.querySelector('.select-btn');
        
        if (content) content.textContent = `"${quote.text}"`;
        if (author) author.textContent = `— ${quote.author}`;
        if (category) {
            category.textContent = quote.category;
            category.className = `quote-category category-${quote.category}`;
        }
        if (button) button.dataset.quoteId = quote.id;
    } catch (error) {
        console.error('Error updating quote card:', error);
    }
}

// Calculate new Elo ratings
function calculateNewRatings(winnerId, loserId) {
    const K = 32;
    const winner = leaderboard[winnerId];
    const loser = leaderboard[loserId];
    
    if (!winner || !loser) return;
    
    const expectedWinner = 1 / (1 + Math.pow(10, (winner.score - loser.score) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (loser.score - winner.score) / 400));
    
    winner.score = Math.round(winner.score + K * (1 - expectedWinner));
    winner.wins = (winner.wins || 0) + 1;
    winner.matches = (winner.matches || 0) + 1;
    
    loser.score = Math.round(loser.score + K * (0 - expectedLoser));
    loser.matches = (loser.matches || 0) + 1;
    
    updateLeaderboard();
    saveLeaderboard();
}

// Update the leaderboard display
function updateLeaderboard() {
    const sortedLeaderboard = Object.values(leaderboard)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    
    leaderboardEl.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr>
                    <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Rank</th>
                    <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Quote</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">Score</th>
                    <th style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">Wins</th>
                </tr>
            </thead>
            <tbody>
                ${sortedLeaderboard.map((quote, index) => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${index + 1}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${quote.text}">
                            "${quote.text.substring(0, 50)}${quote.text.length > 50 ? '...' : ''}"
                        </td>
                        <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #4a6fa5;">${quote.score}</td>
                        <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">${quote.wins || 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Event delegation for selection buttons
document.addEventListener('click', (e) => {
    const button = e.target.closest('.select-btn');
    if (!button) return;
    
    const selectedId = parseInt(button.dataset.quoteId);
    if (!selectedId || !currentPair.length === 2) return;
    
    const otherId = currentPair.find(q => q.id !== selectedId)?.id;
    
    if (otherId) {
        calculateNewRatings(selectedId, otherId);
        selectNewPair();
    }
});

// Initialize
updateLeaderboard();
selectNewPair();