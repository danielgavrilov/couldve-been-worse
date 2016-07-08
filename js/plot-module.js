var moduleNames = {
  "CEGE201M": "Aerospace Design and Aerodynamics",
  "COMP201P": "Networking and Concurrency",
  "COMP202P": "Logic and Database Theory",
  "COMP203P": "Software Engineering and Human Computer Interaction",
  "COMP204P": "Systems Engineering I",
  "COMP205P": "Systems Engineering II",
  "COMP206P": "Mathematics and Statistics",
  "COMP207P": "Compilers",
  "COMP209P": "Cognitive Systems and Intelligent Technologies",
  "Comp7008": "Entrepreneurship: Theory and Practice",
  "ELEC210P": "Connected Systems",
  "LCFR6001": "French Level 1",
  "LCFR6003": "French Level 3",
  "LCGE6001": "German Level 1",
  "LCGE6002": "German Level 2",
  "LCJA6001": "Japanese Level 1",
  "LCJA6005": "Japanese Level 5",
  "LCMA6001": "Mandarin Level 1",
  "LCMA6003": "Mandarin Level 3",
  "MSIN6001B": "Understanding Management",
  "MSIN7008": "Entrepreneurship: Theory and Practice",
  "MSIN716P": "Management Accounting for Engineers",
  "STAO6002": "",
  "Overall": ""
};

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
          .text(moduleNames[d.moduleCode])

      var mark = root.append("div")
          .attr("class", "marks")
          .datum(d.data)
          .append("span");

      root.append("div")
          .attr("class", "distribution")
          .datum(d.data)
          .call(markDistribution)

      root.append("div")
          .attr("class", "individual")
          .datum(d.data)
          .call(individualChart)

      window.events.on("highlight", function(candidateNumber) {
        mark.text(function(d) {
          var result = _.find(d, { candidateNumber: candidateNumber });
          if (result) return result.marks;
          return "";
        })
      });

    });
  }

  return chart;
}
