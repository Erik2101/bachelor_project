import React from "react";
import * as d3 from "d3";
import "./BarChart.css";
import { DeviceData } from "../proto/frontend_pb";
import { totalActivityData , totalActivityData2} from "../util";
import { Dataset } from "../util";

const BarChart = (props: {
    "typeId": number,
    "data": Array<DeviceData>,
}) => {

    const d3Chart = React.useRef(null)

    const update = React.useRef(false)

    function drawChart(data: Array<Dataset>) {

        const containerWidth = parseInt(d3.select(".bar-chart").style("width"))
        const containerHeight = parseInt(d3.select(".bar-chart").style("height"))
        const margin = {
            top: containerHeight * 0.2, 
            right: containerWidth * 0.1,
            bottom: containerHeight * 0.00,
            left: containerWidth * 0.1
        }
        const chartWidth = containerWidth - margin.left - margin.right
        const chartHeight = containerHeight - margin.top - margin.bottom

        const chartTitle = "Barchart title dummy"
    
        const svg = d3.select(d3Chart.current)
                        .attr("width", containerWidth)
                        .attr("height", containerHeight)
                        .attr("viewBox", [-containerWidth / 2, -containerHeight / 2, containerWidth, containerHeight])


        const x = d3.scaleBand()
                    .domain(data.map(item => item.sectionCaption))
                    .range([margin.left, chartWidth + margin.right])
                    .padding(0.4)

        svg.append("g")
            .attr("transform", "translate(" + (-chartWidth /2 - margin.left) +  ", " + chartHeight/2 + ")")
            .call(d3.axisBottom(x).tickFormat(null).tickSizeOuter(0))

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
                    .range([chartHeight , margin.top / 2])

        svg.append("g")
            .attr("transform", "translate(" + -chartWidth / 2 + "," + -chartHeight/2 + ")")
            .call(d3.axisLeft(y))

        svg.append("g")
            .attr("fill","#1F1B29")
            .selectAll("rect")
            .data(data)
            .join("rect")
                .attr("x", (d,i) => margin.left + (i + 1) * (x.step() - x.bandwidth()) + i * x.bandwidth())
                .attr("y", d => y(d.sectionValue))
                .attr("height", d => y(0)-y(d.sectionValue))
                .attr("width", x.bandwidth())
                .attr("transform", "translate(" + (-chartWidth / 2 - margin.left) + "," + -chartHeight/2 + ")")

        svg.append("text")
            .attr("x", (containerWidth / 2))             
            .attr("y", 0 )
            .attr("transform", "translate(" + (-chartWidth / 2 - margin.left) + ", " + -chartHeight / 2 +")")
            .attr("text-anchor", "middle")  
            .style("font-size", "1em")
            .style("font-weight", "600")
            .text(chartTitle)
    }

   /*  React.useEffect(() => {
        function watchDimensions() {
            setDimensions({
                width: window.parent.innerWidth,
                height: window.parent.innerHeight
            })
            if(update.current) {
                d3.selectAll("g").remove()
            } else {
                update.current = true
            }
        }
        window.parent.addEventListener("resize", watchDimensions)
        let data
        if(props.typeId === 1) data = totalActivityData(props.data)
        if(props.typeId === 2) data = totalActivityData2(props.data)

        if (data) drawChart(data)
        return () => {window.parent.removeEventListener("resize", watchDimensions)}
    }, [dimensions] ) */

    React.useEffect(() => {
        let data
        if(props.typeId === 1) data = totalActivityData(props.data)
        if(props.typeId === 2) data = totalActivityData2(props.data)

        if (data) drawChart(data)
    },[])

    return (
        <div className="bar-chart">
            <svg ref={d3Chart}></svg>
        </div>
    )
}

export default BarChart