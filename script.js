// DOM Elements
const quotesList = document.getElementById('quotesList');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy = document.getElementById('sortBy');
const expandedQuote = document.getElementById('expandedQuote');
const expandedContent = expandedQuote?.querySelector('.quote-expanded-content');
const closeExpandedBtn = expandedQuote?.querySelector('.close-expanded');

// Format date to be more readable
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Available categories
const categories = ['all', 'wisdom', 'based', 'comedy'];

// Sample quotes data with dates and categories
let quotes = [
    { 
        id: 1, 
        text: "Jake Paul is not a good role model, guys", 
        author: "Mr. Riggs",
        date: '2026-02-02T10:30:00',
        category: 'wisdom',
        tags: ['wisdom']
    },
    { 
        id: 2, 
        text: "I spend a lot of time with women from age 25-30", 
        author: "Mr. Riggs",
        date: '2026-02-02T11:45:00',
        category: 'based',
        tags: ['comedy']
    },
    { 
        id: 3, 
        text: "I like Dilbert. I don't care that he got cancelled", 
        author: "Mr. Riggs",
        date: '2026-02-02T09:15:00',
        category: 'comedy',
        tags: ['based']
    },
    { 
        id: 4,
        text: "To appear tall, surround yourself with short people",
        author: "Mr. Riggs",
        date: '2026-02-02T09:15:00',
        category: 'wisdom',
        tags: ['wisdom']
    }
];

// Current filters
let currentFilters = {
    search: '',
    category: 'all',
    sortBy: 'date-desc' // date-asc, date-desc, a-z, z-a
};

// Initialize the app
function init() {
    // Sort quotes by date (newest first)
    applySorting('date-desc');
    
    // Render initial quotes
    updateQuotesDisplay();
    
    // Add event listeners
    searchInput.addEventListener('input', () => {
        currentFilters.search = searchInput.value.toLowerCase();
        updateQuotesDisplay();
    });
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentFilters.search = '';
        updateQuotesDisplay();
    });
    
    categoryFilter.addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
        updateQuotesDisplay();
    });
    
    sortBy.addEventListener('change', (e) => {
        currentFilters.sortBy = e.target.value;
        updateQuotesDisplay();
    });
    
    // Close expanded view if elements exist
    if (closeExpandedBtn) {
        closeExpandedBtn.addEventListener('click', closeExpandedView);
    }
    
    if (expandedQuote) {
        expandedQuote.addEventListener('click', (e) => {
            if (e.target === expandedQuote) {
                closeExpandedView();
            }
        });
    }
    
    // Close expanded view when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeExpandedView();
        }
    });
}

// Render quotes to the DOM
function renderQuotes(quotesToRender) {
    // Clear current quotes
    if (quotesList) {
        quotesList.innerHTML = '';
        
        if (quotesToRender.length === 0) {
            quotesList.innerHTML = '<p class="no-quotes">No quotes found matching your criteria.</p>';
            return;
        }
        
        // Get the template
        const template = document.getElementById('quoteTemplate');
        
        // Add each quote to the DOM
        quotesToRender.forEach(quote => {
            const clone = template.content.cloneNode(true);
            const quoteCard = clone.querySelector('.quote-card');
            
            // Set quote content, author, and date
            const quoteContent = clone.querySelector('.quote-content');
            const quoteAuthor = clone.querySelector('.quote-author');
            const quoteDate = clone.querySelector('.quote-date');
            
            quoteContent.textContent = `"${quote.text}"`;
            quoteAuthor.textContent = `— ${quote.author}`;
            quoteDate.textContent = formatDate(quote.date);
            
            // Attach category as data attribute for CSS-based coloring
            if (quote.category) {
                quoteCard.dataset.category = quote.category;
            }
            
            // Add click event to show expanded view
            quoteCard.addEventListener('click', () => showExpandedView(quote));
            
            // Add to DOM
            quotesList.appendChild(clone);
        });
    }
}

// Navigate to the quote page
function showExpandedView(quote) {
    // Encode the quote text and date for URL
    const encodedText = encodeURIComponent(quote.text);
    const encodedDate = encodeURIComponent(quote.date);
    const encodedCategory = encodeURIComponent(quote.category || 'based');
    
    // Navigate to the quote page with the quote data as URL parameters
    window.location.href = `quote.html?id=${quote.id}&text=${encodedText}&date=${encodedDate}&category=${encodedCategory}`;
}

// Filter and sort quotes based on current filters
function getFilteredAndSortedQuotes() {
    // Apply search filter
    let filteredQuotes = [...quotes];
    
    // Apply search term filter
    if (currentFilters.search) {
        filteredQuotes = filteredQuotes.filter(quote =>
            quote.text.toLowerCase().includes(currentFilters.search) ||
            quote.author.toLowerCase().includes(currentFilters.search)
        );
    }
    
    // Apply category filter
    if (currentFilters.category !== 'all') {
        filteredQuotes = filteredQuotes.filter(quote => 
            quote.category === currentFilters.category || 
            (quote.tags && quote.tags.includes(currentFilters.category))
        );
    }
    
    // Apply sorting
    return applySorting(currentFilters.sortBy, filteredQuotes);
}

// Apply sorting to quotes
function applySorting(sortBy, quotesToSort = [...quotes]) {
    switch(sortBy) {
        case 'date-desc':
            return [...quotesToSort].sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'date-asc':
            return [...quotesToSort].sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'a-z':
            return [...quotesToSort].sort((a, b) => a.text.localeCompare(b.text));
        case 'z-a':
            return [...quotesToSort].sort((a, b) => b.text.localeCompare(a.text));
        default:
            return quotesToSort;
    }
}

// Update the display based on current filters
function updateQuotesDisplay() {
    const filteredQuotes = getFilteredAndSortedQuotes();
    renderQuotes(filteredQuotes);
}

// Show notification
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);

        // Add styles for the notification
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background-color: var(--primary-color);
                color: white;
                padding: 12px 24px;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s, transform 0.3s;
            }
            
            .notification.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    // Set message and show
    notification.textContent = message;
    notification.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
