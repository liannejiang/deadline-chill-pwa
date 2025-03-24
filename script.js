let nickname = "";
let taskName = "";
let holeCount = 4;
let subTasks = [];
let currentHole = 0;
let deadline = null;
let startTime = null;
let tasks = [];
let currentTaskIndex = -1;
let history = [];

const randomTournaments = [
  "歐趴公開賽",
  "Deadline盃",
  "死線大師賽",
  "ALLPASS邀請賽",
  "歐趴業餘賽"
];

const encouragementMessages = [
  "你太強了，完美收桿！",
  "神級表現，繼續保持！",
  "這一洞打得太帥啦！",
  "你是Deadline Chill的王者！",
  "輕鬆完賽，超棒der！"
];

function loadTasks() {
  const saved = localStorage.getItem("deadlineChillTasks");
  if (saved) {
    tasks = JSON.parse(saved);
    tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    updateTaskList();
  }
  const savedHistory = localStorage.getItem("deadlineChillHistory");
  if (savedHistory) {
    history = JSON.parse(savedHistory);
    updateHistory();
  }
}

function saveTasks() {
  localStorage.setItem("deadlineChillTasks", JSON.stringify(tasks));
}

function saveHistory() {
  if (history.length > 5) history.shift();
  localStorage.setItem("deadlineChillHistory", JSON.stringify(history));
}

function updateTaskList() {
  tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const list = document.getElementById("task-list");
  list.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.innerText = `${task.taskName}: ${task.currentHole}/${task.holeCount}洞 (截止: ${new Date(task.deadline).toLocaleDateString()})`;
    const timeLeft = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60); // 剩餘小時
    if (timeLeft <= 24) span.className = "deadline-warning"; // 24小時內紅色
    span.onclick = () => continueTask(index);
    const quitBtn = document.createElement("button");
    quitBtn.innerText = "提前結束比賽";
    quitBtn.className = "quit-btn";
    quitBtn.onclick = (e) => {
      e.stopPropagation();
      quitTask(index);
    };
    li.appendChild(span);
    li.appendChild(quitBtn);
    list.appendChild(li);
  });
}

function quitTask(index) {
  if (confirm("確定棄賽嗎？")) {
    const task = tasks[index];
    history.push({
      taskName: task.taskName,
      status: "棄賽",
      date: new Date().toLocaleDateString()
    });
    tasks.splice(index, 1);
    saveTasks();
    saveHistory();
    updateTaskList();
    updateHistory();
  }
}

function startChill() {
  nickname = document.getElementById("nickname").value.trim();
  if (!nickname) {
    alert("請輸入暱稱");
    return;
  }
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("task-input").style.display = "block";
  currentTaskIndex = -1;
  document.getElementById("holeCountInput").value = 4;
  currentHole = 0;
  subTasks = Array(4).fill("待填");
  const randomName = randomTournaments[Math.floor(Math.random() * randomTournaments.length)];
  document.getElementById("taskName").placeholder = `${randomName}（像‘管理學報告’）`;
  document.getElementById("taskName").value = "";
  updateSubTaskList();
}

function continueTask(index) {
  currentTaskIndex = index;
  const task = tasks[index];
  nickname = task.nickname;
  taskName = task.taskName;
  holeCount = task.holeCount;
  subTasks = task.subTasks;
  currentHole = task.currentHole;
  deadline = new Date(task.deadline);
  startTime = new Date(task.startTime);
  console.log(`繼續任務: ${taskName}, 進度: ${currentHole}/${holeCount}`);
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("task-title").innerText = taskName;
  document.getElementById("progress").innerText = `${nickname}: ${currentHole}/${holeCount}洞`;
  document.getElementById("ball").style.left = `${(currentHole / holeCount) * 280}px`;
  updateHoleInfo();
  updatePressure();
}

