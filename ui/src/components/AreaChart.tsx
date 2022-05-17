import React from "react";
import * as d3 from "d3";
import "./AreaChart.css";
import { errorSpreadData } from "../util";
import { DeviceData } from "../proto/frontend_pb";
import { range } from "d3";

const AreaChart = (props: {data : Array<DeviceData>}) => {

    const areaChart = React.useRef(null)

    function drawChart() {
        const template = errorSpreadData(props.data)
        let domain : Array<Date> = []   
        for (const date of template.xDomain) {
            domain.push(new Date(date))
        }

        const chartTitle = "Gerätefehler von " + template.xDomain[0] + " bis " +
                            template.xDomain[template.xDomain.length - 1] + " nach Prioritäten"

        const containerWidth = parseInt(d3.select(".area-chart").style("width"))
        const containerHeight = parseInt(d3.select(".area-chart").style("height"))
        const margin = {
            top: containerHeight * 0.2, 
            right: containerWidth * 0.1,
            bottom: containerHeight * 0.00,
            left: containerWidth * 0.1
        }

        const chartWidth = containerWidth - margin.left - margin.right
        const chartHeight = containerHeight - margin.top - margin.bottom

        const svg = d3.select(areaChart.current)
                        .attr("width", containerWidth)
                        .attr("height", containerHeight)
                        .attr("viewBox", [-containerWidth / 2, -containerHeight / 2, containerWidth, containerHeight])


        const dx = [domain[0], domain[domain.length - 1]]
        console.log(dx)
        const x = d3.scaleTime()
                        .domain(dx)
                        .range([margin.left, chartWidth + margin.right])

        svg.append("g")
            .call(d3.axisBottom(x))
            .attr("transform", "translate(" + (-chartWidth / 2 - margin.left) + ", " + chartHeight / 2 +")")

        let yMax = 0
        for (const i in range(template.dataSet.length)) {
            for (const item of template.dataSet[i].data) {
                if (item.errNum > yMax) {yMax = item.errNum}
            }
        }
        
        const y = d3.scaleLinear()
                        .domain([0, yMax])
                        .range([chartHeight, margin.top / 2])

        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("transform", "translate("+ -chartWidth / 2 + ", " + - chartHeight / 2 + ")")

        const colours = [
            {fill: "#44F295", stroke: "#48DB63"},
            {fill: "#F5CC26", stroke: "#F2941D"},
            {fill: "#F54E1B", stroke: "#DB281A"}
        ]

        for (const j in range (template.dataSet.length)) {
            const area = d3.area()
                                .x((_d, i) => x(new Date(template.dataSet[j].data[i].date)))
                                .y0(y(0))
                                .y1((_d, i) => y(template.dataSet[j].data[i].errNum))

            svg.append("path")
                .datum(template.dataSet[j].data)
                .attr("d", area)
                .attr("fill", colours[j].fill!)
                .attr("stroke", colours[j].stroke!)
                .attr("stroke-width", 1)
                .attr("fill-opacity", 0.25)
                .attr("transform", "translate(" + (-chartWidth / 2 - margin.left) + ", " + -chartHeight / 2 +")")
        
            /* svg.selectAll" */
        }

        svg.append("text")
            .attr("x", (containerWidth / 2))             
            .attr("y", 0 )
            .attr("transform", "translate(" + (-chartWidth / 2 - margin.left) + ", " + -chartHeight / 2 +")")
            .attr("text-anchor", "middle")  
            .style("font-size", "1em")
            .style("font-weight", "600")
            .text(chartTitle)
            
    }

    React.useEffect(() => {
        drawChart()
    })

    return (
        <div className="area-chart">
            <svg ref={areaChart}></svg>
        </div>
    )
}

export default AreaChart