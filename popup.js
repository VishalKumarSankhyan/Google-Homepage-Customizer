//localStorage.removeItem("setting")
//localStorage.removeItem("shortcutlist")


let setting = localStorage.getItem("setting");
let list = [];


const form = document.getElementById('shortcutForm');
const shortcutList = document.getElementById('draggable-list');

let isUpdate = false;
let updateingElement = null;
let toggleBackgroundSection = false;
let toggleShortcut = false;

if (setting === null) {
  setting = {
    "customBackgroud": false,
    "hideLanguage": false,
    "hideInfo": false,
    "showShortcut": false,
    "backgroudURL": "https://images.unsplash.com/photo-1543107097-ffe418c8d0f0?q=1&w=300&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  };

  localStorage.setItem("setting", JSON.stringify(setting));
} else {
  setting = JSON.parse(setting);
}

window.addEventListener('load', () => {
  list = localStorage.getItem("shortcutlist");
  if (list == null) {
    list = [];
  } else {
    list = JSON.parse(list);
  }

  displayShortcutList(list);

  //console.log(list);

  if (setting.hideLanguage) {
    document.getElementById("myToggle").checked = true;
  } else {
    document.getElementById("myToggle").checked = false;
  }

  if (setting.hideInfo) {
    document.getElementById("myToggle2").checked = true;
  } else {
    document.getElementById("myToggle2").checked = false;
  }

  if (setting.customBackgroud) {
    toggleBackgroundSection = true;
    document.getElementById("myToggle3").checked = true;
    document.getElementById("wallpaper_section").style.display = "block";
  } else {
    toggleBackgroundSection = false;
    document.getElementById("myToggle3").checked = false;
    document.getElementById("wallpaper_section").style.display = "none";
  }

  if (setting.showShortcut) {
    toggleShortcut = true;
    document.getElementById("myToggle4").checked = true;
    document.getElementById("shortcut-section").style.display = "display";
  } else {
    toggleShortcut = false;
    document.getElementById("shortcut-section").style.display = "none";
    document.getElementById("myToggle4").checked = false;
  }
})

document.getElementById("myToggle").addEventListener("click", (e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleLanguage" });
  });

  setting.hideLanguage = !setting.hideLanguage;
  localStorage.setItem("setting", JSON.stringify(setting));

});


document.getElementById("myToggle2").addEventListener("click", (e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleInfo" });
  });
  setting.hideInfo = !setting.hideInfo;
  localStorage.setItem("setting", JSON.stringify(setting));

});

document.getElementById("myToggle3").addEventListener("click", (e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "CustomBackgroud" });
  });

  if (toggleBackgroundSection == false) {
    document.getElementById("wallpaper_section").style.display = "grid";

    setting.customBackgroud = true;
  } else {
    document.getElementById("wallpaper_section").style.display = "none";
    setting.customBackgroud = false;
  }
  toggleBackgroundSection = !toggleBackgroundSection;
  localStorage.setItem("setting", JSON.stringify(setting));

});


document.getElementById("myToggle4").addEventListener("click", (e) => {
  let shortcutSection = document.getElementById("shortcut-section");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleShortcut" });
  });

  if (toggleShortcut == false) {
    shortcutSection.style.display = "block";
    setting.showShortcut = true;
  } else {
    shortcutSection.style.display = "none";
    setting.showShortcut = false;
  }
  toggleShortcut = !toggleShortcut;

  localStorage.setItem("setting", JSON.stringify(setting));
});



form.addEventListener('submit', (event) => {
  event.preventDefault();

  const websiteName = document.getElementById('websiteName').value;
  const websiteLink = document.getElementById('websiteLink').value;

  if (isUpdate == false) {
    let item = {
      "websiteName": websiteName,
      "websiteLink": websiteLink
    }

    list.push(item);

    insertDisplayElement(item);

  } else {
    updateingElement.children[0].children[0].innerText = websiteName;
    updateingElement.children[0].children[1].innerText = websiteLink;

    form.lastElementChild.innerText = "Add Shortcut"
    isUpdate = false;
    updateingElement = null;

    list = getList();
  }
  document.getElementById('websiteName').value = "";
  document.getElementById('websiteLink').value = "";

  localStorage.setItem("shortcutlist", JSON.stringify(list));
  sendToContentPage(list);

});


