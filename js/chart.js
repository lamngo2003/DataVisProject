// Define margins
const lineChartMargin = { top: 20, right: 20, bottom: 30, left: 50 };

const lineChartSvg = d3
  .select("#linechart")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .append("g")
  .attr("transform", `translate(${lineChartMargin.left}, ${lineChartMargin.top})`);

let lineChartWidth =
    parseInt(d3.select("#linechart").style("width")) -
    lineChartMargin.left -
    lineChartMargin.right,
  lineChartHeight =
    parseInt(d3.select("#linechart").style("height")) -
    lineChartMargin.top -
    lineChartMargin.bottom;

console.log("lineChartWidth:", lineChartWidth);
console.log("lineChartHeight:", lineChartHeight);

// Scales
const xScale = d3.scaleLinear().range([0, lineChartWidth]);
const yScale = d3.scaleLinear().range([lineChartHeight, 0]);

// Line generator
const line = d3
  .line()
  .x((d) => xScale(d.year))
  .y((d) => yScale(d.value));

// Load data for line chart
function loadLineChartData() {
  d3.csv("data/Australia_data-3.csv")
    .then((data) => {
      const migrationData = data;
      console.log("Data for line chart loaded successfully.");

      // Log all country names in the dataset
      let countryNames = migrationData.map((d) => d["Name"]);
      console.log("Country names in dataset: ", countryNames);

      // Event listener for country selection
      document.addEventListener("countrySelected", (e) => {
        const selectedCountry = e.detail;

        // Call the update function with the selected country and data
        updateLinechart(selectedCountry, migrationData);
      });
    })
    .catch((error) => console.error("Error loading data: ", error));
}

// Update function for line chart
function updateLinechart(country, data) {
  console.log(`Updating line chart for country: ${country}`);
  let countryData = data.find((d) => d["Name"] === country);
  if (!countryData) {
    console.error(`No data found for country: ${country}`);
    return;
  }

  let lineChartData = Object.keys(countryData)
    .filter((key) => !isNaN(+key))
    .map((year) => ({ year: +year, value: +countryData[year] }));

  xScale.domain(d3.extent(lineChartData, (d) => d.year));
  yScale.domain([0, d3.max(lineChartData, (d) => d.value)]);

  // Remove old content from the lineChartSvg
  lineChartSvg.selectAll("*").remove();

  // Draw line
  lineChartSvg
    .append("path")
    .datum(lineChartData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  // Add points
  lineChartSvg
    .selectAll(".dot")
    .data(lineChartData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => yScale(d.value))
    .attr("r", 5)
    .on("mouseover", function (d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html("Year: " + d.year + "<br/>" + "Value: " + d.value)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Add x-axis
  lineChartSvg
    .append("g")
    .attr("transform", `translate(0, ${lineChartHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

  // Add y-axis
  lineChartSvg.append("g").call(d3.axisLeft(yScale));
}

// Tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load data for line chart
loadLineChartData();
