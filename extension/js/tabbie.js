(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
This file actually manages the tabs
*/
storage = chrome.storage.sync;
const helper = require('../tabhelper.js');

function loadTabs() {
  //all items in an array
  storage.get(null, function(items) {
    ////console.log("FROM ALL: ", items);
    ////console.log("all items in tabgroups: ", items);
    if(items){
      //prints group
      //console.log("number of tabgroups: ", items.length);
      //loop through all tabgroups
      let arr = [];
      for(var date in items){
        arr.push(date);
      }
      for(let i = arr.length-1; i >= 0; i--){
        let date = arr[i];
        let group = document.createElement('div');
        let groupName = document.createElement('div');
        let groupRestore = document.createElement('div');
        let groupDelete = document.createElement('div');
        let infoBar = document.createElement('div');
        group.className = "tabGroup";
        groupName.className = "groupName";
        groupName.innerHTML = '<h3>' + date + '</h3>';
        groupRestore.className = "restore";
        groupRestore.title = "restore this group";
        groupRestore.addEventListener('click', restoreGroup(date));
        groupDelete.className = "delete";
        groupDelete.title = "delete this group";
        groupDelete.addEventListener('click', deleteGroup(date));
        infoBar.className = "infoBar";
        infoBar.appendChild(groupName);
        infoBar.appendChild(groupRestore);
        infoBar.appendChild(groupDelete);
        document.body.querySelector("#list").appendChild(group).appendChild(infoBar);
        //print tabs in a group
        //console.log(date);
        let tabGroup = items[date].tabGroup;
        console.log(tabGroup);
        for(let j = 0; j < tabGroup.length; j++){
          let tab = document.createElement('div');
          //the title div of the tab in tab
          let title = document.createElement('div');
          //favicon part of the tab
          let tabFavicon = document.createElement('div');
          tab.className = 'tab';
          title.className = 'title';
          tabFavicon.className = 'favicon';
          //console.log("faviconUrl: ", tabGroup[j].favIconUrl);
          tabFavicon.style.backgroundImage = 'url(' + tabGroup[j].favIconUrl + ')';
          var linkText = document.createTextNode(tabGroup[j].title);
          title.title = tabGroup[j].title;
          tab.title = tabGroup[j].title;
          title.innerHTML = '<h3>' + title.title + '</h3>';
          tab.href = tabGroup[j].url;
          tab.id = tabGroup[j].id;
          //console.log('id: ', tab.id);
          tab.className = "tab";
          tab.appendChild(title);
          tab.appendChild(tabFavicon);
          let data = {};
          data.date = date;
          data.url = tab.href;
          //console.log(data);
          tab.addEventListener('click', restoreTab(data));
          document.body.querySelector('.tabGroup:last-child').appendChild(tab);
          document.body.appendChild(document.createElement("br"));
        }
        document.body.appendChild(document.createElement("br"));
      }
    }
  });
}

function saveAll(){
  event.preventDefault();
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    helper.saveTabs(tabs);
  });
}

function savePinned(){
  event.preventDefault();
  chrome.tabs.query({ currentWindow: true, pinned: true}, function (tabs) {
    helper.saveTabs(tabs);
  });
}

function deleteGroup(group){
  return function(event){
    let groupObject = event.target.closest('.tabGroup');
    event.preventDefault();
    if (confirm("Are you sure you want to delete this group of tabs?") == true) {
      storage.get(group, function(tabs) {
        console.log("hi ", tabs);
        for(let x in tabs){
          console.log("x: ", x);
          chrome.storage.sync.remove(group);
        }
      });
      groupObject.style = "display:none";
    }
  }
}

function restoreGroup(group){
  return function(event){
    let groupObject = event.target.closest('.tabGroup');
    event.preventDefault();
    console.log("test");
    storage.get(group, function(tabs) {
      console.log("hi ", tabs);
      for(let x in tabs){
        console.log("x: ", x);
        for(let i = 0; i < tabs[x].tabGroup.length; i++){
          //console.log("cur url: ", items[date].tabGroup[i].url);
          chrome.tabs.create({ url:tabs[x].tabGroup[i].url, active: false });
        }
        chrome.storage.sync.remove(group);
        // chrome.tabs.query({url: chrome.extension.getURL('maintab.html')}, function(x){
        //   console.log(x);
        // });
      }
    });
    groupObject.style = "display:none";
  }
}

