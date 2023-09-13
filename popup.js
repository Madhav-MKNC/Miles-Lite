let localkey = "miles2";

/* ... */
document.addEventListener('DOMContentLoaded', function () {
  console.log('mkncmkncmknc');
  let dictString = localStorage.getItem(localkey);
  console.log(dictString);
  console.log('mknc2mknc');
  if (!dictString) {
    const data = {
      "conversation_data": {
        "test": ["chhatri leni hai", "chats", [0, 20, 40, 50, 60, 70, 80], ""],
      },
      "toggleState": false,
      "user_name": ''
    }

    localStorage.setItem(localkey, JSON.stringify(data));
    dictString = localStorage.getItem(localkey);
    console.log("New key (miles2) created");
  }
  console.log('fukcme');
  const dict = JSON.parse(dictString)

  if (dict.toggleState) {
    document.getElementById('toggleInput').checked = true;
    document.body.classList.add('show-content');
  }

  document.getElementById('toggleInput').addEventListener('change', function () {
    console.log("toggled");
    document.body.classList.toggle('show-content');
    var dictString = localStorage.getItem(localkey);
    const dict = JSON.parse(dictString)
    // Save the current toggle state to localStorage
    dict.toggleState = this.checked; // Updating the original dict with the modified data
    localStorage.setItem(localkey, JSON.stringify(dict));
    console.log(dict);
  });

  document.getElementById('openApp').addEventListener('click', function () {
    const url = chrome.runtime.getURL('build/index.html');
    window.open(url, '_blank');
  });


  /* h3 */
  var name = ''
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { geth3: true }, function (response) {
      document.querySelector('h3').innerText = response.otherUserName;
      name = response.otherUserName;
      // name = otherUser;
      console.log("name= ");
      console.log(name);
      if (name !== "" && dict.conversation_data[name]) {
        const placeholderValue = dict.conversation_data[name][0];
        document.getElementById('myInput').placeholder = placeholderValue;
      }
      else {
        document.getElementById('myInput').placeholder = '';
      }
    });
  });


  /* ... */
  document.getElementById('setgoal').addEventListener('click', function () {
    var goalInput = document.getElementById('myInput').value;
    console.log('e1');
    if (goalInput !== '') { //only if the goal is legit
      if (dict && dict.conversation_data && dict.conversation_data[name]) { //if there is an entry already
        console.log("milgaya");
        dict.conversation_data[name][0] = goalInput; // Replace the 0th element
        dict.conversation_data[name][2] = []; //reset the y values
        document.getElementById('myInput').value = '';
        document.getElementById('myInput').placeholder = goalInput;
      }
      localStorage.setItem(localkey, JSON.stringify(dict));

      if (dict && dict.conversation_data && (!dict.conversation_data[name])) {
        console.log("nahi mila mkc");
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { getScraped: true }, function (response) {

            console.log(response);
            const thisUser = response.thisUser;
            const otherUserLabel = response.otherUserLabel;
            const isGroup = response.isGroup;
            const chats = response.chats;
            dict.conversation_data[name] = [goalInput, chats, [], '']; // Replace the 0th element
            dict.user_name = thisUser;
            const updatedData = JSON.stringify(dict);
            console.log("###########");
            console.log(thisUser);
            console.log(otherUserLabel);
            console.log(isGroup);
            console.log(chats);
            console.log("###########");
            document.getElementById('myInput').value = '';
            document.getElementById('myInput').placeholder = goalInput;

            // Store it back into localStorage
            localStorage.setItem(localkey, updatedData);
          });
        });
      }
    }
  });


  /* GENERATE REPLY */
  document.getElementById('backup').addEventListener('click', () => {
    console.log("generate request sent")
    let goal = ''
    if (dict.conversation_data[name]) { goal = dict.conversation_data[name][0] }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { backup: true, goal: goal }, function (response) {
        if (dict.conversation_data[name][1] == '') {
          dict.conversation_data[name][1] = response.chats
          const updatedData = JSON.stringify(dict);
          localStorage.setItem(localkey, updatedData);
          console.log("if");
        }
        else {
          if (dict.conversation_data[name][3] === response.chats) {

          }
          else {
            dict.conversation_data[name][1] = dict.conversation_data[name][3]
            dict.conversation_data[name][3] = response.chats
            const updatedData = JSON.stringify(dict);
            localStorage.setItem(localkey, updatedData);
            console.log("else");
          }
        }
      });
    });
  });


  /* ... */
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.clickfrombg) {
      console.log("c1");
      let storedDataString = localStorage.getItem(localkey);
      let storedData = JSON.parse(storedDataString);

      // Assuming otherUserLabel and chats are part of the message
      let otherUserLabel = message.otherUserLabel;
      console.log("c2");
      let chats = message.chats;

      if (storedData.conversation_data[otherUserLabel]) {
        console.log("c3");
        storedData.conversation_data[otherUserLabel][3] = chats;
      }
      console.log("c4");
      localStorage.setItem(localkey, JSON.stringify(storedData));
      console.log("c4");
    }
  });
});

