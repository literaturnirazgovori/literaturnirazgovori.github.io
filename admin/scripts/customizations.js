var workflowBuildStatusImageId = "workflowBuildStatus";
var triggerBuildLiID = "triggerBuildLi";
var triggerBuildButtonID = "triggerBuildButton";

var triggerAnalyticsLiID = "triggerAnalyticsLi";
var triggerAnalyticsButtonID = "triggerAnalyticsButton";

var inProgressMessageLiID = "inProgressMessageLi";

var buildStatusNotificationElementId = "buildStatusNotificationElement";
var navToolbar = null;

var workflowCheckIntervalMSec = 7000;
var offlineImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAAAUCAYAAAAN+ioeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuNWRHWFIAAAQxSURBVFhH3Zi5ThxBEIYHeAAgIYCIgASBTMqRIAQCxH3fJOQ8AeISMTeBJTIEC2gjLgkh4xfgjrE5BAGIY80RcJXnL22PemdrJGZHmMUt/arurt7q6m+KnrGNpqam5M7OTl9HR8eFacm0BKv0GWMyjP9K9d9zsgzzYH4cLpokJetWb6YuUlJoenqaTk9P6ezsjGZmZug8NZVeY2LYr1v7nBTTi4z29vaAKYomSYm6FSAfHh7SysoKvb6+0tvbG62trdHx8TGdpqXRS2ysBVhJn5NiepHR1tZG0SYpUbdCJS8vLzM81QBwdnaW/H6/BVRJQT7IzaXVri4xphcZra2tpIRDRsNYStStcF2gkhVgCO3p6Ynu7u6sOSikks12fX0txvQio6WlhZyEZA8ODkSfk6ampujq6oqt3rev29zcZN/Q0FCYT0rUrXAn47pA0yEC/v39vTUHyIHERLqLj7fW3NzciDG9yGhububDSRb32e7urqNfso2NjVRaWsp2cnKSLi8v2drXbWxssG9wcDAsjpSoW+HFhztZwUNDf25ujq8UBdnuR/sQ0ObnHTlJgZZ879HExATDhLX7FOiBgYEwn5SoW+HrAvnjTsZ1gUr2+Xx0cnJCvzIywq4LNMyhfQhoVB4OJ1kkGggEeHM0/KkDDCoUfVisw8sF6zAGVPhgddBq3fPzczAahYDW95USdSsAxNcF9sSdjOsClawgA/rP+nqxorkJMb3IaGhoIAgHVH01BuijoyPKy8uj7u5uBrO/v09jY2Pch8XahYUFur295bHyjY+Ph6wD7MfHR/7cQrylpSX29ff3h+0vJepW+BbWq1bJ6bpA0/tSTC8y6s2nisNJFqB3dnZ4XFdXR9vb2zynA8Q6CbS9v7i4SOfn59TT08Px1tfX2dfX1xe2r5SoWymwSgD8w7z//yQkhABV1wWaPi/F9CIGDYiSRTXjjlZjQAfo0dFRhgSL+fn5eQaNsQ5XX4eHAdAAi3g6aPu+UqJupf+LD/qdnh4k6FzFel+K6UVGbW0tH1CyAA24GAPcw8MDv8kBDmABD+v29vbYh/mRkREGCKuDHh4etn6DeHiA8PX29obtKyUaiRTkl7g4OszMDBJ0hqtXtxTPixh0TU0NH1BJjQFab1tbW1ReXk5VVVXcVw2VCoiAq4PW+9XV1bS6uhr8BfHLU4G27y8lGokURBSBDtrputD7UjwvMgAAB5VsUVERZWdnU05ODtuSkhLLX1xcbM0XFhZSfn4+P4DKykoqKChgizH6sPhdWVmZFQ/rlc++r5RoJOL/HAq291T0h4NWUkA+eywlGol0cE6gper+kO9oVXnRZKVEI5Fe0ddJScFeKGh9jd6X4nkRQAcqKir4gE76134p0a8uwzykHwfFSy5arJToVxdAJ5uH85m6wCGjQVKiX1mlw9+y/gK7pr3LgKUYRAAAAABJRU5ErkJggg==";
var isPublishingInProgress = false;
var isQueued = false;
var queuingTimeout_s = 40;
var queueTime = 0;
var queuing_status = {
        status: "queued",
        latest_build_state: "Queueing",
        title: "",
        createdBy: "Manually/admin",
        action: "",
        inProgress: false
    };

    var tk=["Z2hwX0FuOT", "lldFJIODdH", "eTV5Y3RUS2", "ZqOUdzTEsx", "dlBIbjRaUUZGWQ"]; //"=="