const listItems = document.querySelectorAll('#draggable-list li');

listItems.forEach(item => {
  item.addEventListener('dragstart', dragStart);
  item.addEventListener('dragover', dragOver);
  item.addEventListener('drop', drop);
  item.addEventListener('dragend', dragEnd);
});

let draggedItem = null;

function dragStart(e) {
  draggedItem = this;
  setTimeout(() => this.style.display = 'none', 0);
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  if (this !== draggedItem) {
    const allItems = Array.from(listItems);
    const draggedIndex = allItems.indexOf(draggedItem);
    const targetIndex = allItems.indexOf(this);

    if (draggedIndex < targetIndex) {
      this.parentNode.insertBefore(draggedItem, this.nextSibling);
    } else {
      this.parentNode.insertBefore(draggedItem, this);
    }
  }
}


function dragEnd() {
  setTimeout(() => this.style.display = 'flex', 0);
  draggedItem = null;

  list = getList();

  localStorage.setItem("shortcutlist", JSON.stringify(list));

  sendToContentPage(list)
}


function elementDeleted(element) {
  let current = this;
  current.parentNode.removeEventListener('dragstart', dragStart);
  current.parentNode.removeEventListener('dragover', dragOver);
  current.parentNode.removeEventListener('drop', drop);
  current.parentNode.removeEventListener('dragend', dragEnd);
  current.parentNode.remove();

  list = getList();

  localStorage.setItem("shortcutlist", JSON.stringify(list));
  sendToContentPage(list);
}


//"chrome-search://ntpicon/?size=48@1.500000x&url=https://digicampus.com/"


function sendToContentPage(list) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "shortcutList", list: list });
  });
}


function elementUpdate() {
  let current = this;
  let parentElement = current.parentElement;

  let websiteName = parentElement.children[0].children[0].textContent;
  let websiteLink = parentElement.children[0].children[1].textContent;

  document.getElementById('websiteName').value = websiteName;
  document.getElementById('websiteLink').value = websiteLink;
  form.lastElementChild.innerText = "Update Shortcut"
  isUpdate = true;
  updateingElement = parentElement;
}

function displayShortcutList(list) {
  list.forEach(item => {
    const shortcutElement = document.createElement('li');

    const updateButton = document.createElement("button");
    updateButton.className = "ios-button update";
    updateButton.addEventListener('click', elementUpdate);
    //updateButton.innerText = "Update";
    updateButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512"> <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"/></svg>`;

    const deleteButton = document.createElement("button");
    deleteButton.className = "ios-button delete";
    deleteButton.addEventListener('click', elementDeleted);
    //deleteButton.innerText = "Delete";
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>`;


    shortcutElement.draggable = true;
    shortcutElement.innerHTML = `
      <div>
      <span class="website-name">${item.websiteName}</span>
      <a href="${item.websiteLink}" class="website-url" target="_blank">${item.websiteLink}</a>
      </div>
       <!--<button class="ios-button update">Update</button>
              <button class="ios-button delete" onclick="elementDeleted(this)">Delete</button> -->
    `;

    shortcutElement.appendChild(updateButton);
    shortcutElement.appendChild(deleteButton);

    shortcutList.appendChild(shortcutElement);

    shortcutElement.addEventListener('dragstart', dragStart);
    shortcutElement.addEventListener('dragover', dragOver);
    shortcutElement.addEventListener('drop', drop);
    shortcutElement.addEventListener('dragend', dragEnd);
  });
}


function insertDisplayElement(item) {
  const shortcutElement = document.createElement('li');

  const updateButton = document.createElement("button");
  updateButton.className = "ios-button update";
  updateButton.addEventListener('click', elementUpdate);
  //updateButton.innerText = "Update";
  updateButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512"> <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"/></svg>`;


  const deleteButton = document.createElement("button");
  deleteButton.className = "ios-button delete";
  deleteButton.addEventListener('click', elementDeleted);
  //deleteButton.innerText = "Delete";
  deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>`;

  shortcutElement.draggable = true;
  shortcutElement.innerHTML = `
      <div>
      <span class="website-name">${item.websiteName}</span>
      <a href="${item.websiteLink}" class="website-url" target="_blank">${item.websiteLink}</a>
      </div>
       <!--<button class="ios-button update">Update</button>
              <button class="ios-button delete" onclick="elementDeleted(this)">Delete</button> -->
    `;

  shortcutElement.appendChild(updateButton);
  shortcutElement.appendChild(deleteButton);

  shortcutList.appendChild(shortcutElement);

  shortcutElement.addEventListener('dragstart', dragStart);
  shortcutElement.addEventListener('dragover', dragOver);
  shortcutElement.addEventListener('drop', drop);
  shortcutElement.addEventListener('dragend', dragEnd);
}


