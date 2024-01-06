// refresh the whole thing

let localkey = "miles2";

function getConversationData(user, arg) {
    const data = localStorage.getItem("miles");
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            const conversationData = parsedData.conversation_data[user];
            if (conversationData && conversationData.length > 0) {
                if (arg === "goal") {
                    return conversationData[0].trim();
                } else if (arg === "preamble") {
                    return conversationData[1].trim();
                }
            }
        } catch (error) {
            console.error("Error parsing data from localStorage:", error);
            return "";
        }
    }
    return "";
}


/* Save the "self" user name */
function saveUserName(self_user) {
    const existingData = JSON.parse(localStorage.getItem(localkey)) || {
        conversation_data: {
            "test": ["chhatri leni hai", "chats", [0, 20, 40, 50, 60, 70, 80], ""],
        },
        toggleState: "",
        user_name: "",
    };

    existingData.user_name = self_user;
    localStorage.setItem(localkey, JSON.stringify(existingData));
}


/* Get the "self" user name */
function getUserName() {
    const data = localStorage.getItem(localkey);
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


// refresh things
async function refreshClick(data) {
    const response = await fetch("https://a26018af-2571-4e26-814a-d76d486b7bcf-00-38iqwn06wxrli.asia-a.replit.dev/refresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.status;
}


/* main */
document.addEventListener('click', function () {
    // Add a small delay to ensure that the DOM has been updated
    setTimeout(function () {
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
        const goal = getConversationData(otherUser, "goal");

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

        // Send a message to the background.js
        const status = refreshClick({
            thisUser: thisUser,
            otherUser: otherUser,
            isGroup: isGroup,
            goal: goal,
            chats: chats,
            userID: userID,
            otherUserID: otherUserID
        })

    }, 1000); // 1000ms delay, you can adjust this value as needed
});
