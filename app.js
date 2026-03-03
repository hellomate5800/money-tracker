// Initialize app
const amountInput = document.getElementById('amountInput');
const descriptionInput = document.getElementById('descriptionInput');
const addMoneyBtn = document.getElementById('addMoneyBtn');
const subtractMoneyBtn = document.getElementById('subtractMoneyBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const totalBalanceDisplay = document.getElementById('totalBalance');
const transactionsList = document.getElementById('transactionsList');

const STORAGE_KEY = 'moneyTrackerData';

// Load data from localStorage
let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Display transactions on load
displayTransactions();
updateBalance();

// Event listeners
addMoneyBtn.addEventListener('click', () => addTransaction('add'));
subtractMoneyBtn.addEventListener('click', () => addTransaction('subtract'));
clearAllBtn.addEventListener('click', clearAllData);

// Allow Enter key to add transaction
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTransaction('add');
});

descriptionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTransaction('add');
});

function addTransaction(type) {
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim() || (type === 'add' ? 'Income' : 'Expense');

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const transaction = {
        id: Date.now(),
        amount: amount,
        type: type,
        description: description,
        date: new Date().toLocaleString()
    };

    transactions.unshift(transaction);
    saveData();
    displayTransactions();
    updateBalance();

    // Clear inputs
    amountInput.value = '';
    descriptionInput.value = '';
    amountInput.focus();
}

function displayTransactions() {
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-message">No transactions yet</p>';
        return;
    }

    transactionsList.innerHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-date">${transaction.date}</div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'add' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

function updateBalance() {
    let balance = 0;
    transactions.forEach(transaction => {
        if (transaction.type === 'add') {
            balance += transaction.amount;
        } else {
            balance -= transaction.amount;
        }
    });
    totalBalanceDisplay.textContent = '$' + balance.toFixed(2);
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function clearAllData() {
    if (confirm('Are you sure you want to delete all transactions? This cannot be undone.')) {
        transactions = [];
        saveData();
        displayTransactions();
        updateBalance();
    }
}

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
        // Service worker registration failed, app still works offline
    });
}

// Install prompt handling
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});