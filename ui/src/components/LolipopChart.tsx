import React from "react";
import * as d3 from "d3";
import { DeviceData } from "../proto/frontend_pb";
import "./ChartContainer.css";
import { theme } from "../theme";
import { Dataset, devicesOfAClassPerStation, populateSelect } from "../util";

function LolipopChart(props : {
    data : Array<DeviceData>
}) {

    const d3Chart = React.useRef(null)
    const [selection, setSelection] = React.useState<string>("default")
    const [title, setTitle] = React.useState<string>("default title")
    const [data, setData] = React.useState<Array<Dataset>>()

    React.useEffect(() => {
        updateEnsList()
    }, [props])

    function handleSelection(event : React.ChangeEvent<HTMLSelectElement>) {
        setSelection(event.target.value)
    }

    function updateEnsList() {
        const target = document.getElementById("device-class-select") as HTMLSelectElement
        if (target) {
            setSelection(target.value)
        } 
    }

    React.useEffect(() => {
        setTitle("Anzahl der Geräte einer Klasse pro Station")
        if (selection !== "default") {
            const gathered_data = devicesOfAClassPerStation(props.data)
            for (const item of gathered_data) {
                if (selection === item.class) {
                    setData(item.devicesPerStation)
                }
            }
        }
    }, [selection, props])

    const drawChart = React.useCallback(() => {

        const containerWidth = parseInt(d3.select(".sub-flex-container").style("width"))
        const containerHeight = parseInt(d3.select(".sub-flex-container").style("height"))
        const margin = {
            top: containerHeight * 0.05,
            right: containerWidth * 0.05,
            bottom: containerHeight * 0.05,
            left: containerWidth * 0.10
        }
        const chartWidth = containerWidth - margin.left - margin.right
        const chartHeight = containerHeight - margin.top - margin.bottom
    
        const svg = d3.select(d3Chart.current)
                        .attr("width", containerWidth)
                        .attr("height", containerHeight)
                        .attr("viewBox", [0, 0, containerWidth, containerHeight])

        if(data) {
            const sorted_data = data.sort((a, b) => {return b.sectionValue - a.sectionValue})
            
            const y = d3.scaleBand()
                            .range([0, chartHeight])
                            .domain(sorted_data.map( (d) => {return d.sectionCaption}))
                            .padding(1)

            let xMax = 0
            for (const section of sorted_data) {
                if (section.sectionValue > xMax) { xMax = section.sectionValue }
            }

            const x = d3.scaleLinear()
                            .range([0, chartWidth])
                            .domain([0, xMax])
                            .nice()

            svg.selectAll("line")
                    .data(sorted_data)
                    .join(
                        enter => enter.append("line"),
                        update => update,
                        (exit) => 
                            exit.call((line) =>
                                line.transition().duration(0).style("opacity", 0).remove())
                    )
                    .attr("x1", (d) => { return (x(d.sectionValue) + margin.left) })
                    .attr("x2", x(0) + margin.left)
                    .attr("y1", (d) => { return y(d.sectionCaption)! })
                    .attr("y2", (d) => { return y(d.sectionCaption)! })
                    .attr("stroke", "grey")

            svg.selectAll("circle")
                    .data(sorted_data)
                    .join(
                        enter => enter.append("circle"),
                        update => update,
                        (exit) => 
                            exit.call((circle) => 
                                circle.transition().duration(0).style("opacity", 0).remove())
                    )
                    .attr("cx", (d) => { return (x(d.sectionValue) + margin.left) })
                    .attr("cy", (d) => { return y(d.sectionCaption)! })
                    .attr("r", "5")
                    .style("fill", theme.blue4)
                    .attr("stroke", "black")

            svg.selectAll("g").remove()
            
            svg.append("g")
                .call(d3.axisLeft(y))
                .attr("transform", "translate(" + margin.left + ", 0)")
                .style("font-size", "14px")

            svg.append("g")
                .call(d3.axisBottom(x))
                .attr("transform", "translate(" + margin.left + ", " + chartHeight + ")")
                .style("font-size", "14px")
        }          
    }, [data])

    React.useEffect(() => {
        if (data) drawChart()
    }, [data, drawChart])

    return (
        <div className="chart-container-select">
            <div className="select-container">
                <label className="select-label">Geräteklasse:</label>
                <select className="device-class-select" id="device-class-select" onChange={handleSelection}>
                    <option value="default">-Geräteklasse wählen:-</option>
                    {populateSelect(props.data)}
                </select>
            </div>
            <h3 className="chart-title">{title}</h3>
            <div className="sub-flex-container">
                {selection !== "default" && <svg ref={d3Chart}/>}
            </div>
            <div className="tooltip"></div>
        </div>
    )
}

export default LolipopChart