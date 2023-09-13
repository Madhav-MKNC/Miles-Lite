chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.geth3) {
    const otherUser = document.querySelector("._3W2ap")
      ? document.querySelector("._3W2ap").innerText
      : "";
    sendResponse({ otherUserName: otherUser });
  }
})


