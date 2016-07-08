function barChart() {

  var margin = {top: 10, right: 10, bottom: 35, left: 50},
      width = 450 - margin.left - margin.right,
      height = 140 - margin.top - margin.bottom;

  function chart(selection) {
    selection.each(function(data) {

      var root = d3.select(this);

      var x = d3.scaleBand()
          .domain(d3.range(data.length))
          .rangeRound([0, width])
          .padding(.15)
          .align(0);

      var y = d3.scaleLinear()
          .domain([0, 100])
          .range([height, 0]);

      var color = d3.scaleThreshold()
          .domain([40, 50, 60, 70])
          .range(["#fc9292", "#f9d390", "#aadf8f", "#8dcaee", "#b0a7f5"]);

      var yAxis = d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickPadding(5);

      var svg = root.append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("class", "bar-chart");

      svg.append("text")
          .attr("class", "x-axis-label")
          .attr("transform", "translate(" + width / 2 + "," + height + ")")
          .attr("y", 20)
          .style("text-anchor", "middle")
          .text("Individual students");

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "y-axis-label")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -38)
          .attr("dy", ".71em")
          .style("text-anchor", "middle")
          .text("Marks");

      svg.append("g").selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d, i) { return x(i); })
          .attr("width", x.bandwidth())
          .attr("y", function(d) { return y(d.marks); })
          .attr("height", function(d) { return height - y(d.marks); })
          .style("fill", function(d) { return color(d.marks); })
          .on("mouseenter", function(d) {
            window.mouseHighlight(d.candidateNumber);
          })
          .on("mouseleave", function() {
            window.mouseHighlight(null);
          });

      window.events.on("highlight", function(candidateNumber) {
        console.log(candidateNumber);
        svg.selectAll(".bar")
          .style("fill", function(d) {
            return d.candidateNumber == candidateNumber ? "red" : color(d.marks);
          })
      });

      window.events.on("unhighlight", function() {
        svg.selectAll(".bar")
          .style("fill", "");
      })

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
