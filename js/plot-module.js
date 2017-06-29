function plotModule() {

  function chart(selection) {
    selection.each(function(d) {

      var individualChart = barChart();
      var markDistribution = histogram();

      var root = d3.select(this);

      var info = root.append("div")
          .attr("class", "info");

      info.append("h1")
          .text(d.moduleCode)

      info.append("h2")
          .text(d.moduleName)

      var marksList = root.append("div")
          .attr("class", "marks-list");

      root.append("div")
          .attr("class", "distribution")
          .datum(d.data)
          .call(markDistribution)

      root.append("div")
          .attr("class", "individual")
          .datum(d.data)
          .call(individualChart)

      window.events.on("highlight", function(candidateNumbers) {

        var selection = marksList.selectAll(".item")
            .data(candidateNumbers);

        selection.exit().remove();

        selection.enter().append("div")
            .attr("class", "item")
          .merge(selection)
            .style("color", function(_, i) { return window.highlightColors[i]; })
            .html(function(candidateNumber) {
              var result = _.find(d.data, { candidateNumber: candidateNumber });
              if (result) {
                return "<div class='candidate-number'>" + result.candidateNumber + "</div>" +
                       "<div class='marks'>" + result.marks + "</div>";
              }
            })
      });

    });
  }

  return chart;
}
