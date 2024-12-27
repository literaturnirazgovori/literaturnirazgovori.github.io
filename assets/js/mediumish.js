function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function shortLinkClickHandle() {
  $(".shortlink").click(function (e){
    var url_spans = e.currentTarget.getElementsByTagName("span");
    var modal = $('#shortLinkModal');
    if(modal.length > 0) {
      var shortLink = "";
      var regLink = "";
      var linkToShare = "";
      var modal_body = modal.get(0).getElementsByClassName("modal-body");
      var modal_url = modal.get(0).getElementsByClassName("shortlinkModal_URL");
      if(modal_url.length > 0 && url_spans.length > 0) {
        shortLink = decodeURIComponent(url_spans[0].textContent);
        regLink = decodeURIComponent(url_spans[1].textContent);
        linkToShare = (shortLink)? shortLink : regLink;
        modal_url[0].textContent = linkToShare;
      }
      if(modal_body.length > 0) {
        $(modal_body[0]).popover();
        $(modal_body[0]).click(function (){
          modal.modal('hide');
          navigator.clipboard.writeText(linkToShare);
        });
      }

      for(var i=0; i < url_spans.length; i++) {
        console.log(url_spans[i].textContent);
      }
      
      if(shortLink != ""){
        modal.modal({});
      }
    }
  });  
}

jQuery(document).ready(function($){

  //---- search bar ---------
  $("#menubarsearch").click(function (){
    if(window.location.pathname.indexOf("/search") < 0)
    {
      if($("#search-wrapper").is(":visible"))
      {
        hideSearch();
      }
      else
      {
        showSearch();
      }
    }
  });

  //---- search bar ---------
  //var facebookIframe = document.querySelector('#facebook_iframe');
  setupFBframe();
 
  //-------- Facebook banner -------
    window.addEventListener("resize", resizeThrottler, false);
    var resizeTimeout;

    function resizeThrottler() {
      if (!resizeTimeout) {
        resizeTimeout = setTimeout(function() {
          resizeTimeout = null;
          actualResizeHandler();
        }, 66);
      }
    }
    function actualResizeHandler() {
      setupFBframe();
    }
    //--------/Facebook banner -------

    //------- check cookie for donation badge ----
    // if donation doesn't have a close class, or not closed (cookie), show it
    var donate_badges = $("#btn_donate");
    var cookie_close_donation_badge = "cookie_close_donation_badge";
    var badgeClosed = false;
    if(donate_badges.length > 0){
      var badge = donate_badges.get(0);
      var close_btn = $(badge.getElementsByClassName("btn_close_donation"));
      var classes = badge.className.split(/\s+/);
      //donate badge is closable
      if(classes.indexOf("close_btn") >= 0){
        var donation_closed = getCookie(cookie_close_donation_badge);
        if(donation_closed == "1"){
          badgeClosed = true;
        }
      }
      if(!badgeClosed){
        badge.classList.remove("hidden_badge");
      }
      // close button click sets the cookie
      close_btn.click(function (){ 
        setCookie(cookie_close_donation_badge, "1", 365);
        badge.classList.add("hidden_badge");
       });
      
    }
    //------- check cookie for donation badge ----

    shortLinkClickHandle();

  $("#search-close").click(function (){
    hideSearch();
  });

  $("#search-text").on('keydown', function(event) {
    if (event.key == "Escape") {
      hideSearch();
    }
  });

  $("#search-text").on('keyup', function(event) {
      if(window.location.pathname.indexOf("/search") >= 0)
      {
        window.history.replaceState({}, "ttt", window.location.pathname + "?search=" + $("#search-text").get(0).value);
      }
  });

  //---- search bar ---------
  var offset = 1250; 
  var duration = 800; 
  jQuery(window).scroll(function() { 
      if (jQuery(this).scrollTop() > offset) { 
      jQuery('.back-to-top').fadeIn(duration); 
      } else { 
      jQuery('.back-to-top').fadeOut(duration); 
      }
  });
  jQuery('.back-to-top').click(function(event) { 
  event.preventDefault(); 
  jQuery('html, body').animate({scrollTop: 0}, duration); 
  return false; 
  })


  // alertbar later
  $(document).scroll(function () {
      var y = $(this).scrollTop();
      if (y > 280) {
          $('.alertbar').fadeIn();
      } else {
          $('.alertbar').fadeOut();
      }
  });


  // Smooth scroll to an anchor
  $('a.smoothscroll[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .click(function(event) {
      // On-page links
      if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
        &&
        location.hostname == this.hostname
      ) {
        // Figure out element to scroll to
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        // Does a scroll target exist?
        if (target.length) {
          // Only prevent default if animation is actually gonna happen
          event.preventDefault();
          $('html, body').animate({
            scrollTop: target.offset().top
          }, 1000, function() {
            // Callback after animation
            // Must change focus!
            var $target = $(target);
            $target.focus();
            if ($target.is(":focus")) { // Checking if the target was focused
              return false;
            } else {
              $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
              $target.focus(); // Set focus again
            };
          });
        }
      }
    });
    
    
    // Hide Header on on scroll down
    var didScroll;
    var lastScrollTop = 0;
    var delta = 5;
    var navbarHeight = $('nav').outerHeight();

    $(window).scroll(function(event){
        didScroll = true;
    });

    setInterval(function() {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);

    function hasScrolled() {
        var st = $(this).scrollTop();
        var brandrow = $('.brandrow').css("height");
        
        // Make sure they scroll more than delta
        if(Math.abs(lastScrollTop - st) <= delta)
            return;

        // If they scrolled down and are past the navbar, add class .nav-up.
        // This is necessary so you never see what is "behind" the navbar.
        if (st > lastScrollTop && st > navbarHeight){
            // Scroll Down            
            $('nav').removeClass('nav-down').addClass('nav-up'); 
            $('.nav-up').css('top', - $('nav').outerHeight() + 'px');
           
        } else {
            // Scroll Up
            if(st + $(window).height() < $(document).height()) {               
                $('nav').removeClass('nav-up').addClass('nav-down');
                $('.nav-up, .nav-down').css('top', '0px');             
            }
        }

        lastScrollTop = st;
    }

    $('.site-content').css('margin-top', $('header').outerHeight() + 'px');

    //Christmas decorations 23/12 - 04/01
    var currentYear = (new Date()).getFullYear();
    var beforeChristmas = new Date(currentYear + "/12/23");
    var afterNewYear = new Date(currentYear + "/01/05");
    var now = new Date();
    if((now > beforeChristmas) || (now < afterNewYear))
    {
      $(".christmas").show();
    }
});

