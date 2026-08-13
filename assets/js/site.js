(function(){
"use strict";

/* ============================================================
   CONFIG
   ------------------------------------------------------------
   FORM_ACCESS_KEY routes booking enquiries to Patrick's inbox.
   Get one free in about a minute at https://web3forms.com:
   enter the destination email address, and the key arrives by
   email. Paste it below and redeploy. Until it is set, the form
   falls back to opening the visitor's mail client instead.
   ============================================================ */
var FORM_ACCESS_KEY = "";
var FALLBACK_EMAIL  = "patrick@patrickbray.com";

/* ---------- footer year ---------- */
var yr = document.getElementById("year");
if(yr) yr.textContent = new Date().getFullYear();

/* ---------- video facade ----------
   The YouTube iframe is ~1MB of third party script on load, and most
   visitors never press play. Swap it in on click instead. */
var facade = document.querySelector(".video__facade");
if(facade){
  facade.addEventListener("click", function(){
    var id = facade.dataset.videoId;
    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
    frame.title = "Patrick B Ray, live performance";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    frame.allowFullscreen = true;
    facade.parentNode.appendChild(frame);
    facade.remove();
  });
}

/* ---------- booking form ---------- */
var form   = document.getElementById("bookForm");
var status = document.getElementById("formStatus");

function say(msg, state){
  if(!status) return;
  status.textContent = msg;
  status.setAttribute("data-state", state || "info");
}

if(form){
  // Nobody should be able to pick a date that has already passed.
  var dateField = form.elements["event_date"];
  if(dateField) dateField.min = new Date().toISOString().slice(0,10);

  form.addEventListener("submit", function(e){
    e.preventDefault();

    // Honeypot. Real people leave it empty, bots fill it in.
    if(form.elements["botcheck"] && form.elements["botcheck"].value) return;

    var data = Object.fromEntries(new FormData(form).entries());

    if(!FORM_ACCESS_KEY){
      var body = Object.keys(data)
        .filter(function(k){ return k !== "botcheck" && data[k]; })
        .map(function(k){ return k.replace(/_/g," ") + ": " + data[k]; })
        .join("\n");
      window.location.href = "mailto:" + FALLBACK_EMAIL
        + "?subject=" + encodeURIComponent("Event enquiry, " + (data.name || "website"))
        + "&body=" + encodeURIComponent(body);
      say("Opening your email so you can send this. If nothing happened, write to " + FALLBACK_EMAIL + " directly.");
      return;
    }

    var btn = form.querySelector("[type=submit]");
    var original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending";
    say("");

    data.access_key = FORM_ACCESS_KEY;
    data.subject = "Event enquiry from " + (data.name || "the website");
    data.from_name = "patrickbray.com events";

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {"Content-Type":"application/json", Accept:"application/json"},
      body: JSON.stringify(data)
    })
    .then(function(r){ return r.json(); })
    .then(function(r){
      if(r.success){
        form.reset();
        say("Got it. I read these myself and usually answer within a day.");
      } else {
        throw new Error(r.message || "submit failed");
      }
    })
    .catch(function(){
      say("That didn't go through. Email me at " + FALLBACK_EMAIL + " and I'll pick it up there.", "error");
    })
    .finally(function(){
      btn.disabled = false;
      btn.textContent = original;
    });
  });
}
})();
