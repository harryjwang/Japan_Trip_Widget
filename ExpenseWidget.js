// Expense Widget - Medium (4x2)
// Hosted on GitHub, loaded via eval()
// No async/await at top level - compatible with eval()

var FILE_NAME = "expenses.json";
var fm = FileManager.iCloud();
var filePath = fm.joinPath(fm.documentsDirectory(), FILE_NAME);

var BG      = new Color("#0f0f0f");
var SURFACE = new Color("#1c1c1e");
var TEXT    = new Color("#f0ede8");
var MUTED   = new Color("#777777");
var DIM     = new Color("#444444");
var GREEN   = new Color("#6abf8e");
var BLUE    = new Color("#6aaee8");
var PINK    = new Color("#e8856a");

var CAT_COLORS = {
  "Food":          new Color("#e8856a"),
  "Transport":     new Color("#6aaee8"),
  "Accommodation": new Color("#b06ad0"),
  "Activity":      new Color("#e8c96a"),
  "Shopping":      new Color("#6abf8e"),
  "Baseball":      new Color("#6abf8e"),
  "Other":         new Color("#888888")
};

function fmtCad(n) { return "$" + n.toFixed(0); }
function fmtJpy(n) { return "\u00A5" + Math.round(n).toLocaleString(); }

function buildBar(pct, len) {
  var out = "";
  var filled = Math.round(pct * (len || 22));
  var empty = (len || 22) - filled;
  for (var i = 0; i < filled; i++) out += "|";
  for (var j = 0; j < empty; j++) out += ".";
  return out;
}

function addPill(parent, label, value, color) {
  var pill = parent.addStack();
  pill.layoutVertically();
  pill.backgroundColor = SURFACE;
  pill.cornerRadius = 7;
  pill.setPadding(5, 8, 5, 8);
  var lbl = pill.addText(label);
  lbl.font = Font.systemFont(9);
  lbl.textColor = MUTED;
  var val = pill.addText(value);
  val.font = Font.boldSystemFont(13);
  val.textColor = color;
}

function buildWidget(data) {
  var w = new ListWidget();
  w.backgroundColor = BG;
  w.setPadding(12, 14, 10, 14);

  if (!data || !data.expenses || data.expenses.length === 0) {
    w.addSpacer();
    var t = w.addText("No expenses yet");
    t.font = Font.mediumSystemFont(13);
    t.textColor = MUTED;
    t.centerAlignText();
    var s = w.addText("Open Trip Tracker to sync");
    s.font = Font.systemFont(10);
    s.textColor = DIM;
    s.centerAlignText();
    w.addSpacer();
    return w;
  }

  var expenses = data.expenses;
  var totCad = 0; var totUsd = 0; var totJpy = 0;
  for (var i = 0; i < expenses.length; i++) {
    totCad += expenses[i].amtCad;
    totUsd += expenses[i].amtUsd;
    totJpy += expenses[i].amtJpy;
  }

  var cats = {};
  for (var i = 0; i < expenses.length; i++) {
    var cat = expenses[i].cat;
    if (!cats[cat]) cats[cat] = 0;
    cats[cat] += expenses[i].amtCad;
  }
  var sorted = Object.keys(cats).map(function(k) { return [k, cats[k]]; });
  sorted.sort(function(a, b) { return b[1] - a[1]; });

  // Header
  var row1 = w.addStack();
  row1.layoutHorizontally();
  row1.centerAlignContent();
  var titleTxt = row1.addText("Trip Expenses");
  titleTxt.font = Font.boldSystemFont(13);
  titleTxt.textColor = TEXT;
  row1.addSpacer();
  var synced = data.lastUpdated
    ? new Date(data.lastUpdated).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
    : "";
  var syncTxt = row1.addText(synced);
  syncTxt.font = Font.systemFont(10);
  syncTxt.textColor = DIM;

  w.addSpacer(6);

  // Totals
  var totRow = w.addStack();
  totRow.layoutHorizontally();
  totRow.spacing = 6;
  addPill(totRow, "CAD", fmtCad(totCad), PINK);
  addPill(totRow, "USD", fmtCad(totUsd), BLUE);
  addPill(totRow, "JPY", fmtJpy(totJpy), GREEN);
  totRow.addSpacer();
  var countTxt = totRow.addText(expenses.length + " exp");
  countTxt.font = Font.systemFont(10);
  countTxt.textColor = DIM;

  w.addSpacer(7);

  // Top 3 categories
  var topCats = sorted.slice(0, 3);
  for (var k = 0; k < topCats.length; k++) {
    var catName = topCats[k][0];
    var catCad  = topCats[k][1];
    var pct     = totCad > 0 ? catCad / totCad : 0;
    var color   = CAT_COLORS[catName] || new Color("#888888");

    var row = w.addStack();
    row.layoutHorizontally();
    row.centerAlignContent();
    row.spacing = 5;
    var nameTxt = row.addText(catName);
    nameTxt.font = Font.mediumSystemFont(11);
    nameTxt.textColor = TEXT;
    row.addSpacer();
    var pctTxt = row.addText((pct * 100).toFixed(0) + "%");
    pctTxt.font = Font.systemFont(10);
    pctTxt.textColor = MUTED;
    var amtTxt = row.addText("  $" + catCad.toFixed(0));
    amtTxt.font = Font.boldSystemFont(11);
    amtTxt.textColor = color;

    w.addSpacer(2);

    var barRow = w.addStack();
    var barTxt = barRow.addText(buildBar(pct, 22));
    barTxt.font = Font.systemFont(7);
    barTxt.textColor = color;

    w.addSpacer(4);
  }

  w.addSpacer();
  var footer = w.addText("Tap to open Trip Tracker");
  footer.font = Font.systemFont(9);
  footer.textColor = DIM;

  return w;
}

// Load and run - no top-level async, use Promise chain
var data = null;
try {
  if (fm.fileExists(filePath)) {
    fm.downloadFileFromiCloud(filePath);
    data = JSON.parse(fm.readString(filePath));
  }
} catch(e) {
  data = null;
}

var widget = buildWidget(data);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}

Script.complete();
