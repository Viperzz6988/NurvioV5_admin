// frontend/admin-dropdown.ts
async function fetchUsers(query = "") {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return data.users;
}
function createItemEl(user) {
  const el = document.createElement("div");
  el.className = "user-item";
  el.setAttribute("role", "option");
  el.dataset.id = String(user.id);
  el.innerHTML = `<span class="left">${user.id}</span><span class="right">${user.username}</span>`;
  return el;
}
async function initUserDropdown(rootId = "userDropdown") {
  const root = document.getElementById(rootId);
  const toggle = root.querySelector(".user-dropdown-toggle");
  const menu = root.querySelector(".user-dropdown-menu");
  const hidden = root.querySelector("#targetUserId");
  let items = [];
  let activeIndex = -1;
  function open() {
    root.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    menu.focus();
  }
  function close() {
    root.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  function render(users) {
    menu.innerHTML = "";
    items = users.map((u) => {
      const item = createItemEl(u);
      item.addEventListener("click", () => selectItem(item));
      menu.appendChild(item);
      return item;
    });
    activeIndex = items.length ? 0 : -1;
    updateActive();
  }
  function updateActive() {
    items.forEach((el, i) => {
      el.id = `user-item-${i}`;
      el.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
      if (i === activeIndex) menu.setAttribute("aria-activedescendant", el.id);
    });
  }
  function selectItem(item) {
    hidden.value = item.dataset.id || "";
    const idText = item.querySelector(".left").textContent || "";
    const usernameText = item.querySelector(".right").textContent || "";
    toggle.querySelector(".user-dropdown-label").textContent = `${idText} \u2014 ${usernameText}`;
    close();
  }
  toggle.addEventListener("click", async () => {
    if (root.classList.contains("open")) {
      close();
    } else {
      open();
      if (items.length === 0) {
        const users = await fetchUsers();
        render(users);
      }
    }
  });
  menu.addEventListener("keydown", (e) => {
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(items.length - 1, activeIndex + 1);
      updateActive();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(0, activeIndex - 1);
      updateActive();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) selectItem(items[activeIndex]);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      toggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) close();
  });
}
window.initUserDropdown = initUserDropdown;
export {
  initUserDropdown
};
//# sourceMappingURL=admin-dropdown.js.map
