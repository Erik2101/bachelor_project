import React, { FormEvent } from 'react';
import { Options } from '../App';
import { DeviceData } from '../proto/frontend_pb';
import { getStations, populateSelect } from '../util';
import FilterItemButton from './FilterItemButton';
import "./Popup.css";

type PopupProps = {
  data : Array<DeviceData>,
  current : Options,
  trigger : boolean,
  setTrigger : Function,
  submitFunction : Function
}

function Popup({ data, current, trigger, setTrigger, submitFunction} : PopupProps) {

  const [station, setStation] = React.useState<Array<string>>(current.station)
  const [selectedClass, setSelectedClass] = React.useState<Array<string>>(current.device_class)

  React.useLayoutEffect(() => {
    console.log("update")
    submitFunction({"station" : station, "device_class" : selectedClass})
  }, [station, selectedClass])

  function handleStationAdd() {
    const station_select = document.getElementById("popup-station-select") as HTMLSelectElement
    const value = station_select.value
    if(value !== "default") {
      setStation(oldState => {
        if (oldState.some(e => e === value)) {
          console.log("bereits vorhanden.")
          return oldState
        }
        let ret = [...oldState]
        ret.push(value)
        return ret
      })
    }
  }

  function handleClassAdd() {
    const class_select = document.getElementById("device-class-select") as HTMLSelectElement
    const value = class_select.value
    if(value !== "default") {
      setSelectedClass(oldState => {
        if (oldState.some(e => e === value)) {
          console.log("bereits vorhanden.")
          return oldState
        }
        const ret = [...oldState]
        ret.push(value)
        return ret
      })
    }
  }

  function handleSubmit(event : FormEvent) {
    event.preventDefault()
    setTrigger(false)
  }

  function handleClose() {
    setStation(current.station)
    setSelectedClass(current.device_class)
    setTrigger(false)
  }

  function handleReset() {
    setStation([])
    setSelectedClass([])
    const class_select = document.getElementById("device-class-select") as HTMLSelectElement
    class_select.value = "default"
    const station_select = document.getElementById("popup-station-select") as HTMLSelectElement
    station_select.value = "default"
    {submitFunction({"station" : [], "device_class" : []})}
  }

  function removeItem(item_to_remove : string,  option : string) {
    // remove filter item from filter array
    if (option === "station") {
      setStation(prevArray => { 
        const idx = prevArray.indexOf(item_to_remove)
        let new_array
        console.log(idx)
        if(idx !== -1) {
          new_array = [...prevArray]
          new_array.splice(idx, 1)
          return new_array
        }
        return prevArray
      })
    }
    if (option === "class") {
      setSelectedClass(prevArray => { 
        const idx = prevArray.indexOf(item_to_remove)
        let new_array
        if(idx !== -1) {
          new_array = [...prevArray]
          new_array.splice(idx, 1)
          return new_array
        }
        return prevArray
      })
    }
  }

  return (trigger) ? (
    <div className="popup">
      <div className="popup-body">
        <h1>Filteroptionen</h1>
        <form className="filter-form" onSubmit={handleSubmit}>
          <h2>Station</h2>
            <div className="conditional-container">
              <h4 className="filter-display-header">Aktuelle Auswahl</h4> 
              <div className="filter-display">
                { station.map(item =>
                  <div className="filter-item" key={item}>
                    <p>{item}</p>
                    <FilterItemButton className="filter-item-btn" onClick={removeItem} option="station"/>
                  </div> 
                  ) 
                }
              </div>
            </div>
          <div className="filter-selector">
            <select className="station-select" id="popup-station-select">
              <option value="default">- Station Auswählen - </option>
              {getStations(data)}
            </select>
            <div className="add-btn" onClick={handleStationAdd}>Hinzufügen</div>
          </div>
          <h2>Geräteklasse</h2>
            <div className="conditional-container">
              <h4 className="filter-display-header">Aktuelle Auswahl</h4>
              <div className="filter-display">
                { selectedClass.map(item =>
                  <div className="filter-item" key={item}> 
                    <p key={item}>{item}</p>
                    <FilterItemButton className="filter-item-btn" onClick={removeItem} option="class"/>
                  </div>
                  )
                }
              </div>
            </div>
          <div className="filter-selector">
            <select className="device-class-select" id="device-class-select">
              <option value="default">- Geräteklasse auswählen -</option>
              {populateSelect(data)}
            </select>
            <div className="add-btn" onClick={handleClassAdd}>Hinzufügen</div>
          </div>
        </form>
        <button className="popup-reset-btn" onClick={handleReset}>
          Zurücksetzen
        </button>
        <button className="popup-close-btn" onClick={handleClose}>Schließen</button>
      </div>
    </div>
  ) : (<></>);
}

export default Popup