
let width = parseInt(d3.select("#scatter").style("width"));
let height = width - width / 3.9;
let margin = 20;
let labelArea = 110;
let textPadBottm = 40;
let textPadLeft = 40;

let radius = 12;

let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

let leftLabelX = margin + textPadLeft;
let leftLabelY = (height + labelArea) / 2 - labelArea;

function xPadding() {
    let xLabel = d3.select(".xLabel");
    xLabel.attr(
      "transform",
      "translate(" +
        ((width - labelArea) / 2 + labelArea) +
        ", " +
        (height - margin - textPadBottm) +
        ")"
    );
  }
  xPadding();

function yPadding() {
    let yLabel = d3.select(".yLabel");
    yLabel.attr(
      "transform",
      "translate(" + leftLabelX + ", " + leftLabelY + ")rotate(-90)"
    );
  }
  yPadding();

function labelAxes() {
    svg.append("g").attr("class", "xLabel");
    let xLabel = d3.select(".xLabel");
    
    xLabel
    .append("text")
    .attr("y", -26)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)");
    
    xLabel
    .append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Age (Median)");
    
    xLabel
    .append("text")
    .attr("y", 26)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Household Income (Median)");

    svg.append("g").attr("class", "yLabel");
    let yLabel = d3.select(".yLabel");

    yLabel
    .append("text")
    .attr("y", -26)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Obese (%)");

    yLabel
    .append("text")
    .attr("x", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

    yLabel
    .append("text")
    .attr("y", 26)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Lacks Healthcare (%)");

    xPadding();
    yPadding();

};

labelAxes();

d3.csv("data/data.csv", rowConverter)
  .then(createChart)
  
function rowConverter(row) {
  row.healthcare = +row.healthcare;
  row.obesity = +row.obesity;
  row.smokes = +row.smokes;
  row.poverty = +row.poverty;
  row.income = +row.income;
  row.age = +row.age;
  return row;
};

function createChart(demoData) {

  let currentX = "poverty";
  let currentY = "healthcare";

  let xMin;
  let xMax;
  let yMin;
  let yMax;

  let toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      let xData;
      let currentState = "<div>" + d.state + "</div>";
      let yData = "<div>" + currentY + ": " + d[currentY] + "%</div>";
      if (currentX === "poverty") {
        xData = "<div>" + currentX + ": " + d[currentX] + "%</div>";
      }
      else {
        xData = "<div>" +
          currentX +
          ": " +
          parseFloat(d[currentX]).toLocaleString("en") +
          "</div>";
      }
      return currentState + xData + yData;
    });
  svg.call(toolTip);

  function xExtent() {
    xMin = d3.min(demoData, function(d) {
      return parseFloat(d[currentX]) * 0.90;
    });

    xMax = d3.max(demoData, function(d) {
      return parseFloat(d[currentX]) * 1.10;
    });
  };

  function yExtent() {
    yMin = d3.min(demoData, function(d) {
      return parseFloat(d[currentY]) * 0.90;
    });

    yMax = d3.max(demoData, function(d) {
      return parseFloat(d[currentY]) * 1.10;
    });
  };

  function labelChange(axis, clickedText) {
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    clickedText.classed("inactive", false).classed("active", true);
  };
  
  xExtent();
  yExtent();

  let xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  let yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin - labelArea, margin]);

  let xAxis = d3.axisBottom(xScale);
  let yAxis = d3.axisLeft(yScale);

  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  let circles = svg
  .selectAll("g circles")
  .data(demoData)
  .enter();

  circles
    .append("circle")
    .attr("cx", function(d) {
      return xScale(d[currentX]);
    })
    .attr("cy", function(d) {
      return yScale(d[currentY]);
    })
    .attr("r", radius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
   
    .on("mouseover", function(d) {
      toolTip.show(d, this);
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });

  circles
    .append("text")
    .text(function(d) {
      return d.abbr;
    })

    .attr("dx", function(d) {
      return xScale(d[currentX]);
    })
    .attr("dy", function(d) {
      return yScale(d[currentY]) + radius / 2.5;
    })
    .attr("font-size", radius)
    .attr("class", "stateText")
    
    .on("mouseover", function(d) {
      toolTip.show(d);
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });

  d3.selectAll(".aText").on("click", function() {
    let self = d3.select(this);
    if (self.classed("inactive")) {
      let axis = self.attr("data-axis");
      let name = self.attr("data-name");

      if (axis === "x") {
        currentX = name;
        xExtent();
        xScale.domain([xMin, xMax]);
        svg.select(".xAxis").transition().duration(1500).call(xAxis);
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[currentX]);
            })
            .duration(1500);
        });
        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[currentX]);
            })
            .duration(1500);
        });
        labelChange(axis, self);
      }
      else {
        currentY = name;
        yExtent();
        yScale.domain([yMin, yMax]);
        svg.select(".yAxis").transition().duration(1500).call(yAxis);
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[currentY]);
            })
            .duration(1500);
        });
        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[currentY]) + radius / 3;
            })
            .duration(1500);
        });
        labelChange(axis, self);
      }
    }
  });
};
