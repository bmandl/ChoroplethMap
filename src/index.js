import * as d3 from "d3";
import * as topojson from "topojson";

const COUNTY_FILE = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const EDUCATION_FILE = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const width = 960, height = 600;

const color = d3.scaleThreshold().range(d3.schemeBlues[9]);

const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

const lScale = d3.scaleLinear().rangeRound([600, 860]);
const lAxis = d3.axisBottom(lScale)
    .tickSize(13)
    .tickFormat(x => Math.round(x) + '%');

const legend = svg.append("g")
    .attr("id", "legend")
    .append("g");

const tooltip = d3.select(".container").append("div")
    .attr("id", "tooltip")
    .style('opacity', 0);

var path = d3.geoPath();

Promise.all([d3.json(COUNTY_FILE), d3.json(EDUCATION_FILE)]).then((data) => {

    let counties = data[0],
        education = data[1];

    let arr = education.map(obj => obj["bachelorsOrHigher"]);
    let max = d3.max(arr);
    let min = d3.min(arr);
    color.domain(d3.range(min, max, (max - min) / 8));

    lAxis.tickValues(color.domain());
    lScale.domain([min, max]);

    legend.selectAll("rect")
        .data(color.range().map(d => {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = lScale.domain()[0];
            if (d[1] == null) d[1] = lScale.domain()[1];
            return d;
        }))
        .enter().append("rect")
        .attr("height", 8)
        .attr("x", d => lScale(d[0]))
        .attr("width", d => lScale(d[1]) - lScale(d[0]))
        .attr("fill", d => color(d[0]));

    legend.call(lAxis);

    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(counties, counties.objects.counties).features)
        .enter().append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("data-fips", d => d.id)
        .attr("data-education", d => education.find(obj => obj.fips === d.id)["bachelorsOrHigher"])
        .style("fill", d => {
            let tone = education.find(obj => obj.fips === d.id)["bachelorsOrHigher"];
            return color(tone);
        })
        .on("mouseover", d => {
            tooltip.attr("data-education", event.currentTarget.attributes["data-education"].value);
            tooltip.transition()
                .duration(100)
                .style('opacity', 0.95);
            tooltip.html(`${education.find(el => el.fips === d.id)["area_name"]}, 
            ND: ${education.find(el => el.fips === d.id)["bachelorsOrHigher"]}`)
                .style('left', `${event.clientX}px`)
                .style('top', `${event.clientY}px`)
                .style('transform', 'translateX(30px)');
        })
        .on('mouseout', () => {
            tooltip.transition()
                .duration(100)
                .style('opacity', 0);
        });

    svg.append("path")
        .attr("class", "county-borders")
        .attr("d", path(topojson.mesh(counties, counties.objects.counties, (a, b) => a !== b)));
});