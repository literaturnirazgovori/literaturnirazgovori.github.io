var fs = require('fs');
var path = require('path');
const frontmatter = require("front-matter");
const jsyaml = require("js-yaml");
require("dotenv").config({ silent: true });

const { google } = require("googleapis");
const url = require("url");
const { min } = require('moment-timezone');
const scopes = "https://www.googleapis.com/auth/analytics.readonly";

const postsPath = path.resolve(__dirname, "../_posts");

let tomorrow = new Date();
tomorrow.setDate(new Date().getDate() + 1);
let tomorrowDateString =
  tomorrow.getFullYear() +
  "-" +
  ("0" + (tomorrow.getMonth() + 1)).slice(-2) +
  "-" +
  ("0" + tomorrow.getDate()).slice(-2);

const pk=process.env.Analytics_PrivateKey.replace(/\\n/g, '\n');;


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

async function getNextPage(pagetoken)
{
  if(pagetoken==="0" || pagetoken)
  {
    try
    {
      if(pagetoken && pagetoken != "0")
      {
        reqObj.requestBody.reportRequests[0].pageToken = pagetoken;
      }
      console.log("Fetching " + pagetoken + "...");
      await analyticsreporting.reports.batchGet(reqObj).then(async (result)=>{
        let page="";
        let views=0;
        for(let i=0; i < result.data.reports[0].data.rows.length; i++){
          page = result.data.reports[0].data.rows[i].dimensions[0];
          views = parseInt(result.data.reports[0].data.rows[i].metrics[0].values[0]);
          if(page.indexOf("?") > 0)
          {
            page = page.substring(0, page.indexOf("?"));
          }
          let regexFileInfo=/(\d{4})\/(\d{2})\/(\d{2})\/(\d{2})\-(\d{2})(.*)/
          let matched = regexFileInfo.exec(page);
          if(matched && matched.length > 6)
          {
            let year = matched[1];
            let month = matched[2];
            let day = matched[3];
            let hour = matched[4];
            let minutes = matched [5];
            let pagename = matched[6];
            page = year + "-" + month + "-" + day + "-" + hour + "-" + minutes + pagename;
            
            let regGetExtension = /^([^\.]*)\.(.+)$/
            let matchExtension = regGetExtension.exec(page);
            if(matchExtension && matchExtension.length > 2)
            {
              let filenamewithoutextension = matchExtension[1];
              let filenameextension = matchExtension[2];
              page = filenamewithoutextension;
            }
            page += ".md"

            let postfilename = path.resolve(postsPath, page);
            //check if a page exists
            if (fs.existsSync(postfilename)) {
              if(pageViews[page])
              {
                pageViews[page] += views;
              }
              else
              {
                pageViews[page] = views;
              }
            }
          }
        }
        if(result.data.reports[0].nextPageToken){
          await getNextPage(result.data.reports[0].nextPageToken);
        }
    });
    }
    catch(err){
      console.log("Caught error: " + err);
    }
  }
}

let pageViews = {};
getNextPage("0").then(()=>{
  
  //order the collected pageviews by names
  pageViews = Object.keys(pageViews).sort().reduce(
    (obj, key) => { 
      obj[key] = pageViews[key]; 
      return obj;
    }, 
    {}
  );

  //console.log(pageViews);
  fs.writeFile(path.resolve(__dirname, 'pageviews.json'), JSON.stringify(pageViews, null, 4), 'utf8', ()=>{});    

  fs.readdir(postsPath, function (err, posts) 
  {
    if (err) {
      console.error("Could not list the directory.", err);
    }
    else
    {
      posts.forEach(function (post, index) {
        let view = 0;
        if(pageViews[post])
        {
          view = pageViews[post];
        }
        if (view > 0) {
          let postfilename = path.resolve(postsPath, post);
          let oldfilecontent = fs.readFileSync(postfilename).toString();
          let oldfileFrontmatter = frontmatter(oldfilecontent).attributes;
          if(! oldfileFrontmatter["pageviews"] || oldfileFrontmatter["pageviews"] != view)
          {
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
  });
});