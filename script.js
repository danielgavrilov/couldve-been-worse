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

window.events = new EventEmitter();

window.mouseHighlight = function(candidateNumber) {
  window.events.emit("highlight", candidateNumber);
}

var plotModules = [
  "COMP201P",
  "COMP202P",
  "COMP203P",
  "COMP204P",
  "COMP205P",
  "COMP206P",
  "COMP207P",
  "COMP209P",
  "CEGE201M",
  "ELEC210P",
  "Overall"
];

Promise.all([
  get("csv", "data/bsc_yr2.csv"),
  get("csv", "data/meng_yr2.csv"),
  get("csv", "data/meng_yr2b.csv")
]).then(function(sheets) {
  return d3.merge(sheets.map(parse));
}).then(function(data) {

  var root = d3.select("#content");

  // root.append("div")
  //     .attr("class", "individual")
  //   .selectAll(".chart")
  //     .data(plotModules.map(function(moduleCode) { return aggregateModule(data, moduleCode); }))
  //   .enter()
  //     .append("div")
  //     .attr("class", "chart")
  //     .call(individualChart);

  // root.append("div")
  //     .attr("class", "mark-distribution")
  //   .selectAll(".chart")
  //     .data(plotModules.map(function(moduleCode) { return aggregateModule(data, moduleCode); }))
  //   .enter()
  //     .append("div")
  //     .attr("class", "chart")
  //     .call(markDistribution);

  var plot = plotModule();

  root.selectAll(".module")
      .data(plotModules.map(function(moduleCode) {
        return {
          moduleCode: moduleCode,
          data: aggregateModule(data, moduleCode)
        }
      }))
    .enter()
      .append("div")
      .attr("class", "module")
      .call(plot);

});
