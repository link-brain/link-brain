document.addEventListener("DOMContentLoaded", () => {
  // افتح النافذة
  const roadmapBtn = document.getElementById("viewRoadmapBtn");
  const roadmapModal = document.getElementById("roadmapModal");
  const closeBtn = document.getElementById("closeRoadmap");

  if (roadmapBtn && roadmapModal) {
    roadmapBtn.addEventListener("click", () => {
      roadmapModal.classList.add("active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      roadmapModal.classList.remove("active");
    });
  }

  // التعامل مع المهام
  const tasks = document.querySelectorAll(".roadmap-task");
  tasks.forEach((task, index) => {
    const taskId = `${document.title}-task-${index}`; // مفتاح فريد لكل كورس

    // استرجاع الحالة من localStorage
    if (localStorage.getItem(taskId) === "done") {
      task.classList.add("done");
    }

    const btn = task.querySelector(".mark-done");
    if (btn) {
      btn.addEventListener("click", () => {
        task.classList.toggle("done");
        if (task.classList.contains("done")) {
          localStorage.setItem(taskId, "done");
        } else {
          localStorage.removeItem(taskId);
        }
      });
    }
  });
});
