(function(){
"use strict";

/* ============================================================
   THE ONLY THING YOU EDIT
   ------------------------------------------------------------
   Wedding, corporate and private party all point at the
   'standard' table today. To price weddings differently later,
   copy the table, rename it, change the numbers, and point
   eventTypes.wedding.table at the new name. Nothing else changes.
   ============================================================ */
var PRICING = {

  tables: {
    standard: {
      solo: {1:600,  2:800,  3:1000, 4:1300},
      duo:  {1:800,  2:1000, 3:1200, 4:1400},
      trio: {1:1100, 2:1500, 3:1900, 4:2500},
      band: {1:1500, 2:2000, 3:2500, 4:3000}
    }
  },

  eventTypes: [
    {id:"wedding",   label:"Wedding",       table:"standard"},
    {id:"corporate", label:"Corporate",     table:"standard"},
    {id:"private",   label:"Private party", table:"standard"}
  ],

  configs: [
    {id:"solo", label:"Solo",      note:"Just me and a guitar"},
    {id:"duo",  label:"Duo",       note:"Plus upright bass, fiddle or steel"},
    {id:"trio", label:"Trio",      note:"Dancing, still intimate"},
    {id:"band", label:"Full band", note:"Four piece"}
  ],

  hours: [
    {id:"1",      label:"1 hour",   note:"Ceremony or cocktails"},
    {id:"2",      label:"2 hours",  note:""},
    {id:"3",      label:"3 hours",  note:"Most common"},
    {id:"4",      label:"4 hours",  note:""},
    {id:"unsure", label:"Not sure", note:"Shows 2 to 3 hours"}
  ],

  /* travel.add accepts either a flat number, or an object keyed by
     configuration when the cost scales with how many people travel.
     null means "don't show a number, route to the form". */
  travel: [
    {id:"metro",   label:"Houston",         note:"The loop and inner metro",   add:0},
    {id:"near",    label:"Greater Houston", note:"Katy, Woodlands, Galveston", add:50},
    {id:"central", label:"Central Texas",   note:"Austin, San Antonio",        add:200},
    {id:"westtx",  label:"West Texas",      note:"Marfa, Alpine, Fort Davis",
                   add:{solo:0, duo:0, trio:150, band:350}, homeBase:true},
    {id:"far",     label:"Somewhere else",  note:"Out of state or far",        add:null}
  ],

  spread: 0.18,   // top of the published range, above the base rate
  roundTo: 50,    // round the top of the range to this
  currency: "$"
};

/* ============================================================
   Below here is machinery. You shouldn't need to touch it.
   ============================================================ */

var state = {event:null, config:null, hours:null, travel:null};

var els = {
  result:  document.getElementById("pbrResult"),
  figure:  document.getElementById("pbrFigure"),
  figLabel:document.getElementById("pbrFigLabel"),
  summary: document.getElementById("pbrSummary"),
  fine:    document.getElementById("pbrFine"),
  cta:     document.getElementById("pbrCta"),
  hint:    document.getElementById("pbrHint")
};

if(!els.result) return;

var GROUPS = {
  event:  {items:PRICING.eventTypes, key:"event"},
  config: {items:PRICING.configs,    key:"config"},
  hours:  {items:PRICING.hours,      key:"hours"},
  travel: {items:PRICING.travel,     key:"travel"}
};

function money(n){
  return PRICING.currency + n.toLocaleString("en-US");
}
function roundUp(n, step){
  return Math.ceil(n / step) * step;
}
function find(list, id){
  for(var i=0;i<list.length;i++){ if(list[i].id === id) return list[i]; }
  return null;
}

function buildGroup(name){
  var host = document.querySelector('[data-group="'+name+'"]');
  var spec = GROUPS[name];
  if(!host) return;
  spec.items.forEach(function(item){
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pbr-est__opt";
    b.setAttribute("aria-pressed","false");
    b.dataset.id = item.id;
    b.innerHTML = "<b>"+item.label+"</b>" + (item.note ? "<span>"+item.note+"</span>" : "");
    b.addEventListener("click", function(){
      state[spec.key] = item.id;
      Array.prototype.forEach.call(host.children, function(sib){
        sib.setAttribute("aria-pressed", sib === b ? "true" : "false");
      });
      render();
    });
    host.appendChild(b);
  });
}

/* Travel can be flat or vary by configuration. Returns null for "quote it". */
function travelAdd(trav, configId){
  if(trav.add === null || trav.add === undefined) return null;
  if(typeof trav.add === "number") return trav.add;
  var v = trav.add[configId];
  return (typeof v === "number") ? v : null;
}

function baseFor(eventId, configId, hourId){
  var ev = find(PRICING.eventTypes, eventId);
  var table = PRICING.tables[ev.table][configId];
  if(hourId === "unsure"){
    return {low: table[2], high: table[3]};
  }
  var v = table[parseInt(hourId,10)];
  return {low: v, high: v};
}

/* Hand the current picks to the booking form further down the page,
   so nobody has to answer the same four questions twice. */
function syncToForm(summaryText, figureText){
  var f = document.getElementById("bookForm");
  if(!f) return;
  var map = {event:"event_type", config:"lineup", hours:"hours", travel:"area"};
  Object.keys(map).forEach(function(k){
    var field = f.elements[map[k]];
    if(field && state[k]) field.value = state[k];
  });
  var est = f.elements["estimate"];
  if(est) est.value = summaryText + (figureText ? " | " + figureText : "");
}

function render(){
  if(!state.event || !state.config || !state.hours || !state.travel){
    els.result.classList.remove("is-visible");
    return;
  }
  els.hint.style.display = "none";

  var ev    = find(PRICING.eventTypes, state.event);
  var cfg   = find(PRICING.configs,    state.config);
  var hr    = find(PRICING.hours,      state.hours);
  var trav  = find(PRICING.travel,     state.travel);

  var base  = baseFor(state.event, state.config, state.hours);
  var hrText = (state.hours === "unsure") ? "2 to 3 hours" : hr.label;
  var summaryBits = [cfg.label, hrText, trav.label];
  var summaryText = ev.label + " · " + summaryBits.join(" · ");
  els.summary.textContent = summaryText;

  var add = travelAdd(trav, state.config);
  var figureText = "";

  if(add === null){
    els.figLabel.textContent = "Let’s work it out";
    els.figure.textContent = "Tell me where";
    figureText = "Needs a custom quote";
    els.fine.innerHTML = "Long hauls get quoted one at a time, and <strong>the number I send you already includes travel</strong>. Mileage, and a night’s lodging if it needs one. Nothing gets added on afterwards. If I’m already going to be out your way it often costs less than you’d think.";
  } else {
    var low  = base.low + add;
    var high = roundUp(base.high * (1 + PRICING.spread), PRICING.roundTo) + add;
    els.figLabel.textContent = "Estimated range";
    figureText = money(low) + " to " + money(high);
    els.figure.textContent = figureText;

    var fine = "<strong>All sound equipment is included</strong>, along with one special request learned free. ";

    if(trav.homeBase){
      fine += add === 0
        ? "I’m out in West Texas regularly, so these dates price the same as a Houston one. <strong>No travel charge.</strong> "
        : "I’m out in West Texas regularly, so these price close to a Houston date. The difference covers getting the rest of the players out there. ";
    } else if(add > 0){
      fine += "Travel to " + trav.label.toLowerCase() + " is already in this number. ";
    } else {
      fine += "No travel charge inside the Houston metro. ";
    }

    fine += "The final number depends on the date and the venue. Spring and fall Saturdays tend to go early.";
    els.fine.innerHTML = fine;
  }

  syncToForm(summaryText, figureText);

  var wasComplete = els.result.classList.contains("is-visible");
  els.result.classList.add("is-visible");

  // First time it completes, bring the number into view. Phones bury it otherwise.
  if(!wasComplete){
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try{ els.result.scrollIntoView({behavior: reduce ? "auto" : "smooth", block:"center"}); }catch(e){ els.result.scrollIntoView(); }
  }
}

Object.keys(GROUPS).forEach(buildGroup);
})();
