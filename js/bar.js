const chartContainer = d3.select("#charts-container").node();
const chartWidth = chartContainer.clientWidth - margin.left - margin.right;
const chartHeight = chartContainer.clientHeight * 0.5 - margin.top - margin.bottom;

const chartSvg = d3.select("#chart")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create groups for the bar and pie charts
const barChartGroup = chartSvg.append("g");
const pieChartGroup = chartSvg.append("g").style("display", "none");

// Switch Chart function
function switchChart(type) {
    if (type === 'bar') {
        updateBarchart(selectedCountry, migrationData);
    } else if (type === 'pie') {
        updatePiechart(selectedCountry, migrationData);
    }
}

const chartTitle = chartSvg.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + margin.bottom)
    .style("text-anchor", "middle")
    .text("");

let migrationData;

function filterDataByYear(data, year) {
    return data.filter(d => d['Year'] === year);
}

document.addEventListener('yearChanged', e => {
    const selectedYear = e.detail;
    updateBarchart(selectedCountry, filterDataByYear(migrationData, selectedYear));
});


// UpdateBarchart function...
function updateBarchart(country, data) {
    barChartGroup.selectAll("*").remove(); // Clear bar chart

    // Filter data based on selected country and exclude 'All ages'
    let filteredData = data
        .filter(d => d["Country of birth"] === country)
        .filter(d => d["AGE"] !== "All ages");

    // Map data to age groups and values
    const ageGroups = filteredData.map(row => row["AGE"]);
    const values = filteredData.map(row => +row["Value"]);

    // Define scales
    const xScale = d3.scaleBand()
        .domain(ageGroups)
        .range([0, chartWidth])
        .padding(0.1);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(values)])
        .range([chartHeight, 0]);

    // Draw bars
    barChartGroup.selectAll(".bar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d["AGE"]))
        .attr("y", d => yScale(+d["Value"]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => chartHeight - yScale(+d["Value"]));

    // Add x-axis
    barChartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    barChartGroup.append("g")
        .call(d3.axisLeft(yScale));

    chartTitle.text(`Migration Data for ${country}`);
}

// UpdatePiechart function...
function updatePiechart(country, data) {
    pieChartGroup.selectAll("*").remove(); // Clear pie chart
    // Filter data based on selected country and exclude 'All ages'
    let filteredData = data
        .filter(d => d["Country of birth"] === country)
        .filter(d => d["AGE"] !== "All ages");

    // Map data to age groups and values
    const ageGroupsValues = filteredData.map(row => ({ age: row["AGE"], value: +row["Value"] }));

    // Calculate the total value for all age groups
    const totalValue = d3.sum(ageGroupsValues, d => d.value);

    // Select chart SVG and remove old content
    const chartSvg = d3.select("#chart").select("svg");
    chartSvg.selectAll("*").remove();

    // Define pie layout
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null)(ageGroupsValues);

    // Define arc for the pie chart
    const chartWidth = +chartSvg.attr("width");
    const chartHeight = +chartSvg.attr("height");
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(chartWidth, chartHeight) / 2);

    // Draw pie chart
    const arcs = chartSvg.selectAll(".pie")
        .data(pie)
        .enter()
        .append("g")
        .attr("class", "pie")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight / 2})`);

    arcs.append("path")
        .attr("d", arc)
        .style("fill", (d, i) => d3.schemeCategory10[i]);

    // Append text labels to each arc
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(d => `${d.data.age}: ${(d.value / totalValue * 100).toFixed(2)}%`);

    // Update chart title
    // Make sure you have an element for the title or adjust this part to fit your HTML structure
    const chartTitle = d3.select("#chart-title");
    chartTitle.text(`Migration Data for ${country}`);
}



d3.csv("data/Migration.csv").then(data => {
    migrationData = data;

    document.addEventListener('countrySelected', e => {
        selectedCountry = e.detail;
        switchChart('bar', selectedCountry); // Default chart
    });

    d3.select("#bar-chart-btn").on("click", () => {
        console.log("Bar chart button clicked");
        switchChart('bar', selectedCountry);
        d3.select("#bar-chart-btn").classed("active", true);
        d3.select("#pie-chart-btn").classed("active", false);
    });

    d3.select("#pie-chart-btn").on("click", () => {
        console.log("Pie chart button clicked");
        switchChart('pie', selectedCountry);
        d3.select("#bar-chart-btn").classed("active", false);
        d3.select("#pie-chart-btn").classed("active", true);
    });
});

