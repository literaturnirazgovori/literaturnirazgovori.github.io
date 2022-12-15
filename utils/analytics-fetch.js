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

const pk="-----BEGIN PRIVATE KEY-----\n\
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDCPLnKK9J6qGHZ\n\
gxC8jRQOfV1m8Mrl9/7wYfrCCFilUcTZ8MZxi62LOVqHTiyh/xV0hIPE4WH0LAvx\n\
ptlQELdrvpeRFU1dZ6dAlTJx9qaBt1em88WMGlAjIFN5cWOT5H4aEmvRj4CEP/qN\n\
+h111NXBgWfmPU0XyKSNl8xy7wr4bHvmv5SXTfEbW4/kqtUU9aPlmPspEqv7NPt6\n\
gpx+ZpEI13F/gfDbFz2HjDhFzfIUyNYOMWSJCkk/hthSvmM0o7JiYM43Utd2mZRb\n\
pUsnzbkOC3+e4MCGRt6JBVmJxxoTb79K2dR/z31Z4W5mMXt9JToBPKa0WUoUE7Sh\n\
m7suMl+nAgMBAAECggEADRYI8QVRduYP7EGXnRG8KjBpXIgYg18uk9oQtNsvGGQ7\n\
6PBUePiPcUkklOfAELdI0MLPcIeRZovuehINo1vySkCwTBwCoapcFaPM9D9JKdrE\n\
/asqwgJRJ9dZCF41S+ohp3avljzJdx+AV+m5QQ5dIF5W4PzRoX/pEN5gmIBhCCou\n\
MBWtVykIA2dOBodKcZXMO2mMZCuWKjLc6/vToX16dM1nEd4bTG4eziYNIJPPLYrM\n\
o7UP2D4q96zY5Tcha4pmucu0aKj+P75cn30FWTv79AtLITnv52mASvEXUkpzmzy2\n\
AqPFznOSCORvrnZJGDXwoGO0xZKeWLtMC+doICUhIQKBgQDfrLO/3uVN1V2Z7jVC\n\
oTv1KRs59jCC/9FvTzhOEihAGc97MDT5pePioKLYFmLuHLs8bAvm5GvU/EfODou+\n\
EtcJRbULK7opeGhHAsIoCoXKc0ubYz1rcHYgAT7cN9/yU+cOGdPmZQb/Do4ZBjD/\n\
Uxac75rU5CKjoPKB4XsG6JDH2QKBgQDeTu1APlvuHpERubKMkIvthCXKm5ifT9M6\n\
mbe3mV1blfGW4PR1pl9FUWPe+EhvYpUlc4Jmfc95OCndHai7eSp+vJfELwmSUC3h\n\
IINOWjyxQqAW1qcX71nxBj7hAPANLD83qjalWKoVcKMeeVw8FlKYN9c/jYiPms75\n\
+gX0WKczfwKBgCn9UtUvM97TsjmmdUsn14ijid/srpi5C4kY1xoY4IOAFOosV5WS\n\
JeCyhT+JnFLVA/VI10cmFHQsVBKDuooZIVM1SdJqCA2m8/R4uRgpOYqS8FugWrRj\n\
rVk+wp02xAzK4XJNOPFkf9a71cMu3V3hLDqT5H4YwcPz//KP8LeQSzWpAoGAfy78\n\
gQKsKYEHUfLBebXAuDQgQtfd61cJ677B4qI1TQ5t1voAIcb7PncgAhJdrovh9Dkv\n\
Y1+a8Sj2mnA7dnYNn9BZq32VpkWE2gV12b+6dVc+q5JGqmTfOgtusd+NdpvX1wrk\n\
lJgzRmzYhbi80gubWUapOMzKUg4pV8541aBamBUCgYEA1VvFcNsUGs/GmWfRdwFC\n\
9RR7CWsbCEe/A4XlBXfagjUN1ePg+r9bq9jRj1nKBPpwPaG+LkMMPbRnmZyTUmcF\n\
H/LrV0Tvy0MXlUtutxZo1wlny9cCnI94FDWOydmmIo1U+hwAwZEtfk/IRkOtFxH3\n\
jazTee7GHiKRL+FbIwYJw4g=\n\
-----END PRIVATE KEY-----"

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


//try
//{
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

  //let nextPageToken = "";
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

    console.log(pageViews);
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


  
