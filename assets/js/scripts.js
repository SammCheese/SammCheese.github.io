const API = "https://api.lanyard.rest/v1/users/372148345894076416";
const DISCORD_COLLECTIBLES_API =
  "https://cdn.discordapp.com/assets/collectibles/";
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

const refreshDiscordStatus = async () => {
  try {
    const response = await fetch(API);
    const result = await response.json();

    if (!result || !result.data) {
      console.error("Invalid data received from API");
      return;
    }

    updateDiscordHtml(result.data);
  } catch (error) {
    console.error("Error fetching Discord status:", error);
  }
};

const activityTypes = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  4: "Custom Status",
  5: "Competing in",
};

const updateDiscordHtml = (data) => {
  if (!data) {
    console.error("No data");
    return;
  }
  const container = document.querySelector("#discord-container");
  replaceData(container, data);
};

const replaceData = (elem, data) => {
  const { activities, discord_status, discord_user } = data;
  const discordStatus = makeStatusString(
    activities,
    discord_status,
    discord_user.global_name,
  );
  const avatarUrl = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=256`;

  // Add animated nameplate
  let video = elem.querySelector("#nameplate-video");
  if (discord_user?.collectibles?.nameplate) {
    const animated = `${DISCORD_COLLECTIBLES_API}${discord_user.collectibles.nameplate.asset}asset.webm`;

    if (!video) {
      video = document.createElement("video");
      video.src = animated;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.style.position = "absolute";
      video.style.top = 0;
      video.style.left = 0;
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      video.style.zIndex = -1;
      video.style.borderRadius = "8px";
      video.id = "nameplate-video";
      elem.appendChild(video);
    } else {
      video.src = animated;
    }
  } else if (video) {
    video.remove();
  }

  // Set profile picture and status indicator
  elem.querySelector("#discord-pfp-img").src = avatarUrl;
  elem.querySelector("#discord-indicator").className =
    `indicator ${data.discord_status}`;
  // Online/Idle/DND/Offline status on hover
  elem.querySelector("#discord-indicator").title = discord_status;
  // Status text
  elem.querySelector("#discord-activity").textContent = discordStatus;
  // Activity image and title
  elem.querySelector("#activity-image").replaceChildren(
    (() => {
      const activityImage = getActivityDetails(data.activities);
      const parent = document.createElement("div");
      parent.style.position = "relative";
      if (!activityImage) return parent;
      const img = document.createElement("img");
      img.src = activityImage.url;
      img.title = activityImage.title;
      img.style.maxWidth = "56px";
      img.style.maxHeight = "56px";
      img.style.borderRadius = "8px";
      img.style.position = "relative";
      parent.appendChild(img);
      if (!activityImage.smallUrl) return parent;
      const smallImg = document.createElement("img");
      smallImg.src = activityImage.smallUrl;
      smallImg.title = activityImage.smallTitle;
      smallImg.style.maxWidth = "24px";
      smallImg.style.maxHeight = "24px";
      smallImg.style.borderRadius = "50%";
      smallImg.style.bottom = "0";
      smallImg.style.right = "-6px";
      smallImg.style.position = "absolute";
      parent.appendChild(smallImg);
      return parent;
    })(),
  );
  // Username and global name
  elem.querySelector("#discord-username").textContent =
    discord_user.display_name;
  elem.querySelector("#discord-username").title = discord_user.username;

  return elem;
};

const getActivityDetails = (activities) => {
  if (!activities.length) return null;

  const target = activities.find((a) => a.assets && a.assets.large_image);
  if (!target) return null;

  const largeImage = target.assets.large_image;

  const baseUrl = largeImage.startsWith("mp:external/")
    ? `https://media.discordapp.net/external/${largeImage.substring(12)}`
    : `https://cdn.discordapp.com/app-assets/${target.application_id}/${largeImage}.png`;

  const result = {
    url: baseUrl,
    title: target.assets.large_text || "",
  };

  if (target.assets.small_image) {
    const smallImage = target.assets.small_image;
    result.smallUrl = smallImage.startsWith("mp:external/")
      ? `https://media.discordapp.net/external/${smallImage.substring(12)}`
      : `https://cdn.discordapp.com/app-assets/${target.application_id}/${smallImage}.png`;
    result.smallTitle = target.assets.small_text || "";
  }

  return result;
};

const makeStatusString = (activities, status, state) => {
  if (activities.length) return makeActivityString(activities);
  if (status === "dnd") return "Do Not Disturb";
  if (status === "idle") return "Idle";
  if (status === "offline") return "Offline";
  return "online";
};

const makeActivityString = (activities) => {
  const activity = `${activities[0]?.id === "custom" ? activities[0].state : activities[0].name}`;
  return (
    activityTypes[activities[0].type] +
    " " +
    activity +
    `${activities.length > 1 ? ` +${activities.length - 1}` : ""}`
  );
};
