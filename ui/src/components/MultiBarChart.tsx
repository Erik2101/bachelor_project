import React from "react";
import * as d3 from "d3";
import { DeviceData } from "../proto/frontend_pb";
import { Dataset } from "../util";
import "./ChartContainer.css";
import "./MultiBarChart.css";

function MultiBarChart(props : {
    data : Array<DeviceData>
}) {

    const d3Chart = React.useRef(null)
    const [selection, setSelection] = React.useState<string>("default")
    const [data, setData] = React.useState<Array<DeviceUptime>>([])
    const [title, setTitle] = React.useState<string>("XXXXXXXXXXXXXXXXX")
    const [colours, setColours] = React.useState<Array<string>>(["red", "blue", "green"])

    type DeviceUptime = {
        uuid: string,
        data: {
            current: number,
            maintain: number,
            total: number
        }
    }

    type EnsembleDeviceList = {
        ensembleName: string,
        devices: Array<DeviceUptime>
    }

    function handleSelection(event : React.ChangeEvent<HTMLSelectElement>) {
        setSelection(event.target.value)
    }

    function ensembleDeviceUptime(input : Array<DeviceData>) {
        const ensembles : Array<EnsembleDeviceList>= []
        for (const device of input) {
            let devicePushed = false
            if (device.getEnsembleList().length > 1) {
                for (const ensemble of ensembles) {
                    for (const item of ensemble.devices) {
                        if (device.getUuid() === item.uuid) {
                            item.data.current = device.getRuntimecurrent()
                            item.data.maintain = device.getRuntimemaintenance() - item.data.current,
                            item.data.total = device.getRuntimetotal() - device.getRuntimemaintenance(),
                            devicePushed = true 
                        }
                    }
                }
                if (!devicePushed) {
                    const dev : Array<DeviceUptime> = []
                    for (const member of device.getEnsembleList()) {
                        dev.push({
                            uuid: member,
                            data: {
                                total: 0,
                                maintain: 0,
                                current: 0
                            }
                        })
                    }
                    const current = dev[dev.length - 1].data
                    current.current = device.getRuntimecurrent()
                    current.maintain = device.getRuntimemaintenance() - current.current
                    current.total = device.getRuntimetotal() - device.getRuntimemaintenance()
                    ensembles.push({
                        ensembleName: device.getLocation(),
                        devices: dev
                    })
                }
            }
        }
        const sorted_ensembles = ensembles.sort((a, b) => b.ensembleName.localeCompare(a.ensembleName))
        sorted_ensembles.reverse()
        return sorted_ensembles
    }

    function populateSelect(input : Array<EnsembleDeviceList>) {
        const ret = []
        for (const ensemble of input) {
            ret.push(
                <option value={ensemble.ensembleName} key={input.indexOf(ensemble)}>{ensemble.ensembleName}</option>
            )
        }
        return ret
    }

    const drawChart = React.useCallback(() => {
        const containerWidth = parseInt(d3.select(".sub-flex-container").style("width"))
        const containerHeight = parseInt(d3.select(".sub-flex-container").style("height"))
        const margin = {
            top: containerHeight * 0.05,
            right: containerWidth * 0.1,
            bottom: containerHeight * 0.05,
            left: containerWidth * 0.1
        }
        const chartWidth = containerWidth - margin.left - margin.right
        const chartHeight = containerHeight - margin.top - margin.bottom
    
        const svg = d3.select(d3Chart.current)
                        .attr("width", containerWidth)
                        .attr("height", containerHeight)
                        .attr("viewBox", [0, 0, containerWidth, containerHeight])
        if (data) {
            
            const y = d3.scaleBand()
                            .domain(data.map(function (d) {return (d.uuid.split("-")[0] + "...")}))
                            .range([0, chartHeight])
                            .padding(0.2)

            svg.append("g")
                    .call(d3.axisLeft(y))
                    .attr("transform", "translate(" + margin.left + ", 0)") 

            let xMax = 0
            for (const device of data) {
                const temp_total = device.data.total + device.data.maintain + device.data.current
                if (temp_total > xMax) xMax = temp_total 
            }

            const x = d3.scaleLinear()
                            .domain([0, xMax])
                            .range([0, chartWidth])
                            
            svg.append("g")
                    .call(d3.axisBottom(x))
                    .attr("transform", "translate(" + margin.left + ", " + chartHeight + ")") 

            const subgroups = ["current", "maintain", "total"]

            const colour = d3.scaleOrdinal()
                                .domain(subgroups)
                                .range(["#2B8A3C", "#B1E6BE", "#969997"])

            const iterable_data = []
            for (const item of data) {
                iterable_data.push(item.data)
            }
            const stacked_data = d3.stack().keys(subgroups)(iterable_data)

            svg
                .append("g")
                .selectAll("g")
                .data(stacked_data)
                .enter().append("g")
                    .attr("fill", (d) => colour(d.key))
                    .selectAll("rect")
                        .data(function(d) {return d})
                        .enter().append("rect")
                            .attr("y", (_, i) =>  (i + 1) * (y.step() - y.bandwidth()) + i * y.bandwidth())
                            .attr("x", (d) => x(d[0]) + margin.left)
                            .attr("width", (d) => x(d[1]) - x(d[0]))
                            .attr("height", y.bandwidth())
                            .attr("stroke", "#424242")

        } else {
            svg.selectAll("g").remove()
        }
    }, [data])

    React.useEffect(() => {
        if (data) drawChart()
    }, [data])

    React.useEffect(() => {
        setTitle("Geräte einer Klasse nach Stationen")
        const temp = ensembleDeviceUptime(props.data)
        for (const ensemble of temp) {
            if (selection === ensemble.ensembleName) {
                setData(ensemble.devices)
            }
        }
        if (selection === "default") {
            setData([])
        }
    }, [props, selection])

    return (
        <div className="chart-container-select">
            <div className="select-container">
                <label className="select-label">Ensemble:</label>
                <select className="ensemble-select" onChange={handleSelection}>
                    <option>-Ensemble wählen:-</option>
                    {populateSelect(ensembleDeviceUptime(props.data))}
                </select>
            </div>
            <h3 className="chart-title">{title}</h3>
            <div className="sub-flex-container">
                {selection !== "default" && <svg ref={d3Chart}/>}
            </div>
        </div>
    )
}

export default MultiBarChart