(async function () {
    console.log("begin...");
    //Wait for the nav bar to appear
    var attempt = 0;
    var maxAttempts = 20;
    while (!document.querySelector("nav ul li") && attempt < maxAttempts) {
        await new Promise(r => { attempt++; setTimeout(r, 500); });
    }
    var nav = document.getElementsByTagName("nav");
    var header = document.getElementsByTagName("header");
    if (nav.length > 0) {
        var navUL = nav[0].getElementsByTagName("ul");
        if (navUL.length > 0) {
            navToolbar = navUL[0];
            if(!navToolbar.classList.contains("inprog"))
            {
                navToolbar.classList.add("inprog");
            }

            var gotoGithubLi = document.createElement("li");
            gotoGithubLi.setAttribute("style", "margin:auto");
            gotoGithubLi.innerHTML = "<a href=\"https://github.com/literaturnirazgovori/literaturnirazgovori.github.io\" target=\"_blank\" id=\"lnkGotoSite\" title=\"Go to Github\" style=\"padding: 16px 0px;color: blue;\"><span style=\"display: inline-block;line-height: 0;width: 24px;height: 24px; margin: 0px 10px;\"><img src=\"images/github.png\"></span></a>";
            navUL[0].prepend(gotoGithubLi);

            var gotoSiteLi = document.createElement("li");
            gotoSiteLi.setAttribute("style", "margin:auto");
            gotoSiteLi.innerHTML = "<a href=\"/\" target=\"_blank\" id=\"lnkGotoSite\" title=\"Open site\" style=\"padding: 16px 0px;color: blue;\"><span style=\"display: inline-block;line-height: 0;width: 24px;height: 24px; margin: 0px 10px;\"><img src=\"/assets/images/logo-book.png\"></span><!--Go to site &#8640;--></a>";
            navUL[0].prepend(gotoSiteLi);

            var workflowStatusLi = document.createElement("li");
            workflowStatusLi.setAttribute("style", "margin:auto");
            var a = document.createElement("a");
            a.setAttribute("href", "https://github.com/literaturnirazgovori/literaturnirazgovori.github.io/actions/workflows/jekyll.yml");
            a.setAttribute("target", "_blank");
            var img = document.createElement("img");
            img.setAttribute("id", workflowBuildStatusImageId);
            workflowStatusLi.appendChild(a);
            a.appendChild(img);
            navUL[0].appendChild(workflowStatusLi);

            var triggerBuildLi = document.createElement("li");
            triggerBuildLi.setAttribute("id", triggerBuildLiID);
            triggerBuildLi.className = "toolbar_li";
            triggerBuildLi.innerHTML = "<a href=\"#\" id=\"" + triggerBuildButtonID + "\" title=\"Click to manually trigger a re-publishing/deployment of the site\"><img src='images/republish.png'/><span class=\"customActionText\" id=\"republishMsg\">Republish!</span></a>";
            navUL[0].appendChild(triggerBuildLi);

            var triggerAnalyticsLi = document.createElement("li");
            triggerAnalyticsLi.setAttribute("id", triggerAnalyticsLiID);
            triggerAnalyticsLi.className = "toolbar_li";
            triggerAnalyticsLi.innerHTML = "<a href=\"#\" id=\"" + triggerAnalyticsButtonID + "\" title=\"This will refresh all views of all posts\"><img src='images/analytics.png'/><span class=\"customActionText\" id=\"analyticshMsg\">Refresh views!</span></a>";
            navUL[0].appendChild(triggerAnalyticsLi);

            var inProgressMessageLi = document.createElement("li");
            inProgressMessageLi.setAttribute("id", inProgressMessageLiID);
            inProgressMessageLi.className = "toolbar_li";
            inProgressMessageLi.innerHTML = "<span id='inProgressMessage'>Checking status...</span>";
            navUL[0].appendChild(inProgressMessageLi);

            var triggerBuildButton = document.getElementById(triggerBuildButtonID);
            triggerBuildButton.addEventListener("click", triggerRepublish);

            var triggerAnalyticsButton = document.getElementById(triggerAnalyticsButtonID);
            triggerAnalyticsButton.addEventListener("click", triggerAnalytics);            
        }
    }
    if (header.length > 0) {
        header[0].style.marginBottom = "40px";
        var notificationHeader = document.createElement("div");
        notificationHeader.setAttribute("id", buildStatusNotificationElementId);
        header[0].appendChild(notificationHeader);
    }
    if ((nav.length > 0) && (header.length > 0)) { getPublishingStatus(); }

    setInterval(getPublishingStatus, workflowCheckIntervalMSec);
})();

