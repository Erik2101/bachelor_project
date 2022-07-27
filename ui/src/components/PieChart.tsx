import React from "react";
import * as d3 from "d3";
import "./PieChart.css";
import "./ChartContainer.css";
import { DeviceData } from "../proto/frontend_pb";
import { CaptionColourPair, devicesOfAClassPerStation, PieDataSet, pieReadyData, stationColours, totalActivityData, totalActivityData2 } from "../util";
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
        if (props.typeId === 3) {
            setData(pieReadyData(totalActivityData2(props.data)))
            setTitle("Aktivitätstatus und Einsatzbereitschaft aller bekannten Geräte")
            setColours([
                {caption: "Aktiv", colour: theme.active},
                {caption: "Bereit (Inaktiv)", colour: theme.medium_prio},
                {caption: "Nicht Bereit", colour: theme.high_prio}])
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

        const containerWidth = props.typeId === 1 || props.typeId === 3 ? 
                                parseInt(d3.select(".chart-container").style("width")) :
                                parseInt(d3.select(".sub-flex-container").style("width"))
        const containerHeight = props.typeId === 1 || props.typeId === 3 ?
                                parseInt(d3.select(".chart-container").style("height")) :
                                parseInt(d3.select(".sub-flex-container").style("height"))

        const margin = props.typeId === 1 || props.typeId === 3 ? 
            {
                top: containerHeight * 0.1, 
                right: containerWidth * 0.05,
                bottom: containerHeight * 0.1,
                left: containerWidth * 0.05
            } :
            {
                top: 0, 
                right: containerWidth * 0.05,
                bottom: containerHeight * 0.05,
                left: containerWidth * 0.05
            }

        const chartWidth = (containerWidth - margin.right - margin.left) * 0.6
        const chartHeight = containerHeight - margin.top - margin.bottom
        const size = containerHeight < chartWidth ? chartHeight : chartWidth

        const size_reg = containerWidth < 600 ? 0.75 : 1 

        const svg = d3.select(d3Chart.current)
                        .attr("width", chartWidth)
                        .attr("height", containerHeight)
                        .attr("viewBox", [0, 0, chartWidth, containerHeight])

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
                                            .attr("transform", "translate(" + (chartWidth / 2) + ", " + (containerHeight / 2) + ")")

                                            .on("mouseover", function(event, d) {
                                                d3.select(this).transition()
                                                .duration(50)
                                                .attr("fill-opacity", 0.75);

                                                tooltip
                                                        .html(colours[d.index].caption + "<br>" + d.data.toString())
                                                        .transition()
                                                        .duration(50)
                                                        .style("opacity", 1);
                                            })

                                            .on("mousemove", function (event) {
                                                tooltip
                                                        .style("left", (d3.pointer(event, window)[0] - 2 * margin.left) + "px")
                                                        .style("top", (d3.pointer(event, window)[1] -  1.5 * margin.top)  + "px");           
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
                                                .duration(0)
                                                .attr("d", d => arc(d as PieArcDatum<number>))
                                                .attr("transform", "translate(" + (chartWidth / 2) + ", " + (containerHeight / 2) + ")")
                                ),
                        (exit) =>
                            exit.call((g) => g.transition().duration(0).style("opacity", 0).remove())
                    )               

        }
                
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
    if (props.typeId === 1 || props.typeId === 3) {
        final_return = (
            <div className="chart-container">
                <h3 className="pie-chart-title">{title}</h3>
                <svg ref={d3Chart}/>
                <div className="tooltip"></div>
            </div>
        )
    } else {
        if (props.typeId === 2) {
            final_return = (
            <div className="chart-container-select">
                <div className="select-container">
                    <label className="select-label">Geräteklasse:</label>
                    <select className="class-select" onChange={handleClassChange}>
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
        } else {
            final_return = (
                <div>default return exit.</div>
            )
        }
    }

    return final_return 
}

export default PieChart