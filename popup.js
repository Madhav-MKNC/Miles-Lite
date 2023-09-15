let localkey = "miles2";

/* ... */
document.addEventListener('DOMContentLoaded', function () {
  let dictString = localStorage.getItem(localkey);
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
  }
  const dict = JSON.parse(dictString)

  if (dict.toggleState) {
    document.getElementById('toggleInput').checked = true;
    document.body.classList.add('show-content');
  }

  document.getElementById('toggleInput').addEventListener('change', function () {
    document.body.classList.toggle('show-content');
    var dictString = localStorage.getItem(localkey);
    const dict = JSON.parse(dictString)
    // Save the current toggle state to localStorage
    dict.toggleState = this.checked; // Updating the original dict with the modified data
    localStorage.setItem(localkey, JSON.stringify(dict));
  });

  // document.getElementById('openApp').addEventListener('click', function () {
  //   const url = chrome.runtime.getURL('build/index.html');
  //   window.open(url, '_blank');
  // });


  /* h3 */
  var name = ''
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { geth3: true }, function (response) {
      document.querySelector('h3').innerText = response.otherUserName;
      name = response.otherUserName;
      // name = otherUser;
      if (name !== "" && dict.conversation_data[name]) {
        const placeholderValue = dict.conversation_data[name][0];
        document.getElementById('myInput').placeholder = placeholderValue;
      }
      else {
        document.getElementById('myInput').placeholder = '';
      }
    });
  });


  /* GENERATE REPLY */
  document.getElementById('backup').addEventListener('click', () => {
    let goal = ''
    if (dict.conversation_data[name]) { goal = dict.conversation_data[name][0] }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { backup: true, goal: goal }, function (response) {
        if (dict.conversation_data[name][1] == '') {
          dict.conversation_data[name][1] = response.chats
          const updatedData = JSON.stringify(dict);
          localStorage.setItem(localkey, updatedData);
        }
        else {
          if (dict.conversation_data[name][3] === response.chats) {

          }
          else {
            dict.conversation_data[name][1] = dict.conversation_data[name][3]
            dict.conversation_data[name][3] = response.chats
            const updatedData = JSON.stringify(dict);
            localStorage.setItem(localkey, updatedData);
          }
        }
      });
    });
  });


  /* ... */
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.clickfrombg) {
      let storedDataString = localStorage.getItem(localkey);
      let storedData = JSON.parse(storedDataString);

      // Assuming otherUserLabel and chats are part of the message
      let otherUserLabel = message.otherUserLabel;
      let chats = message.chats;

      if (storedData.conversation_data[otherUserLabel]) {
        storedData.conversation_data[otherUserLabel][3] = chats;
      }
      localStorage.setItem(localkey, JSON.stringify(storedData));
    }
  });
});

