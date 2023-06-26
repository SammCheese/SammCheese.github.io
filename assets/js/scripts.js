/*
 * sammcheese.net
 * Copyright (C) 2021 SammCheese using MIT license
 */

async function navigate(menuItems, page) {
  document.querySelector(menuItems).animate([
    { opacity: 1 },
    { opacity: 0 }
  ], 500)
  setTimeout(() => {
    window.location.href = page;
  }, 300);
  return;
}
