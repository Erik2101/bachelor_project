import React from "react";
import * as d3 from "d3";
import "./PieChart.css";
import { DeviceData } from "../proto/frontend_pb";
import { PieDataSet, pieReadyData, totalActivityData } from "../util";
import { PieArcDatum } from "d3";

const colours = ["green", "grey"]

const PieChart = (props: {data: Array<DeviceData>}) => {

    const d3Chart = React.useRef(null)

    React.useEffect(() => {
        const data = pieReadyData(totalActivityData(props.data))
        if (data) drawChart(data)
    },[])
        
    function drawChart(input: PieDataSet) {

    const containerWidth = parseInt(d3.select(".pie-chart").style("width"))
    const containerHeight = parseInt(d3.select(".pie-chart").style("height"))
    const margin = {
        top: containerHeight * 0.2, 
        right: containerWidth * 0.1,
        bottom: containerHeight * 0.00,
        left: containerWidth * 0.1
    }

    const size = containerHeight < containerWidth ?
                containerHeight - margin.top - margin.bottom :
                containerWidth - margin.left - margin.right

    const svg = d3.select(d3Chart.current)
                    .attr("width", containerWidth)
                    .attr("height", containerHeight)
                    .attr("viewBox", [-containerWidth / 2, -containerHeight / 2, containerWidth, containerHeight])

    const pie = d3.pie();
    const arcs = pie(input.valueArray);
    console.log(arcs)

    const arc = d3.arc<PieArcDatum<number>>()
                    .innerRadius(size / 4 - 2)
                    .outerRadius(size / 2 - 1);

    svg.append("g")
            .selectAll("path")
            .data(arcs)
            .join("path")
            .attr("d", d => arc(d))
            .attr("fill", (_,i) => colours[i])
    }

    return (
        <div className="pie-chart">
            <svg ref={d3Chart}/>
        </div>
    )
}

export default PieChart