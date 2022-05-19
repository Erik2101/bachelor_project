import React from "react";
import * as d3 from "d3";
import "./PieChart.css";
import "./ChartContainer.css";
import { DeviceData } from "../proto/frontend_pb";
import { PieDataSet, pieReadyData, totalActivityData } from "../util";
import { PieArcDatum } from "d3";

const colours = ["#2B8A3C", "#969997"]

function PieChart (props: {data: Array<DeviceData>}) {

    const d3Chart = React.useRef(null)
    const [data, setData] = React.useState<PieDataSet>()

    React.useEffect(() => {
        if (data) drawChart()
    },[data])

    React.useEffect(() => {
        setData(pieReadyData(totalActivityData(props.data)))
        return () => {};
    }, [props])
        
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
    const size = containerHeight < containerWidth ? chartHeight : chartWidth
                

    const chartTitle = "Aktivitätstatus aller bekannten Geräte"

    const svg = d3.select(d3Chart.current)
                    .attr("width", containerWidth)
                    .attr("height", containerHeight)
                    .attr("viewBox", [-containerWidth / 2, -containerHeight / 2, containerWidth, containerHeight])

    const pie = d3.pie();
    if (data) {
        const arcs = pie(data.valueArray)

        const arc = d3.arc<PieArcDatum<number>>()
                        .innerRadius(size / 4 - 2)
                        .outerRadius(size / 2 - 1);

        const tooltip = d3.select(".tooltip")
                            .style("opacity", 0);

        svg.selectAll("g")
                .data(arcs)
                .join(
                    (enter) => {
                        return enter
                                .append("g")
                                .call((g) =>
                                    g
                                        .append("path")
                                        .attr("d", d => arc(d))
                                        .attr("fill", (_,i) => colours[i])
                                        .attr("fill-opacity", 0.6)
                                        .attr("transform", "translate(0, " + margin.top / 2 + ")")

                                        .on("mousemove", function (event, d) {
                                            d3.select(this).transition()
                                                            .duration(50)
                                                            .attr("fill-opacity", 1);
                                                        
                                            tooltip.transition()
                                                    .duration(50)
                                                    .style("opacity", 1);
                        
                                            tooltip.html(d.data.toString())
                                                    .style("left", (d3.pointer(event, window)[0] - margin.left * 0.75) + "px")
                                                    .style("top", (d3.pointer(event, window)[1] - margin.top * 0.75)  + "px");           
                                        })
                        
                                        .on("mouseout", function () {
                                            d3.select(this).transition()
                                                            .duration(50)
                                                            .attr("fill-opacity", 0.6);
                                                        
                                            tooltip.transition()
                                                    .duration(50)
                                                    .style("opacity", 0);
                                        })
                                )
                    },
                    (update) =>
                        update
                            .call((g) => 
                                g
                                    .select("path")
                                        .transition()
                                            .duration(1)
                                            .attr("d", d => arc(d))
                            ),
                    (exit) =>
                        exit.call((g) => g.transition().duration(0).style("opacity", 0).remove())
                )               

        }

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
                
    }, [data])

    return (
        <div className="chart-container">
            <svg ref={d3Chart}/>
            <div className="tooltip"></div>
        </div>
    )
}

export default PieChart