function histogram() {

  var MAX_PEOPLE = 65;

  var margin = {top: 10, right: 10, bottom: 35, left: 50},
      width = 400 - margin.left - margin.right,
      height = 140 - margin.top - margin.bottom;

  function chart(selection) {
    selection.each(function(data) {

      var root = d3.select(this);

      var formatCount = d3.format(",.0f");

      var x = d3.scaleLinear()
          .domain([0, 100])
          .rangeRound([0, width]);

      var y = d3.scaleLinear()
          .domain([0, MAX_PEOPLE])
          .range([height, 0]);

      var yAxis = d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickPadding(5);

      var bins = d3.histogram()
          .domain([0, 100])
          .thresholds(x.ticks(10))
          .value(function(d) { return d.marks })
          (data);

      var svg = root.append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("class", "histogram");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      svg.append("text")
          .attr("class", "x-axis-label")
          .attr("transform", "translate(" + width / 2 + "," + height + ")")
          .attr("y", 32)
          .style("text-anchor", "middle")
          .text("Marks");

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "y-axis-label")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -35)
          .attr("dy", ".71em")
          .style("text-anchor", "middle")
          .text("Number of students");

      var bar = svg.selectAll(".bar")
          .data(bins)
        .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

      bar.append("rect")
          .attr("x", 1)
          .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", function(d) { return window.color(d.x0); });

      bar.append("text")
          .attr("dy", ".375em")
          .attr("y", function(d) {
            if (y(d.length) > height - 15) return -8;
            else return 9;
          })
          .style("fill", function(d) {
            if (y(d.length) > height - 15) return "black";
            else return "white";
          })
          .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
          .attr("text-anchor", "middle")
          .text(function(d) { return formatCount(d.length); });


    });
  }

  chart.width = function(x) {
    if (!arguments.length) return width;
    width = x - margin.left - margin.right;
    return chart;
  };

  chart.height = function(x) {
    if (!arguments.length) return height;
    height = x - margin.top - margin.bottom;
    return chart;
  };

  return chart;
}
