const taskInput = document.getElementById("task");
const taskCategory = document.getElementById("category");
const date = document.getElementById("date");
const addBtn = document.getElementById("addbtn");
const tasklist = document.getElementById("tasklist");
const searchInput = document.getElementById("search");
const allBtn = document.getElementById("allbtn");
const pendingBtn = document.getElementById("pendingbtn");
const completedBtn = document.getElementById("completedbtn");

const request = indexedDB.open("TodoDB", 1);

let db;

request.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("todos")) {
    db.createObjectStore("todos", {
      keyPath: "id",
      autoIncrement: true,
    });
  }
};
request.onsuccess = function (event) {
  db = event.target.result;
  readonly();
};

function addTodo() {

  const text = taskInput.value.trim();
  const category = taskCategory.value.trim();

  if (text === "") {
    return;
  }

  const transaction = db.transaction("todos", "readwrite");
  const store = transaction.objectStore("todos");
  const task = {
    text: taskInput.value.trim(),
    category: taskCategory.value.trim(),
    due_date: date.value ? new Date(date.value) : new Date(),
    created_at: new Date(),
    completed_at: null,
  };
  store.add(task);

  taskInput.value = "";
  taskCategory.value = "";
  date.value = "";

}

addBtn.addEventListener("click", function (e) {
  if (!db) {
    return;
  }
  e.preventDefault();
  addTodo();
  readonly();
});

function readonly() {
  const transaction = db.transaction("todos", "readonly");
  const store = transaction.objectStore("todos");
  const request = store.getAll();
  request.onsuccess = function () {
    const tasks = request.result;
    showTask(tasks);
  };
}

function showTask(task) {
  tasklist.innerHTML = "";

  task.forEach((task) => {
    if (currentFLiter === "pending" && task.completed_at !== null) return;
    if (currentFLiter === "completed" && task.completed_at === null) return;

    const query = searchInput.value.trim().toLowerCase();

    const matchSearch =
      task.text.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query);

    if (!matchSearch) return;

    const li = document.createElement("li");

    // dlt button
    const dltbtn = document.createElement("button");
    dltbtn.textContent = "✖";
    dltbtn.addEventListener("click", () => {
      deleteTask(task.id);
      readonly();
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed_at !== null;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        task.completed_at = new Date();
      } else {
        task.completed_at = null;
      }
      updateTask(task);
    });

    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;

    const categorySpan = document.createElement("span");
    categorySpan.textContent = task.category;

    const dueDateSpan = document.createElement("span");
    dueDateSpan.textContent = task.due_date
      ? new Date(task.due_date).toLocaleDateString("en-GB")
      : "";

    li.appendChild(checkbox);
    tasklist.appendChild(li);
    li.appendChild(textSpan);
    li.appendChild(categorySpan);
    li.appendChild(dueDateSpan);
    li.appendChild(dltbtn);
  });
}

// delet button function
function deleteTask(id) {
  const transaction = db.transaction("todos", "readwrite");
  const store = transaction.objectStore("todos");
  store.delete(id);
  transaction.oncomplete = function () {
    readonly();
  };
}

// update function
function updateTask(task) {
  const transaction = db.transaction("todos", "readwrite");
  const store = transaction.objectStore("todos");
  store.put(task);
  transaction.oncomplete = function () {
    readonly();
  };
}

// filter pending or completed task and search task

let currentFLiter = "all";

allBtn.addEventListener("click", () => {
  currentFLiter = "all";
  readonly();
});
pendingBtn.addEventListener("click", () => {
  currentFLiter = "pending";
  readonly();
});
completedBtn.addEventListener("click", () => {
  currentFLiter = "completed";
  readonly();
});

// search task
searchInput.addEventListener("input", () => {
  readonly();
});


// keys 
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    
    if (e.target === date) {
      e.preventDefault();
    }
    
    addBtn.click();
  }});

 