function suggestTasks() {
  taskName = document.getElementById("taskName").value.trim();
  holeCount = parseInt(document.getElementById("holeCountInput").value) || 4;

  if (taskName.includes("作業")) {
    holeCount = 6;
    subTasks = ["找參考資料", "寫大綱", "完成初稿", "修改內容", "檢查格式", "提交作業"];
  } else if (taskName.includes("報告")) {
    holeCount = 8;
    subTasks = ["確定主題", "找資料", "寫大綱", "完成引言", "寫正文", "做結論", "製作PPT", "檢查提交"];
  } else if (taskName.includes("期中考")) {
    holeCount = 5;
    subTasks = ["複習筆記", "做題目", "背重點", "模擬考", "檢查準備"];
  } else if (taskName.includes("期末考")) {
    holeCount = 7;
    subTasks = ["整理筆記", "讀課本", "做考古題", "背重點", "模擬考", "複習講義", "檢查準備"];
  } else if (taskName.includes("考試")) {
    holeCount = 4;
    subTasks = ["讀書", "做題", "背重點", "檢查準備"];
  } else if (taskName.includes("論文")) {
    holeCount = 10;
    subTasks = ["選題", "找文獻", "寫大綱", "引言", "方法", "結果", "討論", "結論", "修改", "提交"];
  } else if (taskName.includes("小組報告")) {
    holeCount = 9;
    subTasks = ["分工", "找資料", "寫大綱", "寫內容", "做PPT", "排練", "修改", "彩排", "報告"];
  } else {
    if (taskName) {
      alert("無建議可用");
    }
    subTasks = Array(holeCount).fill("待填");
  }
  document.getElementById("holeCountInput").value = holeCount;
  updateSubTaskList();
}

function updateSubTaskList() {
  holeCount = parseInt(document.getElementById("holeCountInput").value) || 1;
  if (holeCount < 1) holeCount = 1;
  if (holeCount > 18) holeCount = 18;
  document.getElementById("holeCountInput").value = holeCount;

  let list = document.getElementById("subTasks");
  list.innerHTML = "";
  if (subTasks.length > holeCount) {
    subTasks = subTasks.slice(0, holeCount);
  } else if (subTasks.length < holeCount) {
    subTasks = subTasks.concat(Array(holeCount - subTasks.length).fill("待填"));
  }
  subTasks.forEach(task => {
    let li = document.createElement("li");
    li.innerText = task;
    li.contentEditable = true;
    list.appendChild(li);
  });
}

function updateSubTasks() {
  const list = document.getElementById("subTasks");
  subTasks = Array.from(list.children).map(li => li.innerText.trim() || "待填");
  holeCount = subTasks.length;
  if (holeCount < 1) {
    subTasks = ["待填"];
    holeCount = 1;
  }
  if (holeCount > 18) {
    subTasks = subTasks.slice(0, 18);
    holeCount = 18;
  }
  document.getElementById("holeCountInput").value = holeCount;
}

function updateDeadline() {
  const selectedDate = new Date(document.getElementById("deadline").value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    alert("請選擇今天或未來的日期");
    document.getElementById("deadline").value = "";
    deadline = null;
  } else {
    deadline = selectedDate;
  }
}

function confirmTask() {
  taskName = document.getElementById("taskName").value.trim();
  if (!taskName) {
    alert("別忘了告訴我你要比什麼賽啊！");
    return;
  }
  if (!deadline) {
    alert("比賽日期別忘啦！");
    return;
  }
  if (tasks.some(task => task.taskName === taskName)) {
    alert("任務已存在");
    return;
  }
  updateSubTasks();
  if (subTasks.some(task => task.trim() === "" || task === "待填")) {
    alert("請填寫任務名稱！");
    return;
  }
  startTime = new Date();
  currentHole = 0;
  const task = {
    nickname: nickname,
    taskName: taskName,
    holeCount: holeCount,
    subTasks: subTasks,
    currentHole: currentHole,
    deadline: deadline.toISOString(),
    startTime: startTime.toISOString()
  };
  if (currentTaskIndex === -1) {
    tasks.push(task);
    currentTaskIndex = tasks.length - 1;
  } else {
    tasks[currentTaskIndex] = task;
  }
  console.log(`新任務: ${taskName}, 初始進度: ${currentHole}/${holeCount}`);
  document.getElementById("task-input").style.display = "none";
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("task-title").innerText = taskName;
  document.getElementById("progress").innerText = `${nickname}: ${currentHole}/${holeCount}洞`;
  document.getElementById("ball").style.left = `${(currentHole / holeCount) * 280}px`;
  updateHoleInfo();
  updatePressure();
  saveTasks();
  updateTaskList();
}

