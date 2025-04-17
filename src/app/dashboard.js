async function reportIssue(e,t){const a={timestamp:Date(),user_name:await storageUtils.getData("user_name"),user_wa_id:await storageUtils.getData("user_wa_id"),info:e,other_info:t};return new Promise(((e,t)=>{const o=setTimeout((()=>{console.log("Timeout: Issue reporting took too long."),t(new Error("Timeout: Issue reporting took too long."))}),5e3);chrome.runtime.sendMessage({type:"report_issue",data:a},(a=>{clearTimeout(o),a&&a.success?e(a.response):t(a.error||new Error("Unknown error occurred during issue reporting."))}))}))}async function report_error(...e){const t=e.join(" ");console.log("[MILES ERROR]",t),await reportIssue("[frontend] low level error",t)}const STORAGE_KEY="miles2",localStorageUtils={storageKey:"miles2miles2",updateToggleState:function(e){try{const t=localStorage.getItem(this.storageKey),a=t?JSON.parse(t):{};a.toggleState=e,localStorage.setItem(this.storageKey,JSON.stringify(a))}catch(e){console.log("Error updating toggle state:",e)}},getToggleState:function(){try{const e=localStorage.getItem(this.storageKey);return!!e&&JSON.parse(e).toggleState}catch(e){return console.log("Error getting toggle state:",e),!1}}},storageUtils={storageKey:"miles2",defaultConversationData:{goal:"",preamble:"",impression:"",latest_chat:{},prev_replies:[]},defaultData:{conversation_data:{test_chatname:{goal:"",preamble:"",impression:"",latest_chat:{},prev_replies:[]}},user_name:"",user_wa_id:"",user_persona:"The person is a direct and adaptable communicator, switching between formal and informal tones as needed. They use slang occasionally, engage in playful mockery, and respect some but not all. They dislike repetitive conversations and adjust their style based on the situation. Busy with their own life, they keep things straight to the point."},readData:async function(){return new Promise(((e,t)=>{try{chrome.storage.local.get(this.storageKey,(a=>{if(chrome.runtime.lastError)t(new Error(chrome.runtime.lastError));else{const t=a[this.storageKey]?JSON.parse(a[this.storageKey]):this.defaultData;e(t)}}))}catch(e){t(new Error("Error reading data from storage"))}}))},writeData:async function(e){return new Promise(((t,a)=>{try{const o={};o[this.storageKey]=JSON.stringify(e),chrome.storage.local.set(o,(()=>{chrome.runtime.lastError?a(new Error(chrome.runtime.lastError)):t()}))}catch(e){a(new Error("Error writing data to storage"))}}))},updateData:async function(e,t){try{const a=await this.readData();a[e]=t,await this.writeData(a)}catch(e){report_error("Error updating data:",e.message)}},getData:async function(e){try{return(await this.readData())[e]}catch(e){report_error("Error getting data:",e.message)}},getConversationData:async function(e,t){try{const a=await this.getData("conversation_data");return a[e]&&a[e][t]?a[e][t]:this.defaultConversationData[t]}catch(e){report_error("Error getting conversation data:",e.message)}},updateConversationData:async function(e,t,a){try{const o=await this.getData("conversation_data");o[e]||(o[e]={...this.defaultConversationData}),o[e][t]=a,await this.updateData("conversation_data",o)}catch(e){report_error("Error updating conversation data:",e.message)}},updateReplyState:async function(e,t,a){try{const o=await this.getData("conversation_data");o[e]||(o[e]={...this.defaultConversationData}),o[e].prev_replies||(o[e].prev_replies=this.defaultConversationData.prev_replies),o[e].latest_chat||(o[e].latest_chat=this.defaultConversationData.latest_chat),JSON.stringify(t)!==JSON.stringify(o[e].latest_chat)&&(o[e].latest_chat=t,o[e].prev_replies=[]),o[e].prev_replies.push(a),await this.updateData("conversation_data",o)}catch(e){report_error("Error appending new reply in prev_replies:",e.message)}}};function selectConversation(e){try{localStorage.setItem("selectedConversation",e),currentConversation=e,updateActiveConversationUI(e);const t=document.querySelector(".Sidebar");if(!t)throw new Error("Sidebar not found.");t.querySelectorAll("button").forEach((t=>{t.textContent===e?(t.style.backgroundColor="#d6496b",t.style.color="#e4e4ec"):(t.style.backgroundColor="",t.style.color="")}))}catch(e){console.log("Failed to select conversation:",e.message)}}async function updateActiveConversationUI(e){try{const t=document.querySelector(".ActiveName");if(!t)throw new Error("Active name div not found.");t.textContent=e;const a=await storageUtils.getConversationData(e,"goal"),o=document.getElementById("goalInput");if(!o)throw new Error("Goal input element not found.");o.placeholder=a.trim()?a.trim():"";const n=document.querySelector(".GoalInput form");if(!n)throw new Error("Form element not found.");n.onsubmit=function(t){if(t.preventDefault(),o.value.trim()){confirm("Update the goal?")&&set_goal(e,o.value.trim())}else{confirm("Set an empty goal?")&&set_goal(e,"")}},initialize_Preamble_and_Impression(e)}catch(e){console.log("Failed to update active conversation UI:",e.message)}}async function set_goal(e,t){try{await storageUtils.updateConversationData(e,"goal",t),console.log(e,"new goal:",t),document.getElementById("goalInput").value="",document.getElementById("goalInput").placeholder=t}catch(e){console.log("Failed to set goal:",e.message)}}async function initialize_Preamble_and_Impression(e){const t=document.getElementById("PreambleInput"),a=document.getElementById("ImpressionInput");let o="",n="";await storageUtils.getConversationData(e,"preamble").then((e=>{e&&(o=e,t.value=e)})),await storageUtils.getConversationData(e,"impression").then((e=>{e&&(n=e,a.value=e)}));document.querySelector(".Preamble button").addEventListener("click",(async()=>{const a=t.value.trim();if(!a)return console.log("Preamble textarea is empty. Please enter a preamble."),void alert("Preamble textarea is empty. Please enter a preamble.");if(a===o)return void console.log("No changes detected in preamble.");confirm("Update your preamble?")?await storageUtils.updateConversationData(e,"preamble",a).then((()=>{console.log("Preamble updated successfully"),o=a})).catch((e=>{console.log("Failed to update preamble:",e.message)})):console.log("Preamble update was canceled.")}));document.querySelector(".Impression button").addEventListener("click",(async()=>{const t=a.value.trim();if(!t)return console.log("Impression textarea is empty. Please enter an impression."),void alert("Impression textarea is empty. Please enter an impression.");if(t===n)return void console.log("No changes detected in impression.");confirm("Update your impression?")?await storageUtils.updateConversationData(e,"impression",t).then((()=>{console.log("Impression updated successfully"),n=t})).catch((e=>{console.log("Failed to update impression:",e.message)})):console.log("Impression update was canceled.")}))}async function deleteConversation(e){try{const t=await storageUtils.getData("conversation_data");t[e]&&(delete t[e],await storageUtils.updateData("conversation_data",t),localStorage.getItem("selectedConversation")===e&&localStorage.removeItem("selectedConversation"),loadConversations())}catch(e){console.log("Failed to delete conversation:",e.message)}}async function loadConversations(){try{const e=await storageUtils.getData("conversation_data"),t=document.querySelector(".Sidebar");if(!t)throw new Error("Sidebar not found.");t.innerHTML="",Object.keys(e).forEach((e=>{const a=document.createElement("div");a.className="button-container";const o=document.createElement("button");o.textContent=e,o.className="nameButton",o.onclick=()=>{selectConversation(e)};const n=document.createElement("button");fetch("trash-icon.svg").then((e=>e.text())).then((e=>{n.innerHTML=e})),n.className="crossButton",n.onclick=t=>{t.stopPropagation(),confirm("Are you sure you want to delete this entry?")&&deleteConversation(e)},a.appendChild(o),a.appendChild(n),t.appendChild(a)}));const a=localStorage.getItem("selectedConversation");a&&e[a]&&selectConversation(a),initializePersonaEditing()}catch(e){console.log("Failed to load conversations:",e.message)}}let isPersonaEditingInitialized=!1;async function initializePersonaEditing(){const e=document.getElementById("PersonaInput");let t="";await storageUtils.getData("user_persona").then((a=>{a&&(t=a,e.value=a)})).catch((e=>{console.log("Failed to load persona:",e.message)}));const a=document.querySelector(".PersonaInput form");a&&!isPersonaEditingInitialized&&(a.addEventListener("submit",(async function(a){a.preventDefault();const o=e.value.trim();if(!o)return console.log("Persona textarea is empty. Please enter a persona."),void alert("Persona textarea is empty. Please enter a persona.");if(o===t)return void console.log("No changes detected in persona.");confirm("Update your persona?")?await storageUtils.updateData("user_persona",o).then((()=>{console.log("Persona updated successfully"),t=o})).catch((e=>{console.log("Failed to update persona:",e.message)})):console.log("Persona update was canceled.")})),isPersonaEditingInitialized=!0)}document.addEventListener("DOMContentLoaded",(function(){chrome.storage.onChanged.addListener(((e,t)=>{"local"===t&&e.conversation_data&&location.reload()})),loadConversations()}));