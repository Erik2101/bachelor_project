import React from "react";
import * as d3 from "d3";
import "./ChartContainer.css"
import { errorSpreadData, ErrPerDate, ErrSpreadChartData } from "../util";
import { DeviceData } from "../proto/frontend_pb";
import { range } from "d3";
import { theme } from "../theme";

function MultiLineChart (props: {data : Array<DeviceData>}) {

    const [data, setData] = React.useState<ErrSpreadChartData>()
    const [tooltipValues, setTooltipValues] = React.useState([
        {priority: "low", value: ""},
        {priority: "medium", value: ""},
        {priority: "high", value: ""}])

    const lineChart = React.useRef(null)

    const drawChart = React.useCallback(() => {
        if(data) {
            let domain : Array<Date> = []   
            for (const date of data.xDomain) {
                domain.push(new Date(date))
            }

            const containerWidth = parseInt(d3.select(".chart-container").style("width"))
            const containerHeight = parseInt(d3.select(".chart-container").style("height"))
            const margin = {
                top: containerHeight * 0.1, 
                right: containerWidth * 0.1,
                bottom: containerHeight * 0.1,
                left: containerWidth * 0.1
            }

            const chartWidth = containerWidth - margin.left - margin.right
            const chartHeight = containerHeight - margin.top - margin.bottom

            const svg = d3.select(lineChart.current)
                            .attr("width", containerWidth)
                            .attr("height", containerHeight)
                            .attr("viewBox", [0, 0, containerWidth, containerHeight])


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
                            .range([chartHeight + margin.bottom, 2 * margin.top])
                            .nice()

            const colours = [
                {fill: "#44F295", stroke: theme.low_prio}, // low
                {fill: "#F5CC26", stroke: theme.medium_prio}, // medium
                {fill: "#F54E1B", stroke: theme.high_prio} // high
            ]

            /* const tooltip = d3.select(".tooltip")
                                .style("position", "absolute")
                                .style("opacity", 0); */

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
                    (exit) => 
                        exit.call((path) =>
                             path.transition().duration(0).style("opacity", 0).remove())
                )
                .attr("d", (d) => lineFunction(d))
                .attr("fill", "none")
                .attr("stroke", (_, i) => colours[i].stroke)
                .attr("stroke-width", 1)
                .attr("class", "line")
                
            /* svg.selectAll("circle")
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
                
                .on("mouseover", (element) => select(element.currentTarget).attr("r", 4))
                .on("mouseout", (element) => select(element.currentTarget).attr("r", 2))

                .on("mousemove", function(event, d) {
                    tooltip.transition()
                                .duration(50)
                                .style("opacity", 1)

                    tooltip.html(d.errNum.toString())
                            .style("left", d3.pointer(event, window)[0] + "px")
                            .style("top", (d3.pointer(event, window)[1] - margin.top * 0.8)  + "px");
                })

                .on("mouseleave", function() {
                    tooltip.transition()
                                .duration(50)
                                .style("opacity", 0)
                }) */

            const chartTitle = "Gerätefehler von " + data.xDomain[0] + " bis " +
            data.xDomain[data.xDomain.length - 1] + " nach Prioritäten"
            
            svg.selectAll("text").remove()

            svg.selectAll("headline")
                        .data([1])
                        .join(
                            enter => enter.append("text"),
                            update => update,
                            exit => exit.remove()
                        )
                        .attr("x", containerWidth / 2)             
                        .attr("y", margin.top )
                        .attr("text-anchor", "middle")  
                        .style("font-size", "1em")
                        .style("font-weight", "600")
                        .text(chartTitle)

            const tooltip_values = [
                {priority: "low", value: ""},
                {priority: "medium", value: ""},
                {priority: "high", value: ""}]

            svg.selectAll("value-display")
                    .data(data.dataSet)
                    .join(
                        enter => enter.append("text"),
                        update => update,
                        exit => exit.remove()
                    )
                    .attr("x", d => containerWidth / 6 + data.dataSet.indexOf(d) * (containerWidth / 3))             
                    .attr("y", margin.top * 1.5 )
                    .attr("text-anchor", "middle")  
                    .attr("class", "value-display")
                    .style("font-size", "0.75em")
                    .style("font-weight", "600")
                    .style("fill", d => colours[data.dataSet.indexOf(d)].stroke)
                    .text(d => "" + d.priority + ": " + tooltip_values[data.dataSet.indexOf(d)].value)

            // remove old axis-ticks before drawing the new axis
            svg.selectAll("g").remove()

            svg.append("g")
                .call(d3.axisBottom(x))
                .attr("transform", "translate(0, " + (containerHeight - margin.top) + ")")

            svg.append("g")
                .call(d3.axisLeft(y))
                .attr("transform", "translate("+ margin.left + ", 0)")

            // new hover
            let mouseG = svg.append("g")
                                .attr("class", "mouse-over-effects")

            mouseG.append("path")
                        .attr("class", "mouse-line")
                        .style("stroke", "#A9A9A9")
                        .style("stroke-width", 1)
                        .style("opacity", "0")

            //const lines = document.getElementsByClassName('line')
        
            const mousePerLine = mouseG.selectAll(".mouse-per-line")
                                        .data(data.dataSet)
                                        .enter().append("g")
                                        .attr("class", "mouse-per-line")
                                            .append("circle")
                                            .attr("r", 4)
                                            .style("stroke", d => colours[data.dataSet.indexOf(d)].stroke)
                                            .style("fill", "none")
                                            .style("stroke-width", 1)
                                            .style("opacity", 0)

            mouseG.append("svg:rect")
                            .attr("width", chartWidth)
                            .attr("height", chartHeight)
                            .attr("fill", "none")
                            .attr("pointer-events", "all")
                            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
                            .on("mouseout", () => {
                                d3.select(".mouse-line")
                                    .style("opacity", "0")
                                d3.selectAll(".mouse-per-line circle")
                                .style("opacity", "0")
                            })
                            .on('mouseover', () => { // on mouse in show line and circles
                                d3.select(".mouse-line")
                                    .style("opacity", "1")
                                d3.selectAll(".mouse-per-line circle")
                                    .style("opacity", "1")
                            })
                            .on("mousemove", function(event) {
                                const mouse = d3.pointer(event)

                                d3.selectAll(".mouse-per-line")
                                    .attr("transform", function(d) {
                                        const xDate = x.invert(mouse[0] + margin.left)
                                        const bisect = d3.bisector<ErrPerDate, Date>((d, x) => { return new Date(d.date) - x})
                                        let idx = bisect.left(d.data, xDate)
                                        d3.select(".mouse-line")
                                        .attr("d", () => {
                                            let ret = "M"+ x(new Date(d.data[idx].date)) + ", " + (chartHeight + margin.bottom)
                                            ret += " " + x(new Date(d.data[idx].date)) + ", " + (0 + margin.top + margin.bottom)
                                            return ret
                                        })
                                        tooltip_values[data.dataSet.indexOf(d)].value = d.data[idx].errNum
                                        return "translate(" + x(new Date(d.data[idx].date)) + "," + y(d.data[idx].errNum) + ")"
                                    })
                                setTooltipValues((prevState) => {
                                    console.log(prevState)
                                    console.log(tooltip_values)
                                    if (tooltip_values[0].value === prevState[0].value &&
                                        tooltip_values[1].value === prevState[1].value &&
                                        tooltip_values[2].value === prevState[2].value) {
                                        console.log("is the same?")
                                        return tooltip_values
                                    }
                                    else {
                                        console.log("Is totally different!!")
                                        return tooltip_values
                                    }
                                })
                                
                            })
        }
    }, [data])

    React.useEffect(() => {
        console.log("fired")
        const value_displays = document.getElementsByClassName('value-display')
        for (let i = 0; i < value_displays.length; i++) {
            value_displays[i].innerHTML = tooltipValues[i].priority + ": " + tooltipValues[i].value
        }
    }, [tooltipValues])

    React.useEffect(() => {
        if (data) drawChart()
    }, [data])

    React.useEffect(() => {
        setData(errorSpreadData(props.data))
    }, [props])

    return (
        <div className="chart-container">
            <svg ref={lineChart}></svg>
            <div className="tooltip"></div>
        </div>
    )
}

export default MultiLineChart