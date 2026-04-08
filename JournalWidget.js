// Journal Widget - Medium (4x2)
// Shows a random photo from journal.json
// Reads from iCloud Drive / Scriptable / journal.json
// No async/await - compatible with eval() loader

var FILE_NAME = "journal.json";
var fm = FileManager.iCloud();
var filePath = fm.joinPath(fm.documentsDirectory(), FILE_NAME);

var JOURNAL_URL = "https://harryjwang.github.io/Japan_Trip_Widget/Journal/";

var BG     = new Color("#0f0f0f");
var DIM    = new Color("#333333");
var TEXT   = new Color("#f0ede8");
var MUTED  = new Color("#999999");
var ACCENT = new Color("#e8c96a");
var WHITE  = new Color("#ffffff");

function loadData() {
  try {
    if (!fm.fileExists(filePath)) return null;
    fm.downloadFileFromiCloud(filePath);
    return JSON.parse(fm.readString(filePath));
  } catch(e) {
    return null;
  }
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDate(datetimeStr) {
  try {
    var d = new Date(datetimeStr);
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    return days[d.getDay()] + " " + months[d.getMonth()] + " " + d.getDate();
  } catch(e) {
    return datetimeStr || "";
  }
}

function buildWidget(data) {
  var w = new ListWidget();
  w.backgroundColor = BG;
  w.url = JOURNAL_URL;
  w.setPadding(0, 0, 0, 0);

  if (!data || !data.photos || data.photos.length === 0) {
    w.setPadding(14, 14, 14, 14);
    w.addSpacer();
    var t = w.addText("No journal entries yet");
    t.font = Font.mediumSystemFont(13);
    t.textColor = MUTED;
    t.centerAlignText();
    var s = w.addText("Open Journal to add photos");
    s.font = Font.systemFont(10);
    s.textColor = new Color("#555555");
    s.centerAlignText();
    w.addSpacer();
    return w;
  }

  var entry = pickRandom(data.photos);

  // Background image
  if (entry.photo) {
    try {
      var base64 = entry.photo.replace(/^data:image\/\w+;base64,/, "");
      var imgData = Data.fromBase64String(base64);
      var img = Image.fromData(imgData);
      w.backgroundImage = img;
    } catch(e) {
      w.backgroundColor = DIM;
    }
  } else {
    w.backgroundColor = DIM;
  }

  // Dark gradient overlay at bottom using a stack
  w.addSpacer();

  var overlay = w.addStack();
  overlay.layoutVertically();
  overlay.setPadding(10, 12, 12, 12);
  overlay.backgroundColor = new Color("#000000", 0.55);

  // Caption
  var caption = overlay.addText(entry.caption);
  caption.font = Font.boldSystemFont(13);
  caption.textColor = WHITE;
  caption.lineLimit = 2;

  overlay.addSpacer(4);

  // Meta row
  var metaRow = overlay.addStack();
  metaRow.layoutHorizontally();
  metaRow.spacing = 6;

  if (entry.location) {
    var locTxt = metaRow.addText("\u{1F4CD} " + entry.location);
    locTxt.font = Font.systemFont(10);
    locTxt.textColor = ACCENT;
    locTxt.lineLimit = 1;
  }

  metaRow.addSpacer();

  var dateTxt = metaRow.addText(formatDate(entry.datetime));
  dateTxt.font = Font.systemFont(10);
  dateTxt.textColor = new Color("#cccccc");

  if (entry.starred) {
    metaRow.addSpacer(4);
    var star = metaRow.addText("\u2605");
    star.font = Font.systemFont(10);
    star.textColor = ACCENT;
  }

  return w;
}

var data = loadData();
var widget = buildWidget(data);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}

Script.complete();
