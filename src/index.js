import * as d3 from "d3";
import * as topojson from "topojson";

const COUNTY_FILE = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const EDUCATION_FILE = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const width = 960, height = 600;

const color = d3.scaleThreshold().range(d3.schemeBlues[9]);

const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geoPath();

Promise.all([d3.json(COUNTY_FILE), d3.json(EDUCATION_FILE)]).then((data) => {

    let counties = data[0],
        education = data[1];

    let arr = education.map(obj => obj["bachelorsOrHigher"]);
    let max = d3.max(arr);
    let min = d3.min(arr);
    color.domain(d3.range(min,max,(max-min)/8));   

    console.log(color.domain());

    svg.append("g")
        .attr("class", "counties")        
        .selectAll("path")
        .data(topojson.feature(counties, counties.objects.counties).features)
        .enter().append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("data-fips", d => d.id)
        .attr("data-education", d => education.find(obj => obj.fips === d.id)["bachelorsOrHigher"])
        .style("fill",d => {
            let tone = education.find(obj => obj.fips === d.id)["bachelorsOrHigher"];
            return color(tone);
        })

    svg.append("path")
        .attr("class", "county-borders")
        .attr("d", path(topojson.mesh(counties, counties.objects.counties, (a, b) => a !== b)));
});