function getList() {
  let newlist = [];
  const listItems = document.querySelectorAll('#draggable-list li');
  listItems.forEach(item => {
    newlist.push({
      "websiteName": item.children[0].children[0].textContent,
      "websiteLink": item.children[0].children[1].textContent
    })
  })
  return newlist;
}


let wallpapers = [
  "https://images.unsplash.com/photo-1543107097-ffe418c8d0f0?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1543510755-795d493b4a59?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1543532224-f27c14ca2540?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1543467573-fd63c26102c5?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1502083728181-687546e77613?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1508233620467-f79f1e317a05?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1543739970-9f00688c2285?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1543758539-1c5cdd494a14?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1543759126-913bea5ce7eb?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1450542814732-e210d1b7b938?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1525755314970-da06742b3792?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1544048512-8720c557deb3?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1544044307-d09d2ef95e18?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
]

window.addEventListener('load', () => {
  let wallpaper_selector_conatiner = document.getElementsByClassName("wallpaper_selector_conatiner");

  let wallpaper_selector = document.createElement('div');
  wallpaper_selector.className = "wallpaper_selector active";
  wallpaper_selector.innerHTML = `
    <img src="${setting.backgroudURL}" alt="wallpaper 1">`;

  wallpaper_selector.addEventListener('click', selectWallpaper);
  wallpaper_selector_conatiner[0].appendChild(wallpaper_selector);


  wallpapers.forEach(wallpaper => {
    wallpaper = wallpaper.replace("q=80", "q=1");
    wallpaper = wallpaper.replace("w=1770", "w=300")

    if(wallpaper != setting.backgroudURL){
      wallpaper_selector = document.createElement('div');
      wallpaper_selector.className = "wallpaper_selector";
      wallpaper_selector.innerHTML = `
      <img src="${wallpaper}" alt="wallpaper 1">`;
      wallpaper_selector.addEventListener('click', selectWallpaper);
      wallpaper_selector_conatiner[0].appendChild(wallpaper_selector);
    }

  })
})

function selectWallpaper() {
  let parentElement = this.parentElement;
  let firstElement = parentElement.children[0];

  let imageUrl = this.children[0].src;

  setting.backgroudURL = imageUrl;
  localStorage.setItem("setting", JSON.stringify(setting));

  imageUrl = imageUrl.replace("q=1", "q=40");
  imageUrl = imageUrl.replace("w=300", "w=1272");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "changeBackgroud", url: imageUrl });
  });

  wallpaper_selector = document.createElement('div');
  wallpaper_selector.className = "wallpaper_selector active";
  wallpaper_selector.innerHTML = `
  <img src="${setting.backgroudURL}" alt="wallpaper 1">`;
  wallpaper_selector.addEventListener('click', selectWallpaper);

  firstElement.className = "wallpaper_selector";
  parentElement.appendChild(wallpaper_selector);
  parentElement.insertBefore(wallpaper_selector, firstElement);

  this.removeEventListener('click', selectWallpaper);
  this.remove();
}

let toggleMore = false;
let view_more_button = document.getElementById("view-more-button");
view_more_button.addEventListener('click',()=>{
  let wallpaper_selector_conatiner = document.getElementsByClassName("wallpaper_selector_conatiner");

  if(toggleMore == false){
    wallpaper_selector_conatiner[0].style.maxHeight = "100%";
    view_more_button.innerText = "View Less";
  }else{
    wallpaper_selector_conatiner[0].style.maxHeight = "132px";
    view_more_button.innerText = "View More";
  }
  toggleMore = !toggleMore;
})