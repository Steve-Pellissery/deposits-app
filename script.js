// Simple key for localStorage
const STORAGE_KEY = "deposits_events_v1";

let events = [];

// --- Helpers ---

function loadEvents() {
  const raw = localStorage.getItem(STORAGE_KEY);
  events = raw ? JSON.parse(raw) : [];
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
  });
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

function generateId() {
  return "evt_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}

// --- Events list rendering ---

function renderEventsList() {
  const listEl = document.getElementById("events-list");
  const noEventsMsg = document.getElementById("no-events-message");

  listEl.innerHTML = "";

  if (!events.length) {
    noEventsMsg.style.display = "block";
    return;
  }

  noEventsMsg.style.display = "none";

  events
    .slice()
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .forEach((evt) => {
      const card = document.createElement("div");
      card.className = "event-card";
      card.dataset.id = evt.id;

      const main = document.createElement("div");
      main.className = "event-main";

      const name = document.createElement("div");
      name.className = "event-name";
      name.textContent = evt.name || "Untitled Event";

      const date = document.createElement("div");
      date.className = "event-date";
      date.textContent = evt.date || "No date";

      main.appendChild(name);
      main.appendChild(date);

      const meta = document.createElement("div");
      meta.className = "event-meta";
      const count = evt.entries ? evt.entries.length : 0;
      meta.textContent = count ? `${count} deposit(s)` : "No deposits yet";

      card.appendChild(main);
      card.appendChild(meta);

      card.addEventListener("click", () => openEvent(evt.id));

      listEl.appendChild(card);
    });
}

// --- New event rows ---

function addRowToNewTable(initial = { name: "", amount: "", comments: "" }) {
  const tbody = document.getElementById("new-entries-tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" placeholder="Name" value="${initial.name || ""}"></td>
    <td><input type="number" step="0.01" placeholder="Amount" value="${
      initial.amount || ""
    }"></td>
    <td><input type="text" placeholder="Comments" value="${
      initial.comments || ""
    }"></td>
    <td><button type="button" class="remove-row-btn">✕</button></td>
  `;

  const removeBtn = tr.querySelector(".remove-row-btn");
  removeBtn.addEventListener("click", () => tr.remove());

  tbody.appendChild(tr);
}

// --- View/edit event rows ---

function addRowToViewTable(initial = { name: "", amount: "", comments: "" }) {
  const tbody = document.getElementById("view-entries-tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" placeholder="Name" value="${initial.name || ""}"></td>
    <td><input type="number" step="0.01" placeholder="Amount" value="${
      initial.amount || ""
    }"></td>
    <td><input type="text" placeholder="Comments" value="${
      initial.comments || ""
    }"></td>
    <td><button type="button" class="remove-row-btn">✕</button></td>
  `;

  const removeBtn = tr.querySelector(".remove-row-btn");
  removeBtn.addEventListener("click", () => tr.remove());

  tbody.appendChild(tr);
}

// --- Open event for view/edit ---

function openEvent(id) {
  const evt = events.find((e) => e.id === id);
  if (!evt) return;

  document.getElementById("view-event-id").value = evt.id;
  document.getElementById("view-event-name").value = evt.name || "";
  document.getElementById("view-event-date").value = evt.date || "";

  const tbody = document.getElementById("view-entries-tbody");
  tbody.innerHTML = "";

  (evt.entries || []).forEach((entry) => {
    addRowToViewTable(entry);
  });

  showScreen("view-screen");
}

// --- DOMContentLoaded setup ---

document.addEventListener("DOMContentLoaded", () => {
  // Load data
  loadEvents();

  // Default one empty row for new event
  addRowToNewTable();

  // Buttons
  const btnAccessExisting = document.getElementById("btn-access-existing");
  const btnCreateNew = document.getElementById("btn-create-new");
  const backFromExisting = document.getElementById("back-from-existing");
  const backFromCreate = document.getElementById("back-from-create");
  const backFromView = document.getElementById("back-from-view");
  const btnAddRowNew = document.getElementById("btn-add-row-new");
  const btnAddRowView = document.getElementById("btn-add-row-view");
  const btnDeleteEvent = document.getElementById("btn-delete-event");

  const createForm = document.getElementById("create-event-form");
  const viewForm = document.getElementById("view-event-form");

  btnAccessExisting.addEventListener("click", () => {
    renderEventsList();
    showScreen("existing-screen");
  });

  btnCreateNew.addEventListener("click", () => {
    // Reset form + table
    createForm.reset();
    document.getElementById("new-entries-tbody").innerHTML = "";
    addRowToNewTable();
    showScreen("create-screen");
  });

  backFromExisting.addEventListener("click", () => showScreen("home-screen"));
  backFromCreate.addEventListener("click", () => showScreen("home-screen"));
  backFromView.addEventListener("click", () => {
    renderEventsList();
    showScreen("existing-screen");
  });

  btnAddRowNew.addEventListener("click", () => addRowToNewTable());
  btnAddRowView.addEventListener("click", () => addRowToViewTable());

  // Create event form submit
  createForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("new-event-name").value.trim();
    const date = document.getElementById("new-event-date").value;

    const rows = document.querySelectorAll("#new-entries-tbody tr");
    const entries = [];

    rows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      const entry = {
        name: inputs[0].value.trim(),
        amount: inputs[1].value ? parseFloat(inputs[1].value) : "",
        comments: inputs[2].value.trim(),
      };

      if (entry.name || entry.amount || entry.comments) {
        entries.push(entry);
      }
    });

    const newEvent = {
      id: generateId(),
      name,
      date,
      entries,
    };

    events.push(newEvent);
    saveEvents();

    renderEventsList();
    showScreen("existing-screen");
  });

  // View/edit event form submit
  viewForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("view-event-id").value;
    const name = document.getElementById("view-event-name").value.trim();
    const date = document.getElementById("view-event-date").value;

    const rows = document.querySelectorAll("#view-entries-tbody tr");
    const entries = [];

    rows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      const entry = {
        name: inputs[0].value.trim(),
        amount: inputs[1].value ? parseFloat(inputs[1].value) : "",
        comments: inputs[2].value.trim(),
      };

      if (entry.name || entry.amount || entry.comments) {
        entries.push(entry);
      }
    });

    const idx = events.findIndex((e) => e.id === id);
    if (idx !== -1) {
      events[idx] = { id, name, date, entries };
      saveEvents();
    }

    renderEventsList();
    showScreen("existing-screen");
  });

  // Delete event
  btnDeleteEvent.addEventListener("click", () => {
    const id = document.getElementById("view-event-id").value;
    if (!id) return;

    const sure = confirm("Delete this event and all its deposits?");
    if (!sure) return;

    events = events.filter((e) => e.id !== id);
    saveEvents();

    renderEventsList();
    showScreen("existing-screen");
  });

  // Initial list render for safety
  renderEventsList();

  // Register service worker for PWA/offline
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.error("SW registration failed", err));
  }
});
