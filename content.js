//localStorage.removeItem("setting")
//localStorage.removeItem("shortcutlist")


document.getElementById("gb").style.background = "transparent";
document.body.style.backgroundSize = "cover";
document.body.style.backgroundRepeat = "no-repeat";
document.body.style.backgroundAttachment = "fixed";
document.body.style.backgroundPosition = "center center";

let beforeElement = document.getElementsByClassName("om7nvf");
let shortcut_container = document.createElement('div');
shortcut_container.className = "shortcut_container";
beforeElement[0].after(shortcut_container);





const customCss = `
    .shortcut_container {
        display: flex;
        flex-wrap: wrap;
        justify-content: start;
        max-width: 425px;
        margin: auto;
    }

    .shortcut_internal_box {
        text-decoration: none;
        width:  65px;
        height: 65px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: transform 0.2s;
        text-decoration:none !important;
    }


    .shortcut_internal_box > div {
        height: 45px;
        width: 45px;
        background-color: #303134;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid #303134;
        display: flex;
        justify-content: center;
        align-items: center;

    }

    .shortcut_internal_box:hover {
        transform: scale(1.05);
    }

    .shortcut_internal_box > div > img {
        max-width: 30px;
        height: 30px;
        object-fit: cover;
        border-radius: 10px;
    }

    .shortcut_internal_box > span {
        color: white;
        margin-top: 5px;
        white-space: nowrap;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 100%;
        text-align: center;
        font-size: 12px;
    }
`;

const styleElement = document.createElement('style');
styleElement.textContent = customCss;
document.head.appendChild(styleElement);



let toggleInfo = false;
let toggleLanguage = false;
let toggleBackground = false;
let toggleShortcut = false;


let setting = localStorage.getItem("setting");
let shortcutList = localStorage.getItem("shortcutlist");


if (setting === null) {
    setting = {
        "customBackgroud": false,
        "hideLanguage": false,
        "hideInfo": false,
        "showShortcut": false,
        "backgroudURL": "https://images.unsplash.com/photo-1543107097-ffe418c8d0f0?q=40&w=1272&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    };

    localStorage.setItem("setting", JSON.stringify(setting));
} else {
    setting = JSON.parse(setting);


    if (setting.hideLanguage) {
        document.getElementsByClassName("qarstb")[0].style.visibility = "hidden";
        toggleLanguage = true;
    } else {
        document.getElementsByClassName("qarstb")[0].style.visibility = "visible";
        toggleLanguage = false;
    }


    if (setting.hideInfo) {
        document.getElementsByClassName("c93Gbe")[0].style.display = "none";
        toggleInfo = true;
    } else {
        document.getElementsByClassName("c93Gbe")[0].style.display = "block";
        toggleInfo = false;
    }

    if (setting.customBackgroud) {
        document.body.style.backgroundImage = `url(${setting.backgroudURL})`;
        toggleBackground = true;
    } else {
        document.body.style.backgroundImage = "unset";
        toggleBackground = false;
    }
}


if (shortcutList === null) {
    shortcutList = [];
} else {
    shortcutList = JSON.parse(shortcutList);
    // console.log(shortcutList);

    displayShortcutList(shortcutList);
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "toggleLanguage") {
        if (toggleLanguage == false) {
            document.getElementsByClassName("qarstb")[0].style.visibility = "hidden";
            setting.hideLanguage = true;
        } else {
            document.getElementsByClassName("qarstb")[0].style.visibility = "visible";
            setting.hideLanguage = false;
        }
        toggleLanguage = !toggleLanguage;
    }

    if (request.action === "toggleInfo") {
        if (toggleInfo == false) {
            document.getElementsByClassName("c93Gbe")[0].style.display = "none";
            setting.hideInfo = true;
        } else {
            document.getElementsByClassName("c93Gbe")[0].style.display = "block";
            setting.hideInfo = false;
        }
        toggleInfo = !toggleInfo;
    }

    if (request.action === "CustomBackgroud") {
        if (toggleBackground == false) {
            document.body.style.backgroundImage = `url(${setting.backgroudURL})`;
            setting.customBackgroud = true;
        } else {
            document.body.style.backgroundImage = "unset";
            setting.customBackgroud = false;
        }
        toggleBackground = !toggleBackground;
    }

    if (request.action === "toggleShortcut") {

        if (toggleShortcut == false) {
            document.getElementsByClassName("shortcut_container")[0].style.display = "flex";
            setting.showShortcut = true;
        } else {
            document.getElementsByClassName("shortcut_container")[0].style.display = "none";
            setting.showShortcut = false;
        }
        toggleShortcut = !toggleShortcut;
    }

    if (request.action === "changeBackgroud") {
        setting.backgroudURL = request.url;
        document.body.style.backgroundImage = `url(${setting.backgroudURL})`;
    }

    localStorage.setItem("setting", JSON.stringify(setting));


    if (request.action === "shortcutList") {
        //console.log(request.list);

        displayShortcutList(request.list)

        localStorage.setItem("shortcutlist", JSON.stringify(request.list));

    }

});

function displayShortcutList(shortcutList) {
    let shortcut_container = document.getElementsByClassName("shortcut_container");
    shortcut_container = shortcut_container[0];
    shortcut_container.innerHTML = "";


    shortcutList.forEach(item => {
        const aHref = document.createElement('a');
        aHref.className = "shortcut_internal_box";
        aHref.href = item.websiteLink;
        aHref.innerHTML = `
    <div>
        <img src="https://www.google.com/s2/favicons?domain=${item.websiteLink}&sz=128" alt=${item.websiteName}>
    </div>
    <span>${item.websiteName}</span>`;

        shortcut_container.append(aHref);
    })

    //console.log(setting);
    if (setting.showShortcut) {
        shortcut_container.style.display = "flex";
        toggleShortcut = true;
    } else {
        shortcut_container.style.display = "none";
        toggleShortcut = false;
    }
}

