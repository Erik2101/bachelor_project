import React from "react";
import * as d3 from "d3";
import "./PieChart.css";
import "./ChartContainer.css";
import { DeviceData } from "../proto/frontend_pb";
import { CaptionColourPair, devicesOfAClassPerStation, PieDataSet, pieReadyData, stationColours, totalActivityData } from "../util";
import { PieArcDatum } from "d3";
import { theme } from "../theme";

function PieChart (props: {
    data: Array<DeviceData>,
    typeId: number
}) {

    const d3Chart = React.useRef(null)
    const [data, setData] = React.useState<PieDataSet>()
    const [title, setTitle] = React.useState<string>("XXXXXXXXXXXXXXXXX")
    const [colours, setColours] = React.useState<Array<CaptionColourPair>>([{caption: "default", colour: "black"}])
    const [selection, setSelection] = React.useState<string>("default")

    React.useEffect(() => {
        if (data) drawChart()
    },[data])

    React.useEffect(() => {
        if (props.typeId === 1) {
            setData(pieReadyData(totalActivityData(props.data)))
            setTitle("Aktivitätstatus aller bekannten Geräte")
            setColours([
                {caption: "Aktiv", colour: theme.active},
                {caption: "Inaktiv", colour: theme.inactive}])
        }
        if (props.typeId === 2) {
            setTitle("Anzahl der Geräte einer Klasse pro Station")
            setColours(stationColours(props.data))
        }
        return () => {};
    }, [props])

    function handleClassChange(event : React.ChangeEvent<HTMLSelectElement>) {
        setSelection(event.target.value)
    }

    React.useEffect(() => {
        if (selection !== "default") {
            const gathered_data = devicesOfAClassPerStation(props.data)
            for (const item of gathered_data) {
                if (selection === item.class) {
                    setData(pieReadyData(item.devicesPerStation))
                }
            }
        }
    }, [selection, props])
        
    const drawChart = React.useCallback(() => {

        const containerWidth = props.typeId === 1 ? 
                                parseInt(d3.select(".chart-container").style("width")) :
                                parseInt(d3.select(".sub-flex-container").style("width"))
        const containerHeight = props.typeId === 1 ?
                                parseInt(d3.select(".chart-container").style("height")) :
                                parseInt(d3.select(".sub-flex-container").style("height"))
        const margin = props.typeId === 1 ? 
            {
                top: containerHeight * 0.1, 
                right: containerWidth * 0.1,
                bottom: containerHeight * 0.1,
                left: containerWidth * 0.1
            } :
            {
                top: 0, 
                right: containerWidth * 0.05,
                bottom: containerHeight * 0.05,
                left: containerWidth * 0.05
            }

        const chartWidth = containerWidth - margin.left - margin.right
        const chartHeight = containerHeight - margin.top - margin.bottom
        const size = containerHeight < containerWidth ? chartHeight : chartWidth

        const size_reg = containerWidth < 600 ? 0.75 : 1 

        const legend_height = 20 * size_reg
        const legend_spacing = 5 

        const svg = d3.select(d3Chart.current)
                        .attr("width", containerWidth)
                        .attr("height", containerHeight)
                        .attr("viewBox", [0, 0, containerWidth, containerHeight])

        const pie = d3.pie()
                        .sort(null)

        if (data) {
            const arcs = pie(data.valueArray)

            const arc = d3.arc<PieArcDatum<number>>()
                            .innerRadius((size * size_reg) / 4 - 2)
                            .outerRadius((size * size_reg) / 2 - 1)

            const tooltip = d3.select(".tooltip")
                                .style("opacity", 0)
            
            svg.selectAll("g")
                    .data(arcs)
                    .join(
                        (enter) => {
                            return enter
                                    .append("g")
                                    .call((g) =>
                                        g
                                            .append("path")
                                            .attr("d", d => arc(d as PieArcDatum<number>))
                                            .attr("fill", (_,i) => colours[i].colour)
                                            .attr("fill-opacity", 1)
                                            .attr("transform", "translate(" + (containerWidth / 4 + 1.75 * (containerWidth * 0.05)) + ", " + (containerHeight / 2 + margin.top / 2) + ")")

                                            .on("mouseover", function(event, d) {
                                                d3.select(this).transition()
                                                .duration(50)
                                                .attr("fill-opacity", 0.75);
                                            
                                                tooltip
                                                        .html(d.data.toString())
                                                        .transition()
                                                        .duration(50)
                                                        .style("opacity", 1);
                                            })

                                            .on("mousemove", function (event) {
                                                tooltip
                                                // turboscuffed btw.
                                                        .style("left", (d3.pointer(event, window)[0] - margin.left * 0.75 * props.typeId) + "px")
                                                        .style("top", (d3.pointer(event, window)[1] - margin.bottom * 0.75 * props.typeId)  + "px");           
                                            })
                            
                                            .on("mouseout", function () {
                                                d3.select(this).transition()
                                                                .duration(50)
                                                                .attr("fill-opacity", 1);
                                                            
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
                                                .attr("d", d => arc(d as PieArcDatum<number>))
                                                .attr("transform", "translate(" + (containerWidth / 4 + 1.75 * (containerWidth * 0.05)) + ", " + (containerHeight / 2 + margin.top / 2) + ")")
                                ),
                        (exit) =>
                            exit.call((g) => g.transition().duration(0).style("opacity", 0).remove())
                    )               

        }

        if (props.typeId === 1) {
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
        }

        const legend = svg.selectAll("legend")
                            .data(colours)
                            .join(
                                enter => enter.append("g"),
                                update => update.call((g) => g
                                                                .attr("transform", (d, i) => {
                                                                    const height = legend_height + legend_spacing
                                                                    const offset = height * colours.length / 2
                                                                    const horizontal = legend_height
                                                                    const vertical = i * height - offset
                                    
                                                                    return "translate(" + ( horizontal + (chartWidth) - (containerWidth * 0.1) ) + ", " + (vertical +  margin.top + containerHeight / 2) + ")"
                                                                })
                                ),
                                exit => exit.remove()
                            )
                            .attr("transform", (d, i) => {
                                const height = legend_height + legend_spacing
                                const offset = height * colours.length / 2
                                const horizontal = legend_height
                                const vertical = i * height - offset

                                return "translate(" + ( horizontal + (chartWidth) - (containerWidth * 0.1) ) + ", " + (vertical +  margin.top + containerHeight / 2) + ")"
                            })

        legend.append("rect")
            .attr("width", legend_height)
            .attr("height", legend_height)
            .style("fill", d => d.colour)
                                
        legend.append("text")
                    .attr("x", legend_height + legend_spacing)
                    .attr("y", legend_height - legend_spacing)
                    .text(d => d.caption)
                    .style("font-size", 16 * size_reg)
                
    }, [data])

    function populateSelect(input: Array<DeviceData>) {
        let classes : Array<string> = []
        for (const device of input) {
            const target_class = device.getClasses()
            let knownClass = false
            for (const member of classes) {
                if (member === target_class) {
                    knownClass = true
                }
            }
            if (!knownClass) classes.push(target_class)
        }
        const sorted_classes = classes.sort((a, b) => b.localeCompare(a))
        sorted_classes.reverse()
        let ret = []
        for (const member of classes) {
            ret.push(
                <option value={member} key={ret.length}>{member}</option>
            )
        }
        return ret
    }

    let final_return
    if (props.typeId === 1) {
        final_return = (
            <div className="chart-container">
                <svg ref={d3Chart}/>
                <div className="tooltip"></div>
            </div>
        )
    } else {
        if (props.typeId === 2) {
            final_return = (
            <div className="chart-container-select">
                <div className="select-container">
                    <label className="select-label">Station:</label>
                    <select className="class-select" onChange={handleClassChange}>
                        <option value="default">-Station wählen:-</option>
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
        } else {
            final_return = (
                <div>default return exit.</div>
            )
        }
    }

    return final_return 
}

export default PieChart