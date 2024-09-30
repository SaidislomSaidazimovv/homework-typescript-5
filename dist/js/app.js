"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $overlay = document.querySelector("#overlay");
const $modal = document.querySelector("#modal");
const $incomeBtn = document.querySelector("#incomeBtn");
const $expenseBtn = document.querySelector("#expenseBtn");
const $closeBtn = document.querySelector("#closeBtn");
const $transactionForm = document.querySelector("#transactionForm");
const $alertError = document.querySelector("#alertError");
const $AddIncome = document.querySelector("#Income");
const $AddExpense = document.querySelector("#Expense");
String.prototype.separateCurrency = function () {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const url = new URL(location.href);
const ALL_TRANSACTIONS = JSON.parse(localStorage.getItem("transactions")) || [];
const getCurrentQuery = () => {
    return new URLSearchParams(location.search).get("modal") || "";
};
const checkModalOpen = () => {
    let openModal = getCurrentQuery();
    let $select = $transactionForm.querySelector("select");
    if (openModal === "income") {
        $overlay.classList.remove("hidden");
        $select.classList.add("hidden");
    }
    else if (openModal === "expense") {
        $overlay.classList.remove("hidden");
        $select.classList.remove("hidden");
    }
    else {
        $overlay.classList.add("hidden");
    }
};
class Transaction {
    transactionName;
    transactionType;
    transactionAmount;
    type;
    date;
    constructor(transactionName, transactionAmount, transactionType, type) {
        this.transactionName = transactionName;
        this.transactionType = transactionType;
        this.transactionAmount = transactionAmount;
        this.type = type;
        this.date = new Date().getTime();
    }
}
const createNewTransaction = (e) => {
    e.preventDefault();
    let timeOut;
    function showToast() {
        $alertError.classList.remove("hidden");
        timeOut = setTimeout(() => {
            $alertError.classList.add("hidden");
            console.log("finished");
        }, 3000);
    }
    const inputs = Array.from($transactionForm.querySelectorAll("input, select"));
    const values = inputs.map((input) => {
        if (input.type === "number") {
            return +input.value;
        }
        return input.value ? input.value : undefined;
    });
    if (values
        .slice(0, getCurrentQuery() === "income" ? -1 : undefined)
        .every((value) => typeof value === "string"
        ? value?.trim().length > 0
        : value && value > 0)) {
        const newTransaction = new Transaction(...values, getCurrentQuery());
        ALL_TRANSACTIONS.push(newTransaction);
        localStorage.setItem("transactions", JSON.stringify(ALL_TRANSACTIONS));
        window.history.pushState({ path: location.href.split("?")[0] }, "", location.href.split("?")[0]);
        checkModalOpen();
    }
    else {
        clearTimeout(timeOut);
        showToast();
    }
};
const IncomeandExpense = () => {
    const totalIncome = ALL_TRANSACTIONS.reduce((acc, nextIncome) => acc + nextIncome.transactionAmount, 0);
    const totalExpense = ALL_TRANSACTIONS.reduce((acc, nextIncome) => acc + nextIncome.transactionAmount, 0);
    $AddIncome.innerHTML = `${totalExpense.toString().separateCurrency()} USD`;
    $AddExpense.innerHTML = `${(totalIncome - totalExpense)
        .toString()
        .separateCurrency()} USD`;
};
IncomeandExpense();
$transactionForm.addEventListener("submit", createNewTransaction);
$incomeBtn.addEventListener("click", () => {
    url.searchParams.set("modal", "income");
    window.history.pushState({ path: location.href + "?" + url.searchParams }, "", location.href + "?" + url.searchParams);
    checkModalOpen();
});
$expenseBtn.addEventListener("click", () => {
    url.searchParams.set("modal", "expense");
    window.history.pushState({ path: location.href + "?" + url.searchParams }, "", location.href + "?" + url.searchParams);
    checkModalOpen();
});
$closeBtn.addEventListener("click", () => {
    window.history.pushState({ path: location.href.split("?")[0] }, "", location.href.split("?")[0]);
    checkModalOpen();
});
checkModalOpen();
localStorage.setItem("transactions", JSON.stringify(ALL_TRANSACTIONS));
const getAllTransactions = () => {
    return JSON.parse(localStorage.getItem("transactions") || "[]");
};
const renderTransactions = () => {
    const allTransactions = getAllTransactions();
    const $transactionsList = document.querySelector("#transactionsList");
    $transactionsList.innerHTML = "";
    allTransactions.forEach((transaction) => {
        const $transaction = document.createElement("li");
        $transaction.classList.add("list-group-item", "flex", "justify-between", "items-center", "mt-3");
        $transaction.innerHTML = `
        
                <li   class="  ml-5 w-[1400px]  hover:bg-${transaction.transactionType === "income"
            ? "green-100"
            : "red-100"} flex justify-between items-center p-6 bg-${transaction.transactionType === "income" ? "green-50" : "red-50"} shadow-lg rounded-lg transition-transform transform hover:scale-105">
    
        <span class="font-semibold text-xl text-gray-900">${transaction.transactionName}</span>
        <span class="text-sm text-gray-500">${transaction.transactionType}</span>
   
    <span class="font-bold text-lg text-${transaction.transactionType === "income" ? "green-500" : "red-500"}">${transaction.transactionAmount} so'm</span>
    <span class="text-sm text-gray-400">${new Date(transaction.date).toLocaleDateString()}</span>
</li>



        `;
        $transactionsList.appendChild($transaction);
    });
};
renderTransactions();
$transactionForm.addEventListener("submit", createNewTransaction);
