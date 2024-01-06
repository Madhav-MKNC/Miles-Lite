// this file accomplishes the task of 'content.js' from version 0.2 (miles-frontend-v0.2)

/* Save the "self" user name */
function saveUserName(self_user) {
    const existingData = JSON.parse(localStorage.getItem("miles2")) || {
        conversation_data: {
            "test": ["chhatri leni hai", "chats", [0, 20, 40, 50, 60, 70, 80], ""],
        },
        toggleState: "",
        user_name: "",
    };

    existingData.user_name = self_user;
    localStorage.setItem("miles2", JSON.stringify(existingData));
}


/* Get the "self" user name */
function getUserName() {
    const data = localStorage.getItem("miles2");
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            return parsedData.user_name;
        } catch (error) {
            console.error("Error parsing data from localStorage:", error);
            return "";
        }
    }
    return "";
}


// get context from conversation
function fetchMessages(sentgoal) {
    const chatElements = document.querySelectorAll(".copyable-text");
    const otherUser = document.querySelector("._3W2ap")
        ? document.querySelector("._3W2ap").innerText
        : "";
    let thisUser = getUserName() ? getUserName() : "";

    const usernames = new Set();

    const chats = Array.from(chatElements)
        .filter((element) => element.getAttribute("data-pre-plain-text")) // Filter out elements with no 'data-pre-plain-text' attribute
        .map((element) => {
            const info = element.getAttribute("data-pre-plain-text");

            // const username = info.trim().slice(20, -1);
            const usernameStartIndex = info.indexOf("] ") + 2;
            const usernameEndIndex = info.lastIndexOf(":");
            const username = info.slice(usernameStartIndex, usernameEndIndex);
            usernames.add(username); // Add username to a set

            const messageElement = element.querySelector(".selectable-text");
            const messageText = messageElement ? messageElement.innerText : "";

            // If the message is an outgoing message (from "You:"), then set the thisUser
            if (element.closest(".message-out")) {
                thisUser = username;
                saveUserName(thisUser);
            }

            return {
                sender: username,
                message: messageText,
            };
        });

    // If there are more than two users, including "thisUser", then it's a group chat
    const isGroup = usernames.size > 2;

    // Sending goal for this conversation (if any)
    const goal = sentgoal;

    // WA number
    const userID = localStorage.getItem('last-wid-md') ? localStorage.getItem('last-wid-md').match(/"(\d+):/)[1] : "";
    const otherUserID = document.querySelector('[data-id]').getAttribute('data-id').match(/_(\d+)@/)[1];

    /*
    {
      thisUser: string,
      otherUser: string,
      isGroup: boolean,
      goal: string,
      chats: array,
      userID: string,
      otherUserID: string
    }
    */

    return {
        thisUser: thisUser,
        otherUser: otherUser,
        isGroup: isGroup,
        goal: goal,
        chats: chats,
        userID: userID,
        otherUserID: otherUserID
    }
}


// fetch reply from server
async function get_repy_from_server(data) {
    console.log("generating reply...");

    const response = await fetch("https://a26018af-2571-4e26-814a-d76d486b7bcf-00-38iqwn06wxrli.asia-a.replit.dev/get_reply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.reply;
}


// display the generated reply
function placeSuggestedReply(reply) {
    const inputBar = document.querySelector("footer");
    const replyElement = document.createElement("div");
    replyElement.style.backgroundColor = "#1E1E26";
    replyElement.style.opacity = "100%";
    replyElement.style.borderRadius = "5px";
    replyElement.style.padding = "8px";
    replyElement.style.width = "60%";
    replyElement.style.height = "auto";
    replyElement.style.margin = "20px";
    replyElement.style.cursor = "pointer";
    replyElement.style.border = "1px solid rgba(255, 255, 255, 0.8)";
    replyElement.style.boxShadow = "0px 0px 10px rgba(214, 73, 107, 0.7)";
    replyElement.innerText = reply;
    inputBar.insertBefore(replyElement, inputBar.firstChild);
    replyElement.addEventListener("click", () => {
        navigator.clipboard.writeText(reply).then(
            function () {
                console.log("Copying to clipboard was successful!");
            },
            function (err) {
                console.error("Could not copy text: ", err);
            }
        );
        replyElement.remove();
    });
}


// main
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.backup) {
        (async () => {
            const data = fetchMessages(message.goal);
            sendResponse(data);
            const reply = await get_repy_from_server(data);
            console.log('generated successfully');
            placeSuggestedReply(reply);
        })();
    }
});
