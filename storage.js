// Web3.Storage configuration
const WEB3_STORAGE_TOKEN = 'YOUR_WEB3_STORAGE_TOKEN'; // Replace with your actual token
const VOTES_STORAGE_KEY = 'riggsbook-votes';

// Initialize Web3.Storage client
function getClient() {
    if (typeof window !== 'undefined' && window.Web3Storage) {
        return new window.Web3Storage({ token: WEB3_STORAGE_TOKEN });
    }
    return null;
}

// Generate a unique ID for each quote
function getQuoteId(quote) {
    return `quote-${quote.id}`;
}

// Get votes from local storage
function getLocalVotes() {
    if (typeof localStorage === 'undefined') return {};
    const votes = localStorage.getItem(VOTES_STORAGE_KEY);
    return votes ? JSON.parse(votes) : {};
}

// Save votes to local storage
function saveLocalVotes(votes) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
    }
}

// Get user's vote for a specific quote
function getUserVote(quoteId) {
    const votes = getLocalVotes();
    return votes[quoteId] || 0; // 0 = no vote, 1 = upvote, -1 = downvote
}

// Save user's vote
function saveUserVote(quoteId, vote) {
    const votes = getLocalVotes();
    votes[quoteId] = vote;
    saveLocalVotes(votes);
}

// Get all votes from web3.storage
async function getAllVotes() {
    const client = getClient();
    if (!client) return {};

    try {
        const cid = await client.get(VOTES_STORAGE_KEY);
        if (!cid) return {};
        
        const res = await fetch(`https://${cid}.ipfs.dweb.link/${VOTES_STORAGE_KEY}.json`);
        if (!res.ok) return {};
        
        return await res.json();
    } catch (error) {
        console.error('Error fetching votes:', error);
        return {};
    }
}

// Save votes to web3.storage
async function saveVotes(votes) {
    const client = getClient();
    if (!client) return null;

    try {
        const file = new File([JSON.stringify(votes, null, 2)], `${VOTES_STORAGE_KEY}.json`, {
            type: 'application/json',
        });
        
        const cid = await client.put([file], {
            name: 'Riggsbook Votes',
            wrapWithDirectory: false,
        });
        
        return cid;
    } catch (error) {
        console.error('Error saving votes:', error);
        return null;
    }
}

// Update vote count for a quote
async function updateVote(quoteId, voteChange) {
    try {
        const votes = await getAllVotes();
        votes[quoteId] = (votes[quoteId] || 0) + voteChange;
        await saveVotes(votes);
        return votes[quoteId];
    } catch (error) {
        console.error('Error updating vote:', error);
        return null;
    }
}

export {
    getQuoteId,
    getUserVote,
    saveUserVote,
    getAllVotes,
    updateVote
};
