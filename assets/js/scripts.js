const API = "https://api.lanyard.rest/v1/users/372148345894076416";

const pages = {
  socials: "/templates/socials.html",
  projects: "/templates/projects.html",
  contributions: "/templates/contributions.html",
  selection: "/templates/selection.html",
};

let interval;

const navigate = async (page) => {
  document
    .querySelector("#content")
    .animate([{ opacity: 1 }, { opacity: 0 }], 500);
  setTimeout(() => {
    fetch(pages[page])
      .then((response) => response.text())
      .then((html) => {
        document.querySelector("#content").innerHTML = html;
        document
          .querySelector("#content")
          .animate([{ opacity: 0 }, { opacity: 1 }], 500);
      })
      .catch((error) => {
        console.error("Error loading page:", error);
      });
  }, 300);
  return;
};

window.onload = () => {
  if (window.location.hash) {
    hashChangeHandler();
  } else {
    navigate("selection");
  }
  resetInterval();
  refreshDiscordStatus();
};

const hashChangeHandler = () => {
  const page = window.location.hash.substring(1);
  if (pages[page]) {
    navigate(page);
  } else {
    navigate("selection");
  }
};

window.addEventListener("hashchange", hashChangeHandler);

const resetInterval = () => {
  if (interval) clearInterval(interval);
  interval = setInterval(refreshDiscordStatus, 60000);
};

const refreshDiscordStatus = () => {
  const data = fetch(API)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching Discord status:", error);
      return null;
    });

  data.then((data) => {
    if (!data || !data.data) {
      console.error("Invalid data received from API");
      return;
    }
  });
  data.then((data) => {
    updateDiscordHtml(data.data);
  });
};

const updateDiscordHtml = (data) => {
  const template = document.getElementById("footer-template");
  if (!template) {
    console.error("Footer template not found");
    return;
  }

  const clone = template.content.cloneNode(true);
  clone.querySelector("#discord-pfp-img").src =
    `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=256`;
  clone.querySelector("#discord-indicator").className =
    `indicator ${data.discord_status}`;

  clone.querySelector("#discord-activity").textContent = makeActivityString(
    data.activities,
  );
  clone.querySelector("#discord-username").textContent =
    `${data.discord_user.display_name}`;
  template.parentNode.replaceChild(clone, template);
};

const makeActivityString = (activities) => {
  if (activities.length === 0) return "No activity";
  if (activities.length === 1) return activities[0].name;
  return `${activities[0].name} +${activities.length - 1}`;
};
