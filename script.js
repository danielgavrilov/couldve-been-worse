function tryParseFloats(obj) {
  for (var key in obj) {
    var value = parseFloat(obj[key]);
    if (!isNaN(value)) obj[key] = value;
  }
  return obj;
}

function removeEmptyStrings(obj) {
  for (var key in obj) {
    if (obj[key] === "") delete obj[key];
  }
  return obj;
}

function removeKeys(ignoredKeys) {
  return function(obj) {
    for (var key in obj) {
      if (_.includes(ignoredKeys, key)) delete obj[key];
    }
  }
}

function get(type, url) {
  return new Promise(function(resolve, reject) {
    d3[type](url, function(error, data) {
      if (error) return reject(error);
      else return resolve(data);
    })
  });
}

function parse(data, label) {

  data.forEach(removeEmptyStrings);
  data.forEach(tryParseFloats);
  data.forEach(removeKeys(["", "Outcome"]));

  data = _.chunk(data, 2);
  data = data.map(parseSingle);

  return data;

}

function parseSingle(rows) {
  return {
    candidateNumber: rows[0]["Candidate Number"],
    modules: rows[1]
  };
}

function aggregateModule(results, moduleCode) {
  results = results.filter(function(result) {
    return result.modules[moduleCode] != null;
  }).map(function(result) {
    return {
      candidateNumber: result.candidateNumber,
      marks: result.modules[moduleCode]
    }
  })
  return _.sortBy(results, "marks");
}

window.color = d3.scaleThreshold()
    .domain([40, 50, 60, 70])
    .range(["#fc9292", "#fbd89b", "#a2e096", "#8dc9ec", "#b0a7f1"]);

window.highlightColors = ["#000", "#d3201d"];

window.events = new EventEmitter();

var mouseResult = null,
    searchResult = null;

window.mouseHighlight = function(candidateNumber) {
  mouseResult = candidateNumber;
  notify();
}

window.searchHighlight = function(candidateNumber) {
  searchResult = candidateNumber;
  notify();
}

function notify() {
  window.events.emit("highlight", [searchResult, mouseResult]);
}

var coreModules = [
  "COMP201P",
  "COMP202P",
  "COMP203P",
  "COMP204P",
  "COMP205P",
  "COMP206P",
  "COMP207P",
  "Overall"
];

var minorModules = [
  "CEGE201M",
  "COMP209P",
  "ELEC210P",
  "MSIN6001B",
  "MSIN7008",
  "MSIN716P"
];


function search(data, query) {
  var candidateNumbers = data.map(function(d) {
    return d.candidateNumber;
  });
  return _.find(candidateNumbers, function(candidateNumber) {
    return _.startsWith(candidateNumber.toLowerCase(), query.toLowerCase());
  });
}

function plotModuleCodes(moduleCodes) {
  return function(selection) {
    selection.each(function(data) {

      d3.select(this).selectAll(".module")
          .data(moduleCodes.map(function(moduleCode) {
            return {
              moduleCode: moduleCode,
              moduleName: window.moduleNames[moduleCode],
              data: aggregateModule(data, moduleCode)
            }
          }))
        .enter()
          .append("div")
          .attr("class", "module clearfix")
          .call(plotModule());
    });
  }
}


Promise.all([
  get("csv", "data/2015-2016/bsc_yr2.csv"),
  get("csv", "data/2015-2016/meng_yr2.csv"),
  get("csv", "data/2015-2016/meng_yr2b.csv")
]).then(function(sheets) {
  return d3.merge(sheets.map(parse));
}).then(function(data) {

  var root = d3.select("#content");

  var core = root.append("div")
      .attr("class", "category core-modules");

  core.append("h1")
      .text("Core modules")

  core.append("div")
      .attr("class", "modules")
      .datum(data)
      .call(plotModuleCodes(coreModules));

  var minors = root.append("div")
      .attr("class", "category minor-modules");

  minors.append("h1")
      .text("Minor modules")

  minors.append("div")
      .attr("class", "modules")
      .datum(data)
      .call(plotModuleCodes(minorModules));

  var searchInput = d3.select("#search .candidate-number");

  searchInput.on("input", function() {
    var result = search(data, this.value);
    searchInput.classed("error", result == null);
    window.searchHighlight(result);
  });

});
