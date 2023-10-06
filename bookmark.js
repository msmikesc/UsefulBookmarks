function outputParent(parentId, title) {
  const parentLink = document.createElement('a');
  parentLink.className = 'parent-link folder-link';
  parentLink.id = parentId;

  const upDiv = document.createElement('div');
  upDiv.className = 'upDiv';

  const icon = document.createElement('img');
  icon.className = 'bookIcon';
  icon.width = 32;
  icon.height = 32;
  icon.src = 'folder_up_icon.png';

  upDiv.appendChild(icon);
  parentLink.appendChild(upDiv);

  const h2 = document.createElement('h2');
  h2.textContent = title;

  const listBar = document.getElementById('list-bar');
  listBar.innerHTML = ''; // Clear previous content
  listBar.appendChild(parentLink);
  listBar.appendChild(h2);
}

function createFolderElement(bookmark) {
  const folderElement = document.createElement('div');
  folderElement.className = 'bookDiv';
  const folderSpacerElement = document.createElement('div');
  folderSpacerElement.className = 'bookDivSpacer';
  const anchorElement = document.createElement('a');
  anchorElement.className = 'bookA folder-link';
  anchorElement.id = bookmark.id;
  const iconElement = document.createElement('img');
  iconElement.className = 'bookIcon';
  iconElement.width = 32;
  iconElement.height = 32;
  iconElement.src = 'folder_bookmarks.png';
  const textElement = document.createElement('span');
  textElement.className = 'bookText';
  textElement.textContent = bookmark.title;

  anchorElement.appendChild(iconElement);
  anchorElement.appendChild(textElement);
  folderSpacerElement.appendChild(anchorElement);
  folderElement.appendChild(folderSpacerElement);
  document.getElementById('list').appendChild(folderElement);
}

function createBookmarkElement(bookmark) {
  const bookmarkElement = document.createElement('div');
  bookmarkElement.className = 'bookDiv';
  const bookmarkSpacerElement = document.createElement('div');
  bookmarkSpacerElement.className = 'bookDivSpacer';
  const anchorElement = document.createElement('a');
  anchorElement.className = 'bookA';
  anchorElement.href = bookmark.url;
  const iconElement = document.createElement('img');
  iconElement.className = 'bookIcon';
  iconElement.width = 32;
  iconElement.height = 32;
  iconElement.src = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(bookmark.url)}&size=32`;
  const textElement = document.createElement('span');
  textElement.className = 'bookText';
  textElement.textContent = bookmark.title;

  anchorElement.appendChild(iconElement);
  anchorElement.appendChild(textElement);
  bookmarkSpacerElement.appendChild(anchorElement);
  bookmarkElement.appendChild(bookmarkSpacerElement);
  document.getElementById('list').appendChild(bookmarkElement);
}

function printOneBookmark(bookmark) {
  if (bookmark.children) {
    createFolderElement(bookmark);
  } else {
    createBookmarkElement(bookmark);
  }
}

function printAllBookmarks(bookmarks) {
  bookmarks.forEach(printOneBookmark);
}

function handleFolderClick(event) {
  const id = event.target.id;
  document.getElementById('list').innerHTML = '';
  document.getElementById('list-bar').innerHTML = '';
  chrome.bookmarks.getSubTree(id.toString(), whatToDoWhenTreeIsLoaded);
}

function setupFolderClickListeners() {
  const folders = document.querySelectorAll('.parent-link');
  folders.forEach((folder) => {
    folder.addEventListener('click', handleFolderClick);
  });
}

function openLink(url, newTab) {
  chrome.tabs.getCurrent(function (tab) {
    if (newTab) {
      void chrome.tabs.create({ url: url, active: newTab === 1, openerTabId: tab.id });
    } else {
      void chrome.tabs.update(tab.id, { url: url });
    }
  });
}

function fixChromePages() {
  const links = document.getElementsByClassName("top-link");

  for (const child of links) {
    child.addEventListener('click', function () {
      openLink(this.getAttribute("click-link"), 0);
    });
  }
}

function whatToDoWhenTreeIsLoaded(tree) {
  if (tree[0].id !== 0) {
    outputParent(tree[0].parentId, tree[0].title);
  }

  printAllBookmarks(tree[0].children);

  const folders = document.getElementsByClassName("folder-link");

  let i;
  for (i = 0; i < folders.length; i++) {
    folders[i].addEventListener('click', function () {
      printOnePageById(this.id);
    });
  }
}

function printOnePageById(id) {
  document.getElementById('list').innerHTML = '';
  document.getElementById('list-bar').innerHTML = '';
  
  // Get the tree asynchronously
  chrome.bookmarks.getSubTree(id.toString(), whatToDoWhenTreeIsLoaded);
}

document.addEventListener('DOMContentLoaded', function () {
  printOnePageById(2);
  setupFolderClickListeners();
  fixChromePages(); // Call the fixChromePages function here
});

