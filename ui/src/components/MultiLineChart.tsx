import React from "react";
import * as d3 from "d3";
import "./ChartContainer.css"
import { errorSpreadData, ErrPerDate, ErrPerPrioPerDate, ErrSpreadChartData, PriorityValuePair } from "../util";
import { DeviceData } from "../proto/frontend_pb";
import { range } from "d3";
import { theme } from "../theme";

function MultiLineChart (props: {data : Array<DeviceData>}) {

    const [data, setData] = React.useState<ErrSpreadChartData>()
    const [tooltipValues, setTooltipValues] = React.useState<ReadonlyArray<PriorityValuePair>>([
        {priority: "Niedrig", value: ""},
        {priority: "Medium", value: ""},
        {priority: "Hoch", value: ""}])

    const lineChart = React.useRef(null)

    function makeHeaderDate(input : string) : string {
        const temp = new Date(input)
        function pad(s : number) { return s > 9 ? s : "0" + s}
        return [pad(temp.getDate()), pad(temp.getMonth() + 1), temp.getFullYear()].join(".")
    }

    const drawChart = React.useCallback(() => {

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

        if(data && data.xDomain.length > 0) {
            let domain : Array<Date> = []   
            for (const date of data.xDomain) {
                domain.push(new Date(date))
            }
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
                {fill: theme.low_prio},
                {fill: theme.medium_prio},
                {fill: theme.high_prio}
            ]

            const justData = []
            const circleData = []

            for (const j in range (data.dataSet.length)) {
                
                justData.push(data.dataSet[j].data)
                for (const i in range(domain.length)) {
                    circleData.push(data.dataSet[j].data[i])
                }
            }
            const lineFunction = d3.line<ErrPerDate>()
                                    .x((d) => { /* console.log(x(new Date(d.date))); */ return x(new Date(d.date))})
                                    .y((d) => y(d.errNum))

            svg.select(".grid").remove()
                                
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
                .attr("stroke", (_, i) => colours[i].fill)
                .attr("stroke-width", 2)
                .attr("class", "line")

            const chartTitle = "Gerätefehler von " + makeHeaderDate(data.xDomain[0]) + " bis " +
            makeHeaderDate(data.xDomain[data.xDomain.length - 1]) + " nach Prioritäten"
            
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
                        .style("font-size", "1.2em")
                        .style("font-weight", "600")
                        .text(chartTitle)

            let tooltip_values : ReadonlyArray<PriorityValuePair> = [
                {priority: "Niedrig", value: ""},
                {priority: "Medium", value: ""},
                {priority: "Hoch", value: ""}]

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
                    .style("font-size", "1em")
                    .style("font-weight", "600")
                    .style("fill", d => colours[data.dataSet.indexOf(d)].fill)
                    .text(d => "" + d.priority + ": " + tooltip_values[data.dataSet.indexOf(d)].value)

            // remove old axis-ticks before drawing the new axis
            svg.selectAll("g").remove()

            let xAxis
            if (domain.length < chartWidth / 50) {
                xAxis = d3.axisBottom<Date>(x)
                .tickFormat(d3.timeFormat("%d.%m"))
                .tickValues(domain)
            } else {
                xAxis = d3.axisBottom<Date>(x)
                .tickFormat(d3.timeFormat("%d.%m"))
            }

            svg.append("g")
                .call(xAxis)
                .attr("transform", "translate(0, " + (containerHeight - margin.top) + ")")
                .style("font-size", "14px")

            svg.append("g")
                .call(d3.axisLeft(y))
                .attr("transform", "translate("+ margin.left + ", 0)")
                .style("font-size", "14px")

            // new hover
            let mouseG = svg.append("g")
                                .attr("class", "mouse-over-effects")

            mouseG.append("path")
                        .attr("class", "mouse-line")
                        .style("stroke", "#A9A9A9")
                        .style("stroke-width", 1)
                        .style("opacity", "0")
        
            const mousePerLine = mouseG.selectAll(".mouse-per-line")
                                        .data(data.dataSet)
                                        .enter().append("g")
                                        .attr("class", "mouse-per-line")
                                            .append("circle")
                                            .attr("r", 4)
                                            .style("stroke", d => colours[data.dataSet.indexOf(d)].fill)
                                            .style("fill", "none")
                                            .style("stroke-width", 1)
                                            .style("opacity", 0)

            mouseG.append("svg:rect")
                            .attr("width", chartWidth)
                            .attr("height", chartHeight - margin.top)
                            .attr("fill", "none")
                            .attr("pointer-events", "all")
                            .attr("transform", "translate(" + margin.left + ", " + 2 * margin.top + ")")
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
                                        const b = d as ErrPerPrioPerDate
                                        const xDate = x.invert(mouse[0] + margin.left)
                                        const bisect = d3.bisector<ErrPerDate, Date>((d, x) => { return new Date(d.date).getTime() - x.getTime()})
                                        let idx = bisect.left(b.data, xDate)
                                        d3.select(".mouse-line")
                                        .attr("d", () => {
                                            let ret = "M" + x(new Date(b.data[idx].date)) + ", " + (chartHeight + margin.bottom)
                                            ret += " " + x(new Date(b.data[idx].date)) + ", " + (0 + margin.top + margin.bottom)
                                            return ret
                                        })
                                        if (b.data[idx].errNum.toString() !== tooltip_values[data.dataSet.indexOf(b)].value) {
                                            tooltip_values = [...tooltip_values]
                                            tooltip_values[data.dataSet.indexOf(b)].value = b.data[idx].errNum.toString()
                                        }
                                        return "translate(" + x(new Date(b.data[idx].date)) + "," + y(b.data[idx].errNum) + ")"
                                    })
                                setTooltipValues((prevState) => {
                                    if (tooltip_values !== prevState) {
                                        return tooltip_values
                                    }
                                    return prevState
                                })
                            })

            const hori_gridlines = d3.axisLeft(y)
                .tickFormat( _ => "")
                .tickSize(-chartWidth)

            svg.insert("g", "path:first-child")
                .attr("class", "grid")
                .call(hori_gridlines)
                    .attr("transform", "translate(" + margin.left + "," + 0 + ")")
                    .style("stroke", theme.app_bg)
                    .attr("opacity", 0.5)  
                    .attr("stroke-width", 0.5)              
            
        } else {
            svg.selectAll("g").remove()
            svg.selectAll("path").remove()
            svg.selectAll("text").remove()

            svg.selectAll("disclaimer")
            .data([1])
            .join(
                enter => enter.append("text"),
                update => update,
                exit => exit.remove()
            )
            .attr("x", containerWidth / 2)             
            .attr("y", containerHeight / 2 )
            .attr("text-anchor", "middle")  
            .style("font-size", "1.2em")
            .style("font-weight", "600")
            .style("fill", "green")
            .text("Es wurden keine Gerätefehler für die übergebenen Geräte gefunden.")
        }
    }, [data])

    React.useEffect(() => {
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