function completeHole() {
  if (currentHole < holeCount) {
    currentHole++;
    console.log(`打了一洞: ${currentHole}/${holeCount}`);
    document.getElementById("progress").innerText = `${nickname}: ${currentHole}/${holeCount}洞`;
    let ball = document.getElementById("ball");
    ball.style.left = `${(currentHole / holeCount) * 280}px`;
    updatePressure();
    document.getElementById("encourage").innerText = `${nickname}, Nice Shot!`;
    tasks[currentTaskIndex].currentHole = currentHole;
    updateHoleInfo();
    saveTasks();
    updateTaskList();

    if (currentHole === holeCount) {
      console.log("比賽結束，檢查一桿進洞");
      let timeUsed = (new Date() - startTime) / (1000 * 60 * 60);
      history.push({
        taskName: taskName,
        status: timeUsed < 24 ? "一桿進洞" : "完賽",
        date: new Date().toLocaleDateString()
      });
      showEncouragement();
    }
  } else {
    console.log("無法再打，已達上限");
  }
}

function updatePressure() {
  let now = new Date();
  let timeLeft = (deadline - now) / (1000 * 60 * 60);
  let holesLeft = holeCount - currentHole;
  let pressure = holesLeft / timeLeft;
  let club = document.getElementById("club");
  if (pressure < 0.5) {
    club.innerText = "球桿閃亮";
    club.style.color = "green";
  } else if (pressure < 1) {
    club.innerText = "球桿歪斜";
    club.style.color = "yellow";
  } else {
    club.innerText = "球桿裂開";
    club.style.color = "red";
  }
}

function showEncouragement() {
  console.log("顯示完成鼓勵語");
  const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  document.getElementById("hole-in-one").innerHTML = `<h2 class="pixel-text">${randomMessage}</h2>`;
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("hole-in-one").style.display = "block";
  setTimeout(() => {
    document.getElementById("hole-in-one").style.display = "none";
    document.getElementById("start-screen").style.display = "block";
    tasks.splice(currentTaskIndex, 1);
    currentTaskIndex = -1;
    resetTask();
    saveTasks();
    saveHistory();
    updateTaskList();
    updateHistory();
  }, 3000);
}

function resetTask() {
  currentHole = 0;
  taskName = "";
  holeCount = 4;
  subTasks = [];
  deadline = null;
  startTime = null;
  document.getElementById("progress").innerText = `${nickname}: ${currentHole}/${holeCount}洞`;
  document.getElementById("ball").style.left = "0px";
}

function toggleHistory() {
  const list = document.getElementById("history-list");
  list.style.display = list.style.display === "none" ? "block" : "none";
}

function updateHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "";
  history.forEach(record => {
    const li = document.createElement("li");
    li.innerText = `${record.taskName}: ${record.status} (${record.date})`;
    list.appendChild(li);
  });
}

function goBack() {
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
}

function goBackFromTaskInput() {
  document.getElementById("task-input").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
}

function updateHoleInfo() {
  const currentHoleDisplay = document.getElementById("current-hole");
  const nextHoleDisplay = document.getElementById("next-hole");
  if (currentHole === 0) {
    currentHoleDisplay.innerText = "準備開始第一洞: " + subTasks[0];
    nextHoleDisplay.innerText = holeCount > 1 ? "下一洞: " + subTasks[1] : "僅此一洞！";
  } else {
    currentHoleDisplay.innerText = `正在第${currentHole}洞: ${subTasks[currentHole - 1]}`;
    if (currentHole < holeCount) {
      nextHoleDisplay.innerText = `下一洞: ${subTasks[currentHole]}`;
    } else {
      nextHoleDisplay.innerText = "最後一洞！";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const subTasksList = document.getElementById("subTasks");
  const holeCountInput = document.getElementById("holeCountInput");

  subTasksList.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (subTasks.length < 18) {
        const li = document.createElement("li");
        li.innerText = "待填";
        li.contentEditable = true;
        subTasksList.appendChild(li);
        updateSubTasks();
      } else {
        alert("最多18洞哦！");
      }
    }
  });

  holeCountInput.addEventListener("input", () => {
    holeCount = parseInt(holeCountInput.value) || 1;
    if (holeCount < 1) holeCount = 1;
    if (holeCount > 18) holeCount = 18;
    holeCountInput.value = holeCount;
    updateSubTaskList();
  });

  const observer = new MutationObserver(() => {
    updateSubTasks();
  });
  observer.observe(subTasksList, { childList: true });
});

window.onload = loadTasks;