function enc(str)
{
    return window.btoa(encodeURIComponent(str));
}

function dec(arr)
{
    var t = (arr.join("")) + "==";
    return decodeURIComponent(window.atob(t));
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function datestrToLocalTzStr(date_str)
{
    try
    {
        var date = new Date(date_str);
        //var local_tz_date = date; //new Date(date.setHours(date.getHours() + (date.getTimezoneOffset()/60)));
        var str =
            date.getFullYear()
            + "/" + pad(date.getMonth(),2)
            + "/" + pad(date.getDate(),2)
            + " " + pad(date.getHours(),2)
            + ":" + pad(date.getMinutes(),2);
        return str;
    }
    catch(ex)
    {
        return "";
    }
}

function triggerRepublish() {
    triggerGitHubWorkflow("jekyll.yml", "This will trigger a re-publishing.\nContinue?", "Republishing...");
}

function triggerAnalytics()
{
    triggerGitHubWorkflow("get-analytics-ga4.yml", "This will trigger collection of views for posts.\nContinue?", "Collecting views...");
}

function triggerGitHubWorkflow(yamlFile, msg, queuingTitle)
{
    if (!isPublishingInProgress) {
        var doTrigger = confirm(msg);
        if (doTrigger) {
            //publishingInProgress(true);
            var workflowApiRequest = new XMLHttpRequest();
            var url = "https://api.github.com/repos/literaturnirazgovori/literaturnirazgovori.github.io/actions/workflows/" + yamlFile +"/dispatches";
            workflowApiRequest.open("POST", url);

            workflowApiRequest.setRequestHeader("Accept", "application/vnd.github+json");
            workflowApiRequest.setRequestHeader("Authorization", "Bearer " + dec(tk));
            workflowApiRequest.send(JSON.stringify({ "ref":"work" }));
            isQueued = true;
            queueTime = new Date();
            queuing_status.title = queuingTitle;
            queuing_status.action = yamlFile;
            updateUI(queuing_status);
        }
    }    
}

function getLatestGithubActionState(){
    var state = {  };
    //var url = "https://api.github.com/repos/literaturnirazgovori/literaturnirazgovori.github.io/actions/workflows/"+yamlFile+"/runs?per_page=1";
    var url = "https://api.github.com/repos/literaturnirazgovori/literaturnirazgovori.github.io/actions/runs?per_page=1"
    var workflowApiRequest = new XMLHttpRequest();
    try{
    workflowApiRequest.open("GET", url, false); // `false` makes the request synchronous
    workflowApiRequest.setRequestHeader("Accept", "application/vnd.github+json");
    workflowApiRequest.setRequestHeader("Authorization", "Bearer " + dec(tk));

    workflowApiRequest.send(null);
    
    if (workflowApiRequest.status === 200) {

        var response = JSON.parse(workflowApiRequest.responseText);

        //Value of the status property can be one of: “queued”, “in_progress”, or “completed”. 
        //When it’s “completed,” it makes sense to check if it finished successfully. 
        //We need a value of the conclusion property. 
        //Can be one of the “success”, “failure”, “neutral”, “cancelled”, “skipped”, “timed_out”, or “action_required”.
        if(response.workflow_runs && response.workflow_runs.length > 0)
        {
            var buildInfo = response.workflow_runs[0];

            state.created_at = datestrToLocalTzStr(buildInfo.created_at);
            state.updated_at = datestrToLocalTzStr(buildInfo.updated_at);

            state.title = buildInfo.display_title;
            state.inProgress = ((buildInfo.status == "queued") || (buildInfo.status == "in_progress"));
            state.event = buildInfo.event;
            state.latest_build_state = (state.inProgress) ? "Running" : "Last";
            if(state.event == "workflow_dispatch")
            {
                state.latest_build_state += " manual";
            }
            else
            {
                state.latest_build_state += " autmated";
            }
            state.createdBy = buildInfo.actor.login;
            state.finishedAt = (buildInfo.status == "completed")? buildInfo.updated_at : null;
            state.status = buildInfo.status;
            state.action = buildInfo.path.substring(buildInfo.path.lastIndexOf("/")+1);
            if(buildInfo.status=="completed")
            {
                if(buildInfo.conclusion=="failure" || buildInfo.conclusion=="action_required")
                {
                    state.status="errored";
                }
            }
        }
        else {
            state.status = "unknown";
            state.latest_build_state = "Caught error";
            state.title = "Received an error from the server " + workflowApiRequest.status;
            state.createdBy = "Unknown";
            return state;
        }
    }
        return state;
    }
    catch(ex)
    {
        state.status = "unknown";
        state.latest_build_state = "Caught error";
        state.title = "Are you offline?";
        state.createdBy = "Unknown";
        console.log(ex);
        return state;
    }
}

function updateUI(state)
{
    var workflowBuildStatusImg = document.getElementById(workflowBuildStatusImageId);
    var notificationHeader = document.getElementById(buildStatusNotificationElementId);
    var inprogMessage = document.getElementById("inProgressMessage");
    var imageSrc = workflowBuildStatusImg.getAttribute("src");

    var statusImage = "images/build-" + state.status + ".png";
    if(imageSrc != statusImage)
    {
        workflowBuildStatusImg.setAttribute("src", statusImage);
    }
    var time_desc = "";
    if(state.inProgress && state.created_at)
    {
        time_desc = " (started at " + state.created_at + ")"
    }
    else if(!state.inProgress && state.updated_at)
    {
        time_desc = " (finished at " + state.updated_at + ")"
    }

    var strip_content = 
        "<div class=\"infoleft\"><span style='color:black; font-weight: bold;'>" + state.latest_build_state + " execution:</span> \"<em>" + state.title  + "</em>\"" +
        "<span style='color: black'>" + time_desc + "</span>" +
        "</div><div class=\"inforight\"><b>[Run by</b> " + state.createdBy + "<b>]</b></div>";
    if (notificationHeader.innerHTML != strip_content)
    {
        notificationHeader.innerHTML = strip_content;
    }

    if(notificationHeader.className != "build-" + state.status)
    {
        notificationHeader.className = "build-" + state.status;
    }
    if(navToolbar)
    {
        if(state.inProgress)
        {
            if(state.action.indexOf("get-analytics-ga4.yml") >= 0)
            {
                inprogMessage.innerHTML = "Analytics collection in progress...";
            }
            else
            {
                inprogMessage.innerHTML = "Deployment in progress...";
            }
            if(!navToolbar.classList.contains("inprog"))
            {
                navToolbar.classList.add("inprog");
            }
        }
        else if (state.status == "queued")
        {
            if(!navToolbar.classList.contains("inprog"))
            {
                navToolbar.classList.add("inprog");
            }
            inprogMessage.innerHTML = "Queuing operation. Please wait..."
        }
        else
        {
            if(navToolbar.classList.contains("inprog"))
            {
                navToolbar.classList.remove("inprog");
            }
        }
    }
}

function getPublishingStatus() {
    var state = getLatestGithubActionState();
    console.log(state);
    var now = new Date();
    if((!isQueued) || (isQueued && ((now - queueTime)/1000 >= queuingTimeout_s)))
    {
        isQueued = false;
        isPublishingInProgress = state.inProgress;
        updateUI(state);
    }
}