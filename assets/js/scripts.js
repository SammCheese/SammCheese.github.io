/*
 * sammcheese.xyz
 * Copyright (C) 2021 SammCheese using MIT license
 */

function navigate(menuItems, page) {
  document.querySelector(menuItems).animate([
    { opacity: 1 },
    { opacity: 0 }
  ],
  1000);
  setTimeout(() => {
    window.location.href = page;
  }, 900);
  return;
}