function hideSearch()
{
  if(window.location.pathname.indexOf("/search") < 0)
  {
    $('#search-wrapper').animate({ height: 0}, 400, function() { $('#search-wrapper').css("display", "none" ); });
    $("#search-text").val("");
  }
}

function showSearch()
{
  $("#search-wrapper").css('display', 'flex');
  $('#search-wrapper').animate({ height: 60}, 400, function() { $("#search-text").focus(); });
}

//-------- Facebook banner -------
function setupFBframe() {
  var frame  = document.querySelector('#facebook_iframe');
  var container = frame.parentNode;

  var containerWidth = container.offsetWidth;
  var containerHeight = document.querySelector (".sitetitlecontainer").scrollHeight - 10;

  if((!frame.src) || (frame.height != containerHeight)|| (frame.width != containerWidth))
  {
    frame.removeAttribute('src');
    var src =
      "https://www.facebook.com/plugins/page.php" +
      "?href=https%3A%2F%2Fwww.facebook.com%2Fliteraturnirazgovori" +
      "&width=" +
      containerWidth +
      "&height=" +
      containerHeight +
      "&small_header=false" +
      "&adapt_container_width=false" +
      "&hide_cover=false" +
      "&hide_cta=true" +
      "&show_facepile=false" +
      "&appId";

    frame.width = containerWidth;
    frame.height = containerHeight;
    frame.src = src;
  }
}
//--------/Facebook banner -------