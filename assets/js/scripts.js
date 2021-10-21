/*
 * sammcheese.xyz
 * Copyright (C) 2021 SammCheese using MIT license
 */

function navigate(menuItems, page) {
  document.querySelector(menuItems).animate([
    { opacity: 1 },
    { opacity: 0 }
  ], 500)
  setTimeout(() => {
    window.location.href = page;
  }, 300);
  return;
}

setTimeout(() => document.querySelector(".darkreader") && alert("pls disable darkreader :>"), 1000);