function restoreTab(data) {
  //closure to retain data
  return function(evt){
    let tabObject = evt.target.closest('.tab');
    let groupObject = event.target.closest('.tabGroup');
    //console.log("tabobject href: ", tabObject.href);
    let urlString = tabObject.href;
    chrome.tabs.create({ url: urlString, active: false }, function(tab){
      //get the group
      //remove one in the group
      //console.log("data: ", data);
      storage.get(data.date, function(items) {
        let date = data.date;
        //console.log("items: ", items[date]);
        let update = [];
        let removed = 0;
        for(let i = 0; i < items[date].tabGroup.length; i++){
          //console.log("cur url: ", items[date].tabGroup[i].url);
          if(items[date].tabGroup[i].url !== urlString || removed == 1){
            update.push(items[date].tabGroup[i]);
            //console.log("YES");
          } else {
            removed = 1;
          }
        }
        if (update.length > 0) {
          //create new object with group info
          //tabGroups = items.tabGroups;
          let newGroup =
          {
            'tabGroup': update,
            'dateTime': data.date
          }
          let obj = {};
          obj[data.date] = newGroup;
          //items.tabGroups.push(newGroup);
          storage.set(obj);
        } else {
          //remove group
          storage.remove(data.date);
          groupObject.style = "display:none";
        }
      });
    });
    //update client side maybe reload instead
    tabObject.style = "display:none";
  }
}

function restoreAll(){
  storage.get(null, function(tabs) {
    // console.log("hi ", tabs);
    for(let x in tabs){
      // console.log("x: ", x);
      for(let i = 0; i < tabs[x].tabGroup.length; i++){
        chrome.tabs.create({ url:tabs[x].tabGroup[i].url });
      }
    }
  });
  chrome.storage.sync.clear();
}

function main(){
  loadTabs();
  document.querySelector('#saveall').addEventListener('click', saveAll);
  document.querySelector('#savepinned').addEventListener('click', savePinned);
  document.querySelector('#restoreall').addEventListener('click', restoreAll);
}

document.addEventListener('DOMContentLoaded', main);

},{"../tabhelper.js":2}],2:[function(require,module,exports){
function saveTabs(tabs){
  const datetime = getDateString();
  const ids = [];
  const closed = [];
  let exist = 0;
  for(let i = 0; i < tabs.length; i++){
    //ensure tabbie doesn't close
    if(tabs[i].url !== chrome.extension.getURL('maintab.html')){
      ids.push(tabs[i].id);
      closed.push(tabs[i]);
    } else {
      exist = 1;
    }
  }
  if(exist == 0){
    chrome.tabs.create({ url: chrome.extension.getURL('maintab.html'), pinned: true, active: true});
  }
  chrome.tabs.remove(ids, function() { });
  chrome.tabs.reload();
  if (closed.length > 0) {
    storage.get(null, function(items) {
      //create new object with group info
      //tabGroups = items.tabGroups;
      let newGroup =
      {
        'tabGroup': closed,
        'dateTime': datetime
      }
      let obj = {};
      obj[datetime] = newGroup;
      //items.tabGroups.push(newGroup);
      storage.set(obj);
    });
  }
}

function saveCurrTab(tabs){
  const datetime = getDateString();
  if(tabs[0].url !== chrome.extension.getURL('maintab.html')){
    let closed = [tabs[0]];
    chrome.tabs.remove(tabs[0].id, function() { });
    chrome.tabs.reload();
    storage.get(null, function(items) {
      //create new object with group info
      tabGroups = items.tabGroups;
      let newGroup =
      {
        'tabGroup': closed,
        'dateTime': datetime
      }
      let obj = {};
      obj[datetime] = newGroup;
      storage.set(obj);
    });
  }
}

function createTabbie(){
  chrome.tabs.query({index: 0, currentWindow: true }, function(tabs){
    if(tabs[0].url !== chrome.extension.getURL('maintab.html')){
      chrome.tabs.create({ url: chrome.extension.getURL('maintab.html'), index: 0, pinned: true, active: true, currentWindow: true });
    } else {
      chrome.tabs.update(tabs[0].id, {active: true}, function(){
        chrome.tabs.reload();
      });
    }
  });
}

function getDateString(){
  var currentdate = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let ext = "am";
  let hour = (currentdate.getHours()<10?'0':'') + currentdate.getHours();
  let minute = (currentdate.getMinutes()<10?'0':'') + currentdate.getMinutes();
  let second = (currentdate.getSeconds()<10?'0':'') + currentdate.getSeconds();
  if(parseInt(currentdate.getHours()) > 12){
    ext = "pm";
    hour = currentdate.getHours() - 12;
  }
  else if(parseInt(currentdate.getHours()) === 0){
    hour = 12;
  }
  var datetime = months[currentdate.getMonth()] + " "
                + currentdate.getDate()  + ", "
                + currentdate.getFullYear() + " at "
                + hour + ":"
                + minute + ":"
                + second + " " + ext;
                // + ":" + currentdate.getSeconds();
  return datetime;
}

module.exports = {
  saveTabs: saveTabs,
  saveCurrTab: saveCurrTab,
  createTabbie: createTabbie,
  getDateString: getDateString
};

},{}]},{},[1]);
