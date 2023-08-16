const mapContainer = d3.select("#map-container").node();
const mapWidth = mapContainer.clientWidth - margin.left - margin.right;
const mapHeight = mapContainer.clientHeight - margin.top - margin.bottom;

const mapSvg = d3.select("#map-container") // Changed from "#map"
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

let migrationDataByYear;
let paths;

d3.json("data/worldGeo.json").then(world => {
    const projection = d3.geoEquirectangular().fitSize([mapWidth, mapHeight], world);
    paths = mapSvg.append("g")
        .selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#333")
        .style("fill", "#66c2a4")
        .on("click", d => {
            selectedCountry = d.properties.name;
            document.dispatchEvent(new CustomEvent('countrySelected', {detail: selectedCountry}));
        });
});

d3.csv("data/migration.csv").then(data => {
    migrationDataByYear = data;
    drawMap(2018);
});

function drawMap(year) {
    const colorScale = d3.scaleSequentialLog(d3.interpolateYlGnBu)
        .domain([1, d3.max(migrationDataByYear, d => +d[year] || 0)]);

    paths.style("fill", function(d) {
        const countryData = migrationDataByYear.find(data => data["Name"] === d.properties.name);
        return countryData && countryData[year] ? colorScale(+countryData[year]) : "#ccc";
    });
}

const slider = d3.select("#year-input");
const output = d3.select("#year-label");
slider.on("input", function() {
    const selectedYear = this.value;
    output.text(selectedYear);
    drawMap(selectedYear);
    
    // Dispatch a global event
    const yearChangedEvent = new CustomEvent('yearChanged', { detail: selectedYear });
    document.dispatchEvent(yearChangedEvent);
  });
  
const yearInput = document.getElementById('year-input');
const yearLabel = document.getElementById('year-label');

yearInput.addEventListener('input', function() {
    const selectedYear = this.value;
    yearLabel.textContent = selectedYear;
    
    // Dispatch a global event to notify other parts of the code that the year has changed
    const yearChangedEvent = new CustomEvent('yearChanged', { detail: selectedYear });
    document.dispatchEvent(yearChangedEvent);
});
