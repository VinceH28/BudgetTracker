let db;
//Create new OFFLINE db & request 'budget' database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  //Create object store called "pending"; set autoIncrement to true
  //New transactions stored offline; will clear once the app is back online & the page is refreshed
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  //Before reading from db check if app is offline
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Unable to complete request...Try again!  " + event.target.errorCode);
};

function saveRecord(record) {
  //create transaction on the pending db w/ readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  //Acess pending object store
  const pendingStore = transaction.objectStore("pending");

  //Add record
  pendingStore.add(record);
}

function checkDatabase() {
  //Open transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  //Access pending object store
  const pendingBudgetStore = transaction.objectStore("pending");
  //Get all records from store and set to a variable
  const getAll = pendingBudgetStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          //Successful, open a transaction on pending db
          const transaction = db.transaction(["pending"], "readwrite");

          //Access pending object store
          const pendingBudgetStore = transaction.objectStore("pending");

          //Clear all items in your store
          pendingBudgetStore.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);