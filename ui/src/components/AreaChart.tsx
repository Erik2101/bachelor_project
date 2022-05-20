import React from "react";
import * as d3 from "d3";
import "./AreaChart.css";
import "./ChartContainer.css"
import { errorSpreadData, ErrPerDate, ErrSpreadChartData } from "../util";
import { DeviceData } from "../proto/frontend_pb";
import { geoCircle, range, select } from "d3";
import { callbackify } from "util";

function AreaChart (props: {data : Array<DeviceData>}) {

    const [data, setData] = React.useState<ErrSpreadChartData>()

    const areaChart = React.useRef(null)

    const drawChart = React.useCallback(() => {
        if(data) {
            let domain : Array<Date> = []   
            for (const date of data.xDomain) {
                domain.push(new Date(date))
            }

            const containerWidth = parseInt(d3.select(".chart-container").style("width"))
            const containerHeight = parseInt(d3.select(".chart-container").style("height"))
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
            const x = d3.scaleTime()
                            .domain(dx)
                            .range([margin.left, chartWidth + margin.right])

            let yMax = 0
            for (const i in range(data.dataSet.length)) {
                for (const item of data.dataSet[i].data) {
                    if (item.errNum > yMax) {yMax = item.errNum}
                }
            }
            
            const y = d3.scaleLinear()
                            .domain([0, yMax])
                            .range([chartHeight, margin.top / 2])

            const colours = [
                {fill: "#44F295", stroke: "#2B8A3C"},
                {fill: "#F5CC26", stroke: "#F2941D"},
                {fill: "#F54E1B", stroke: "#DB281A"}
            ]

            const tooltip = d3.select(".tooltip")
                                .style("position", "absolute")
                                .style("opacity", 0);

            const justData = []
            const circleData = []

            for (const j in range (data.dataSet.length)) {
                
                justData.push(data.dataSet[j].data)
                for (const i in range(domain.length)) {
                    circleData.push(data.dataSet[j].data[i])
                }
            }
        
            const lineFunction = d3.line<ErrPerDate>()
                                    .x((d) => x(new Date(d.date)))
                                    .y((d) => y(d.errNum))

            svg.selectAll("path")
                .data(justData)
                .join(
                    enter => enter.append("path"),
                    update => update,
                    exit => exit.remove()
                )
                .attr("d", (d) => lineFunction(d))
                .attr("fill", "none")
                .attr("stroke", (_, i) => colours[i].stroke)
                .attr("stroke-width", 1)
                .attr("transform", "translate(" + (-chartWidth / 2 - margin.left) + ", " + -chartHeight / 2 +")")

            /* const areaFunction = d3.area<ErrPerDate>()
                                    .x((d) => x(new Date(d.date)))
                                    .y0(y(0))
                                    .y1((d) => y(d.errNum))

            svg.selectAll("path")
                .data(justData)
                .join(
                    enter => enter.append("path"),
                    update => update,
                    exit => exit.remove()
                )
                .attr("d", (d) => areaFunction(d))
                .attr("fill", (_, i) => colours[i].fill)
                .attr("stroke", "none")
                .attr("fill-opacity", 0.25)
                .attr("transform", "translate(" + (-chartWidth / 2 - margin.left) + ", " + -chartHeight / 2 +")") */

                
            svg.selectAll("circle")
                .data(circleData)
                .join(
                    enter => enter.append("circle"),               
                    update => update,
                    exit => exit.remove()
                )
                .attr("fill", (_, i) => colours[Math.ceil((i + 1) / domain.length) - 1].stroke)
                .attr("stroke", "none")
                .attr("cx", (d, i) => x(new Date(d.date)))
                .attr("cy", (d, i) => y(d.errNum))
                .attr("r", 2)
                .attr("transform", "translate(" + (-chartWidth / 2 - margin.left) + ", " + -chartHeight / 2 +")")
                
                .on("mouseover", (element) => select(element.currentTarget).attr("r", 4))
                .on("mouseout", (element) => select(element.currentTarget).attr("r", 2))

                .on("mousemove", function(event, d) {
                    tooltip.transition()
                                .duration(50)
                                .style("opacity", 1)

                    tooltip.html(d.errNum.toString())
                            .style("left", d3.pointer(event, window)[0] + "px")
                            .style("top", (d3.pointer(event, window)[1] - margin.top * 0.4)  + "px");
                })

                .on("mouseleave", function() {
                    tooltip.transition()
                                .duration(50)
                                .style("opacity", 0)
                })

            const chartTitle = "Gerätefehler von " + data.xDomain[0] + " bis " +
            data.xDomain[data.xDomain.length - 1] + " nach Prioritäten"
            
            svg.selectAll("text")
                .data([1])
                .join(
                    enter => enter.append("text"),
                    update => update,
                    exit => exit.remove()
                )
                .attr("x", (containerWidth / 2))             
                .attr("y", 0 )
                .attr("transform", "translate(" + (-chartWidth / 2 - margin.left) + ", " + -chartHeight / 2 +")")
                .attr("text-anchor", "middle")  
                .style("font-size", "1em")
                .style("font-weight", "600")
                .text(chartTitle)


            svg.append("g")
                .call(d3.axisLeft(y))
                .attr("transform", "translate("+ -chartWidth / 2 + ", " + - chartHeight / 2 + ")")

            svg.append("g")
                .call(d3.axisBottom(x))
                .attr("transform", "translate(" + (-chartWidth / 2 - margin.left) + ", " + chartHeight / 2 +")")
        }
    }, [data])

    React.useEffect(() => {
        if (data) drawChart()
    }, [data])

    React.useEffect(() => {
        if (props.data) setData(errorSpreadData(props.data))
    }, [props])

    return (
        <div className="chart-container">
            <svg ref={areaChart}></svg>
            <div className="tooltip"></div>
        </div>
    )
}

export default AreaChart