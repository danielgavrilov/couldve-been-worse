var moduleNames = {
  "COMP101P": "Principles of Programming",
  "COMP102P": "Theory I",
  "COMP103P": "Object-Oriented Programming",
  "COMP104P": "Theory II",
  "COMP105P": "Robotics Programming",
  "ENGS101P": "Integrated Engineering",
  "ENGS102P": "Design & Professional Skills",
  "MATH6301": "Discrete Mathematics for Computer Scientists"
};

var modules = _.keys(moduleNames);

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

function substringMatcher(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
}

d3.csv("data/bsc.csv", function(err, BSc) {
  d3.csv("data/meng.csv", function(err, MEng) {

    var data = BSc.concat(MEng);

    data.forEach(removeEmptyStrings);
    data.forEach(tryParseFloats);

    var formatCount = d3.format(",.0f");

    var margin = {top: 10, right: 10, bottom: 50, left: 10},
        width = 500 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var root = d3.select("#content");

    var x = d3.scale.linear()
        .domain([0, 100])
        .range([0, width]);

    var histogram = d3.layout.histogram()
        .bins(x.ticks(10));

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var moduleSVGs = root.selectAll("div")
        .data(modules)
      .enter()
        .append("div")
        .attr("class", "module")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    moduleSVGs.append("text")
        .attr("class", "module-code")
        .attr("dy", "1.5em")
        .attr("y", height + 17)
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return d + ": " + moduleNames[d].toUpperCase(); });

    var bar = moduleSVGs.selectAll(".bar")
        .data(function(module) {
          return histogram(_(data).pluck(module).compact().value())
        })
      .enter().append("g");

    var allData = bar.map(function(bars) { return d3.selectAll(bars).data() });
    y.domain([0, d3.max(allData, function(d) { return d3.max(d, function(d) { return d.y }); })]);

    bar.attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", function(data) { return x(data.dx) - 1; })
        .attr("height", function(d) { return height - y(d.y); });

    bar.append("text")
        .attr("dy", ".375em")
        .attr("y", function(d) {
          if (y(d.y) > height - 15) return -9;
          else return 9;
        })
        .style("fill", function(d) {
          if (y(d.y) > height - 15) return "black";
          else return "white";
        })
        .attr("x", function(d) { return x(d.dx) / 2 })
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.y); });

    moduleSVGs.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

  });
});
