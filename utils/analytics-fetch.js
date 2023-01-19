var fs = require('fs');
var path = require('path');
const frontmatter = require("front-matter");
const jsyaml = require("js-yaml");
require("dotenv").config({ silent: true });

const { google } = require("googleapis");
const url = require("url");
const { min } = require('moment-timezone');
const scopes = "https://www.googleapis.com/auth/analytics.readonly";

var pk = "";

if (typeof (process.env.Analytics_PrivateKey) == typeof (undefined)) {
  if (fs.existsSync("/src/utils/analytics-privatekey.txt")) {
    pk = fs.readFileSync('/src/utils/analytics-privatekey.txt', 'utf8');
  }
}
else {
  pk = process.env.Analytics_PrivateKey.replace(/\\n/g, '\n');
}

const postsPath = path.resolve(__dirname, "../_posts");

let tomorrow = new Date();
tomorrow.setDate(new Date().getDate() + 1);
let tomorrowDateString =
  tomorrow.getFullYear() +
  "-" +
  ("0" + (tomorrow.getMonth() + 1)).slice(-2) +
  "-" +
  ("0" + tomorrow.getDate()).slice(-2);

const jwtoken = new google.auth.JWT(
  "literaturnirazgovori@appspot.gserviceaccount.com", //process.env.GOOGLE_API_SERVICE_ACCOUNT_EMAIL,
  null,
  pk,//process.env.GOOGLE_API_PRIVATE_KEY,
  scopes
);
const analyticsreporting = google.analyticsreporting({
  version: "v4",
  auth: jwtoken
});


let reqObj = {
  requestBody: {
    reportRequests: [
      {
        viewId: "188425543", //var
        dateRanges: [
          {
            startDate: "2019-01-01", //VAR
            endDate: tomorrowDateString
          }
        ],
        metrics: [
          {
            expression: "ga:pageViews"
          }
        ],
        dimensions: [{ name: "ga:pagePath" }],
        dimensionFilterClauses: [
          {
            operator: "OPERATOR_UNSPECIFIED",
            filters: [
              {
                dimensionName: "ga:pagePath",
                operator: "REGEXP",
                expressions: ["/.*"]
              }
            ]
          }
        ],
        samplingLevel: "LARGE"
      }
    ]
  }
};

function urlToFilename(pageurl) {
  if (pageurl.indexOf("?") > 0) {
    pageurl = pageurl.substring(0, pageurl.indexOf("?"));
  }
  let regexFileInfo = /(\d{4})\/(\d{2})\/(\d{2})\/(\d{2})\-(\d{2})(.*)/
  let matched = regexFileInfo.exec(pageurl);
  if (matched && matched.length > 6) {
    let year = matched[1];
    let month = matched[2];
    let day = matched[3];
    let hour = matched[4];
    let minutes = matched[5];
    let pagename = matched[6];
    pageurl = year + "-" + month + "-" + day + "-" + hour + "-" + minutes + pagename;

    let regGetExtension = /^([^\.]*)\.(.+)$/
    let matchExtension = regGetExtension.exec(pageurl);
    if (matchExtension && matchExtension.length > 2) {
      let filenamewithoutextension = matchExtension[1];
      pageurl = filenamewithoutextension;
    }
    pageurl += ".md"
  }
  else {
    pageurl = "";
  }
  return pageurl;
}

async function getNextPage(pagetoken) {
  if (pagetoken === "0" || pagetoken) {
    try {
      if (pagetoken && pagetoken != "0") {
        reqObj.requestBody.reportRequests[0].pageToken = pagetoken;
      }
      console.log("Fetching " + pagetoken + "...");
      await analyticsreporting.reports.batchGet(reqObj).then(async (result) => {
        let page = "";
        let views = 0;
        for (let i = 0; i < result.data.reports[0].data.rows.length; i++) {
          page = result.data.reports[0].data.rows[i].dimensions[0];
          views = parseInt(result.data.reports[0].data.rows[i].metrics[0].values[0]);
          page = urlToFilename(page);

          if (page) {
            if (tempPageViews[page]) {
              tempPageViews[page] += views;
            }
            else {
              tempPageViews[page] = views;
            }
          }
        }
        if (result.data.reports[0].nextPageToken) {
          await getNextPage(result.data.reports[0].nextPageToken);
        }
      });
    }
    catch (err) {
      console.log("Caught error: " + err);
    }
  }
}

var tempPageViews = {}; //this collects info for ALL URLs, even if they are not in the _posts folder (e.g. ones in redirect_from)
var pageViews = {};     //this is the up-to-date list of views for actual pages
getNextPage("0").then(() => {

  fs.readdir(postsPath, function (err, posts) {
    if (err) {
      console.error("Could not list the directory.", err);
    }
    else {
      posts.forEach(function (post, index) {
        let view = 0;

        //resolve the file, and get its frontmatter content
        let postfilename = path.resolve(postsPath, post);
        let oldfilecontent = fs.readFileSync(postfilename).toString();
        let oldfileFrontmatter = frontmatter(oldfilecontent).attributes;

        //collect all the redirects from this page
        let redirect_urls = oldfileFrontmatter["redirect_from"];
        if (redirect_urls) {
          if (!Array.isArray(redirect_urls)) {
            redirect_urls = [redirect_urls];
          }
        }
        else {
          redirect_urls = [];
        }

        //1. check views for the current post
        if (tempPageViews[post]) {
          view += tempPageViews[post];
        }
        //2. check views for redirected urls to this post
        redirect_urls.forEach(function (r) {
          let p = urlToFilename(r);
          if (tempPageViews[p]) {
            view += tempPageViews[p];
          }
        });
        pageViews[post] = view;

        if (view > 0) {
          if (!oldfileFrontmatter["pageviews"] || oldfileFrontmatter["pageviews"] != view) {
            console.log(index + " :: " + post + " [Updating views: " + oldfileFrontmatter["pageviews"] + " -> " + view + "]");
            oldfileFrontmatter["pageviews"] = view;
            let updatedFrontmatter = jsyaml.safeDump(
              oldfileFrontmatter
            );
            let updatedContent = oldfilecontent.replace(
              /(^\-{3,}[\r\n]*)[\S\s]*([\n\r]*\-{3,})/,
              "$1" + updatedFrontmatter + "$2"
            );
            //change the url to /yyyy/mm/dd/hh/mm....
            fs.writeFileSync(postfilename, updatedContent);
          }
        }
      });
    }

    //order the collected pageviews by names
    pageViews = Object.keys(pageViews).sort().reduce(
      (obj, key) => {
        obj[key] = pageViews[key];
        return obj;
      },
      {}
    );
    //console.log(pageViews);
    fs.writeFile(path.resolve(__dirname, 'pageviews.json'), JSON.stringify(pageViews, null, 4), 'utf8', () => { });
  });
});