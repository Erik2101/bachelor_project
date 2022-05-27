import React from "react";
import * as d3 from "d3";
import { DeviceData } from "../proto/frontend_pb";
import { Dataset } from "../util";
import "./ChartContainer.css";

function MultiBarChart(props : {
    data : Array<DeviceData>
}) {

    console.log(ensembleDeviceUptime(props.data))

    const d3Chart = React.useRef(null)
    const [data, setData] = React.useState<Array<Dataset>>([])
    const [title, setTitle] = React.useState<string>("XXXXXXXXXXXXXXXXX")
    const [colours, setColours] = React.useState<Array<string>>(["red", "blue", "green"])

    type DeviceUptime = {
        uuid: string,
        data: Array<number>
    }

    type EnsembleDeviceList = {
        ensembleName: string,
        devices: Array<DeviceUptime>
    }

    function ensembleDeviceUptime(input : Array<DeviceData>) {
        const ensembles : Array<EnsembleDeviceList>= []
        for (const device of input) {
            let devicePushed = false
            if (device.getEnsembleList().length > 1) {
                for (const ensemble of ensembles) {
                    for (const item of ensemble.devices) {
                        if (device.getUuid() === item.uuid) {
                            item.data.push(
                                device.getRuntimetotal(),
                                device.getRuntimemaintenance(),
                                device.getRuntimecurrent()
                            )
                            devicePushed = true 
                        }
                    }
                }
                if (!devicePushed) {
                    const dev : Array<DeviceUptime> = []
                    for (const member of device.getEnsembleList()) {
                        dev.push({
                            uuid: member,
                            data: []
                        })
                    }
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
    }, [])



    return (
        <div className="chart-container-select">
            <div className="select-container">
                <label className="select-label">Ensemble:</label>
                <select className="ensemble-select">
                    <option>-Ensemble wählen:-</option>
                    {populateSelect(ensembleDeviceUptime(props.data))}
                </select>
            </div>
            <svg ref={d3Chart}/>
        </div>
    )
}

export default MultiBarChart