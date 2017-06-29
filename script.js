var CANDIDATE_NUMBER_LABEL = "Student Candidate Number";

function get(type, url) {
  return new Promise(function(resolve, reject) {
    d3[type](url, function(error, data) {
      if (error) return reject(error);
      else return resolve(data);
    })
  });
}

function parse(data) {

  // data comes in as a CSV string

  var csv = _(data)

      // split on every newline (whether CRLF of just LF)
      .split(/\r?\n/g)

      // split every line on comma
      .map(function(row) { return row.split(",") })

      // remove the first few rows that contain heading & description
      .dropWhile(function(row) { return row[0] !== CANDIDATE_NUMBER_LABEL })

      // remove empty rows
      .filter(function(row) {
        return !_.every(row, function(cell) { return cell === "" })
      })

      // group every 3 rows
      .chunk(3)

      // remove groups whose first row does not start with "Student Candidate Number"
      .filter(function(row) {
        return row[0][0] === CANDIDATE_NUMBER_LABEL
      })

      // get value (from the lodash object)
      .value()

  // now rows are grouped by candidate number
  // still need to extract/structure the data

  var candidates = csv.map(function(group) {

    // find the index where the module grades start
    var modulesIndex = _.findIndex(group[0], function(cell) { return cell === "Credit" });

    // group each column, containing module credit, code & grade (in that order)
    var modules = _.unzip(
      group.map(function(row) {
        return row.slice(modulesIndex + 1)
      })
    );

    // convert the arrays to JSON objects (with appropriate labels)
    modules = modules.map(function(module) {
      return {
        credit: module[0],
        moduleCode: module[1],
        marks: module[2]
      };
    });

    // remove modules if credit is empty string
    modules = modules.filter(function(module) { return module.credit !== "" });

    // remove modules whose credit does not start with a digit
    // note use of takeWhile: collects all modules in order up until it reaches
    // a module whose credit does not start with digit
    modules = _.takeWhile(modules, function(module) { return /^\d/.test(module.credit) });

    // cast types
    modules.forEach(function(module) {
      module.credit = parseFloat(module.credit);
      module.marks = parseFloat(module.marks);
    });

    // convert array of modules to object with module code as key
    modules = _.keyBy(modules, "moduleCode");

    var totalCredit = _.sumBy(_.values(modules), function(d) { return d.credit });
    var overallMarks = _.sumBy(_.values(modules), function(d) { return d.marks * d.credit }) / totalCredit;

    modules.Overall = {
      marks: overallMarks.toFixed(0)
    };

    return {
      candidateNumber: group[2][0],
      modules: modules
    };

  });

  return candidates;
}

function aggregateModule(candidates, moduleCode) {
  candidates = candidates.filter(function(candidate) {
    return candidate.modules[moduleCode] != null;
  }).map(function(candidate) {
    return {
      candidateNumber: candidate.candidateNumber,
      marks: candidate.modules[moduleCode].marks
    }
  });
  return _.sortBy(candidates, "marks");
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
  "COMP3004",
  "COMP3005",
  "COMP3011",
  "COMP3012",
  "COMP3013",
  "COMP3035",
  "COMP3058",
  "COMP3080",
  "COMP3091",
  "COMP3095",
  "COMP3096A",
  "COMP312P",
  "COMP313P",
  "Overall"
];

function findCandidate(candidates, query) {
  if (query === "") return null;
  return _.find(candidates, function(candidate) {
    return _.startsWith(candidate.candidateNumber.toLowerCase(), query.toLowerCase());
  });
}

function plotModuleCodes(container, candidates, moduleCodes) {

  moduleCodes = moduleCodes.sort();

  var moduleData = moduleCodes.map(function(moduleCode) {
    return {
      moduleCode: moduleCode,
      moduleName: window.moduleNames[moduleCode],
      candidates: aggregateModule(candidates, moduleCode)
    }
  });

  var moduleElems = container.selectAll(".module")
      .data(moduleData, function(d) { return d.moduleCode });

  moduleElems.enter()
      .append("div")
      .attr("class", "module clearfix")
      .call(plotModule());

  moduleElems.exit()
      .remove();
}


Promise.all([
  get("text", "data/2016-2017/bsc_yr3.csv"),
  get("text", "data/2016-2017/meng_yr3.csv"),
  get("text", "data/2016-2017/meng_mathcomp_yr3.csv")
]).then(function(sheets) {
  return d3.merge(sheets.map(parse));
}).then(function(candidates) {

  var root = d3.select("#content");

  var modules = root.append("div")
      .attr("class", "category modules");

  plotModuleCodes(modules, candidates, coreModules);

  var searchInput = d3.select("#search .candidate-number");

  searchInput.on("input", function() {
    var query = this.value;
    var candidate = findCandidate(candidates, query);
    if (candidate == null) {
      searchInput.classed("error", query != "");
      plotModuleCodes(modules, candidates, coreModules);
      window.searchHighlight(undefined);
      return;
    }
    searchInput.classed("error", false);
    var candidateNumber = candidate.candidateNumber;
    var candidateModules = _.keys(candidate.modules);
    plotModuleCodes(modules, candidates, candidateModules);
    window.searchHighlight(candidateNumber);
  });

});
