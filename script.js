const modalAdd = document.getElementById("modalAdd");
const modalEdit = document.getElementById("modalEdit");
let currentEditId = null;

document.getElementById("addBtn").onclick = () => modalAdd.style.display = "flex";

window.onload = () => {
  loadTasks();
  initUIAssignments();
};

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks.forEach(addTaskToDOM);
}

function saveTask() {
  const desc = descAdd.value.trim();
  const endTime = endTimeAdd.value;
  if (!desc || !endTime) return alert("Fill all fields");

  const task = {
    id: Date.now(),
    desc,
    startTime: Date.now(),
    endTime,
    status: "todo"
  };

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  addTaskToDOM(task);
  closeModal("modalAdd");
}

function addTaskToDOM(task) {
  const div = document.createElement("div");
  div.className = "task green";
  div.dataset.id = task.id;
  div.dataset.start = task.startTime;
  div.dataset.end = new Date(task.endTime).getTime();

  div.innerHTML = `
    <span>${task.desc}</span>
    <select onchange="moveTask(this)">
      <option value="todo">To Do</option>
      <option value="inprogress">In Progress</option>
      <option value="done">Done</option>
      <option value="pending">Pending</option>
    </select>
  `;

  div.onclick = e => {
    if (e.target.tagName !== "SELECT") openEditModal(task.id);
  };

  div.querySelector("select").value = task.status;
  document.getElementById(task.status + "List").appendChild(div);
  setInterval(() => updateColor(div), 1000);
}

function moveTask(select) {
  const div = select.parentElement;
  const id = Number(div.dataset.id);
  const status = select.value;

  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks = tasks.map(t => t.id === id ? { ...t, status } : t);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  document.getElementById(status + "List").appendChild(div);
}

function updateColor(div) {
  const now = Date.now();
  const start = Number(div.dataset.start);
  const end = Number(div.dataset.end);
  const percent = (end - now) / (end - start);

  const select = div.querySelector("select");

  div.classList.remove("green", "yellow", "red");

  if (select.value === "done") {
    div.classList.add("green");
  } else {
    if (percent <= 0) {
      div.classList.add("red");
      if (select.value !== "pending") {
        select.value = "pending";
        moveTask(select);
      }
    } else if (percent <= 0.25) {
      div.classList.add("yellow");
    } else {
      div.classList.add("green");
    }
  }
}

function openEditModal(id) {
  currentEditId = id;
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const task = tasks.find(t => t.id === id);

  descEdit.value = task.desc;
  endTimeEdit.value = task.endTime;
  statusEdit.value = task.status;
  modalEdit.style.display = "flex";
}

function updateTask() {
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks = tasks.map(t =>
    t.id === currentEditId
      ? { ...t, desc: descEdit.value, endTime: endTimeEdit.value, status: statusEdit.value }
      : t
  );
  localStorage.setItem("tasks", JSON.stringify(tasks));
  location.reload();
}

function deleteTask() {
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks = tasks.filter(t => t.id !== currentEditId);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  location.reload();
}

function initUIAssignments() {
  // WEATHER (Q1 & Q2)
  const weatherContent = document.getElementById("weatherContent");
  const citySelect = document.getElementById("citySelect");

  const coords = {
    "Chennai": { lat: 13.0827, lon: 80.2707 },
    "Bangalore": { lat: 12.9716, lon: 77.5946 },
    "Mumbai": { lat: 19.0760, lon: 72.8777 }
  };

  async function fetchWeather(city) {
    const { lat, lon } = coords[city];
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();

      // Update UI
      weatherContent.innerHTML = `
        🌤️ <b>${city}</b><br>
        🌡️ Temp: ${data.current_weather.temperature}°C<br>
        🌬️ Windspeed: ${data.current_weather.windspeed} km/h<br>
        ⛅ Condition: ${data.current_weather.weathercode}
      `;

      // Q1 - log selected city weather
      console.log(`🌤️ Weather for ${city}:`, data.current_weather);

      // Q2 - log multi-city
      console.log("🌍 Multi-city Weather (Q2):");
      Object.keys(coords).forEach(c => {
        if (c === city) console.log(` ${c}: ${data.current_weather.temperature}°C`);
        else console.log(`⏳ ${c}: waiting for selection`);
      });
    } catch (err) {
      console.error(" Weather fetch failed", err);
    }
  }

  citySelect.onchange = () => fetchWeather(citySelect.value);

  // Initial load
  fetchWeather(citySelect.value);

  // GITHUB PROFILE (Q3)
  const githubContent = document.getElementById("githubContent");
  async function fetchGithubProfile(username) {
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      const data = await res.json();
      githubContent.innerHTML = `
        👤 Name: ${data.name}<br>
        🆔 Username: ${data.login}<br>
        📝 Bio: ${data.bio}<br>
        📦 Repos: ${data.public_repos}<br>
        👥 Followers: ${data.followers}<br>
        ➡️ Following: ${data.following}<br>
        🔗 <a href="${data.html_url}" target="_blank">Profile Link</a>
      `;
      console.log("👨‍💻 GitHub Profile:", data);
    } catch (err) {
      githubContent.innerHTML = " Failed to load GitHub profile";
      console.error(err);
    }
  }

  fetchGithubProfile("Mardhav-B");
}
