import React from "react";
import * as d3 from "d3";
import "./ChartContainer.css";
import { DeviceData } from "../proto/frontend_pb";
import { totalActivityData , totalActivityData2} from "../util";
import { Dataset } from "../util";

function BarChart(props: {
    "typeId": number,
    "data": Array<DeviceData>,
}) {

    const d3Chart = React.useRef(null)
    const [data, setData] = React.useState<Array<Dataset>>([])
    const [title, setTitle] = React.useState<string>("XXXXXXXXXXXXXXXXX")
    const [colours, setColours] = React.useState<Array<string>>(["black", "grey", "white"])

    const drawChart = React.useCallback(() => {
        const containerWidth = parseInt(d3.select(".chart-container").style("width"))
        const containerHeight = parseInt(d3.select(".chart-container").style("height"))
        const margin = {
            top: containerHeight * 0.1,
            right: containerWidth * 0.1,
            bottom: containerHeight * 0.01,
            left: containerWidth * 0.1
        }
        const chartWidth = containerWidth - margin.left - margin.right
        const chartHeight = containerHeight - margin.top - margin.bottom
    
        const svg = d3.select(d3Chart.current)
                        .attr("width", containerWidth)
                        .attr("height", containerHeight)
                        .attr("viewBox", [0, 0, containerWidth, containerHeight])


        const x = d3.scaleBand()
                    .domain(data.map(item => item.sectionCaption))
                    .range([margin.left, chartWidth + margin.right])
                    .padding(0.4)

        function makeValueIterable() {
            const ret = []
            if(!data) return []
            for(let i = 0; i < data.length; i++) {
                ret.push(data[i].sectionValue)
            }
            return (
                ret
            )
        } 
        
        const yMax = d3.max(makeValueIterable())
        if(!yMax) return

        const y = d3.scaleLinear()
                    .domain([0, yMax])
                    .range([chartHeight + margin.bottom , 2 * margin.top])

        svg
            .selectAll("g")
            .data(data)
            .join(
                (enter) => {
                    return enter
                            .append("g")
                            .call((g) =>
                            g
                                .append("rect")
                                .attr("x", (_,i) => margin.left + (i + 1) * (x.step() - x.bandwidth()) + i * x.bandwidth())
                                .attr("y", d => y(d.sectionValue))
                                .attr("height", d => y(0)-y(d.sectionValue))
                                .attr("width", x.bandwidth())
                                .attr("fill", (_, i) => colours[i])
                                .attr("transform", "translate(0, 0)")
                            )
                },
                (update) =>
                    update
                        .call((g) =>
                            g
                                .select("rect")
                                .transition()
                                    .duration(1)
                                    .attr("x", (_,i) => margin.left + (i + 1) * (x.step() - x.bandwidth()) + i * x.bandwidth())
                                    .attr("width", x.bandwidth())
                                .transition()
                                    .duration(1000)
                                    .attr("y", d => y(d.sectionValue))
                                    .attr("height", d => y(0)-y(d.sectionValue))
                        ),
                (exit) =>
                    exit.call((g) => 
                        g.transition().duration(0).style("opacity", 0).remove()
                    )
            );

        svg.selectAll("text")
                .data([1])
                .join(
                    enter => enter.append("text"),
                    update => update,
                    exit => exit.remove()
                )
                .attr("x", (containerWidth / 2))             
                .attr("y", margin.top )
                .attr("text-anchor", "middle")  
                .style("font-size", "1em")
                .style("font-weight", "600")
                .text(title)
                            
        svg.append("g")
            .call(d3.axisBottom(x).tickFormat(null).tickSizeOuter(0))
            .attr("transform", "translate(0, " + (containerHeight - margin.top) + ")")

        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("transform", "translate(" + margin.left + ", 0)") 
                            
    }, [data, title, colours])

    React.useEffect(() => {
        if(props.typeId === 1) {
            setData(totalActivityData(props.data)) 
            setColours(["#2B8A3C", "#969997"])
            setTitle("Aktivitätstatus aller bekannten Geräte")
        }
        else if(props.typeId === 2) {
            setData(totalActivityData2(props.data))
            setColours(["#2B8A3C", "#B1E6BE", "#969997"])
            setTitle("Aktivitätsstatus und Einsatzbereitschaft aller bekannten Geräte")
        }
        return () => {};
    },[props])

    React.useEffect(() => {
        if (data) drawChart()
    }, [data])

    return (
        <div className="chart-container">
            <svg ref={d3Chart}></svg>
        </div>
    )
}

export default BarChart