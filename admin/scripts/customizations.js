var travisBuildStatusImageId = "travisBuildStatus";
var buildStatusNotificationElementId = "buildStatusNotificationElement";
var travisCheckIntervalMSec = 7000;
var travisRepoId = "7843148";

(async function () {
    //Wait for the nav bar to appear
    var attempt = 0;
    var maxAttempts = 20;
    while (!document.querySelector("nav ul li") && attempt < maxAttempts) {
        await new Promise(r => { attempt++; setTimeout(r, 500); });
    }
    var nav = document.getElementsByTagName("nav");
    if (nav.length > 0) {
        var ul = nav[0].getElementsByTagName("ul");
        if (ul.length > 0) {
            var li = document.createElement("li");
            li.setAttribute("style", "margin:auto");
            var img = document.createElement("img");
            img.setAttribute("src", "https://travis-ci.com/literaturnirazgovori/literaturnirazgovori.github.io.svg?branch=work");
            img.setAttribute("id", travisBuildStatusImageId);
            li.appendChild(img);
            ul[0].appendChild(li);
        }
    }
    var header = document.getElementsByTagName("header");
    if (header.length > 0) {
        header[0].style.marginBottom = "40px";
        var notificationHeader = document.createElement("div");
        notificationHeader.setAttribute("id", buildStatusNotificationElementId);
        header[0].appendChild(notificationHeader);
    }
    getTravisStatus();
})();

function getTravisStatus() {
    var travisBuildStatusImg = document.getElementById(travisBuildStatusImageId);
    var notificationHeader = document.getElementById(buildStatusNotificationElementId);
    var url = "https://api.travis-ci.com/repo/" + travisRepoId + "/builds?limit=1&sort_by=finished_at:desc";
    var travisApiRequest = new XMLHttpRequest();
    travisApiRequest.ontimeout = function () {
        console.error("The request for " + url + " timed out.");
    };
    travisApiRequest.onload = function () {
        if (travisApiRequest.readyState === 4) {
            if (travisApiRequest.status === 200) {
                var response = JSON.parse(travisApiRequest.responseText);
                if (response.builds && response.builds.length > 0) {
                    var buildInfo = response.builds[0];
                    var commitMessage = buildInfo.commit.message;
                    var finishedAt = buildInfo.finished_at;
                    var state = buildInfo.state;
                    var createdBy = buildInfo.created_by.login;
                    console.log("Build \"" + commitMessage + "\", State: " + state + ". Finished: " + finishedAt);
                    var imageSrc = travisBuildStatusImg.getAttribute("src");
                    var statusImage = "images/build-" + state + ".png";
                    if (imageSrc != statusImage) {
                        travisBuildStatusImg.setAttribute("src", statusImage);
                    }
                    var whichBuild = ((state == "created") || (state == "started")) ? "Running" : "Last";
                    var finished = (finishedAt) ? ("<b>[Finished at:</b> " + finishedAt + ", ") : "<b>[</b>";
                    var notificationHeaderClassName = "build-" + state;
                    var notificationHeaderContent =
                        "<div class=\"infoleft\"><b>" + whichBuild + " publishing:</b> \"<em>" + commitMessage + "</em>\"</div><div class=\"inforight\">" + finished + "<b>Run by</b> " + createdBy + "<b>]</b></div>";
                    if (notificationHeader.className != notificationHeaderClassName) {
                        notificationHeader.className = notificationHeaderClassName;
                    }
                    if (notificationHeader.innerHTML != notificationHeaderContent) {
                        notificationHeader.innerHTML = notificationHeaderContent;
                    }
                }
            } else {
                console.error(travisApiRequest.statusText);
            }
            setTimeout(function () { getTravisStatus() }, travisCheckIntervalMSec);
        }
    };
    travisApiRequest.open("GET", url, true);
    travisApiRequest.setRequestHeader("Travis-API-Version", "3");
    travisApiRequest.setRequestHeader("Authorization", "token y1piqC-JCM4woaM1h5imyQ");
    travisApiRequest.timeout = travisCheckIntervalMSec;
    travisApiRequest.send(null);
}