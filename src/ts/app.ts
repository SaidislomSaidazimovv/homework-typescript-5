const $overlay = document.querySelector("#overlay") as HTMLDivElement;
const $modal = document.querySelector("#modal") as HTMLDivElement;
const $incomeBtn = document.querySelector("#incomeBtn") as HTMLButtonElement;
const $expenseBtn = document.querySelector("#expenseBtn") as HTMLButtonElement;
const $closeBtn = document.querySelector("#closeBtn") as HTMLButtonElement;
const $transactionForm = document.querySelector(
  "#transactionForm"
) as HTMLFormElement;
const $alertError = document.querySelector("#alertError") as HTMLDivElement;
const $AddIncome = document.querySelector("#Income") as HTMLElement;
const $AddExpense = document.querySelector("#Expense") as HTMLElement;

export {};
declare global {
  interface String {
    separateCurrency(): string;
  }
}
String.prototype.separateCurrency = function (): string {
  return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

type Tincome = {
  transactionName: string;
  transactionType: string | undefined;
  transactionAmount: number;
  type: string;
  date: number;
};

const url = new URL(location.href);

const ALL_TRANSACTIONS =
  JSON.parse(localStorage.getItem("transactions") as string) || [];

const getCurrentQuery = () => {
  return new URLSearchParams(location.search).get("modal") || ("" as string);
};

const checkModalOpen = () => {
  let openModal = getCurrentQuery();
  let $select = $transactionForm.querySelector("select") as HTMLSelectElement;
  if (openModal === "income") {
    $overlay.classList.remove("hidden");
    $select.classList.add("hidden");
  } else if (openModal === "expense") {
    $overlay.classList.remove("hidden");
    $select.classList.remove("hidden");
  } else {
    $overlay.classList.add("hidden");
  }
};

class Transaction {
  transactionName: string;
  transactionType: string | undefined;
  transactionAmount: number;
  type: string;
  date: number;
  constructor(
    transactionName: string,
    transactionAmount: number,
    transactionType: string | undefined,
    type: string
  ) {
    this.transactionName = transactionName;
    this.transactionType = transactionType;
    this.transactionAmount = transactionAmount;
    this.type = type;
    this.date = new Date().getTime();
  }
}

const createNewTransaction = (e: Event) => {
  e.preventDefault();

  let timeOut;
  function showToast() {
    $alertError.classList.remove("hidden");
    timeOut = setTimeout(() => {
      $alertError.classList.add("hidden");
      console.log("finished");
    }, 3000);
  }

  const inputs = Array.from(
    $transactionForm.querySelectorAll("input, select")
  ) as HTMLInputElement[];
  const values: (string | number | undefined)[] = inputs.map((input) => {
    if (input.type === "number") {
      return +input.value;
    }
    return input.value ? input.value : undefined;
  });
  if (
    values
      .slice(0, getCurrentQuery() === "income" ? -1 : undefined)
      .every((value) =>
        typeof value === "string"
          ? value?.trim().length > 0
          : value && value > 0
      )
  ) {
    const newTransaction = new Transaction(
      ...(values as [string, number, string | undefined]),
      getCurrentQuery()
    );
    ALL_TRANSACTIONS.push(newTransaction);
    localStorage.setItem("transactions", JSON.stringify(ALL_TRANSACTIONS));
    window.history.pushState(
      { path: location.href.split("?")[0] },
      "",
      location.href.split("?")[0]
    );
    checkModalOpen();
  } else {
    clearTimeout(timeOut);
    showToast();
  }
};

const IncomeandExpense = () => {
  const totalIncome = ALL_TRANSACTIONS.reduce(
    (acc: number, nextIncome: Tincome) => acc + nextIncome.transactionAmount,
    0
  );
  const totalExpense = ALL_TRANSACTIONS.reduce(
    (acc: number, nextIncome: Tincome) => acc + nextIncome.transactionAmount,
    0
  );
  $AddIncome.innerHTML = `${totalExpense.toString().separateCurrency()} USD`;
  $AddExpense.innerHTML = `${(totalIncome - totalExpense)
    .toString()
    .separateCurrency()} USD`;
};

IncomeandExpense();

$transactionForm.addEventListener("submit", createNewTransaction);

$incomeBtn.addEventListener("click", () => {
  url.searchParams.set("modal", "income");
  window.history.pushState(
    { path: location.href + "?" + url.searchParams },
    "",
    location.href + "?" + url.searchParams
  );
  checkModalOpen();
});

$expenseBtn.addEventListener("click", () => {
  url.searchParams.set("modal", "expense");
  window.history.pushState(
    { path: location.href + "?" + url.searchParams },
    "",
    location.href + "?" + url.searchParams
  );
  checkModalOpen();
});

$closeBtn.addEventListener("click", () => {
  window.history.pushState(
    { path: location.href.split("?")[0] },
    "",
    location.href.split("?")[0]
  );
  checkModalOpen();
});

checkModalOpen();

localStorage.setItem("transactions", JSON.stringify(ALL_TRANSACTIONS));

const getAllTransactions = (): Transaction[] => {
  return JSON.parse(localStorage.getItem("transactions") || "[]");
};

const renderTransactions = () => {
  const allTransactions: Transaction[] = getAllTransactions();
  const $transactionsList = document.querySelector(
    "#transactionsList"
  ) as HTMLElement;
  $transactionsList.innerHTML = "";

  allTransactions.forEach((transaction: Transaction) => {
    const $transaction = document.createElement("li");
    $transaction.classList.add(
      "list-group-item",
      "flex",
      "justify-between",
      "items-center",
      "mt-3"
    );
    $transaction.innerHTML = `
        
                <li   class="  ml-5 w-[1400px]  hover:bg-${
                  transaction.transactionType === "income"
                    ? "green-100"
                    : "red-100"
                } flex justify-between items-center p-6 bg-${
      transaction.transactionType === "income" ? "green-50" : "red-50"
    } shadow-lg rounded-lg transition-transform transform hover:scale-105">
    
        <span class="font-semibold text-xl text-gray-900">${
          transaction.transactionName
        }</span>
        <span class="text-sm text-gray-500">${
          transaction.transactionType
        }</span>
   
    <span class="font-bold text-lg text-${
      transaction.transactionType === "income" ? "green-500" : "red-500"
    }">${transaction.transactionAmount} so'm</span>
    <span class="text-sm text-gray-400">${new Date(
      transaction.date
    ).toLocaleDateString()}</span>
</li>



        `;
    $transactionsList.appendChild($transaction);
  });
};

renderTransactions();

$transactionForm.addEventListener("submit", createNewTransaction);
