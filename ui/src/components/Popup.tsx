import React, { FormEvent } from 'react';
import { createSecureContext } from 'tls';
import { Options } from '../App';
import { DeviceData } from '../proto/frontend_pb';
import { getRooms, getStations, populateSelect } from '../util';
import "./Popup.css";

type PopupProps = {
  data : Array<DeviceData>,
  current : Options,
  trigger : boolean,
  setTrigger : Function,
  submitFunction : Function
}

function Popup({ data, current, trigger, setTrigger, submitFunction} : PopupProps) {

  const [station, setStation] = React.useState<string>(current.station)
  const [selectedClass, setSelectedClass] = React.useState<string>(current.device_class)

  function handleStationChange(event : React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value
    setStation(value)        
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
    setStation("default")
    setSelectedClass("default")
    {submitFunction({"station" : "default", "device_class" : "default"})}
  }

  return (trigger) ? (
    <div className="popup">
      <div className="popup-body">
        <h1>Filteroptionen</h1>
        <form className="filter-form" onSubmit={handleSubmit}>
          <h2>Station</h2>
          <p>Aktuelle Auswahl: {station}</p>
          <select className="station-select" onChange={handleStationChange} value={station}>
            <option value="default">- kein Filter -</option>
            {getStations(data)}
          </select>
          <h2>Geräteklasse</h2>
          <p>Aktuelle Auswahl: {selectedClass}</p>
          <select className="device-class-select" value={selectedClass}
          onChange={(event : React.ChangeEvent<HTMLSelectElement>) => {setSelectedClass(event.target.value)}}>
            <option value="default">- kein Filter -</option>
            {populateSelect(data)}
          </select>
        </form>
        <button className="popup-reset-btn" onClick={handleReset}>
          Zurücksetzen
        </button>
        <button className="popup-submit-btn" onClick={() => {submitFunction({
            "station" : station,
            "device_class" : selectedClass
          })}}>Übernehmen</button>
        <button className="popup-close-btn" onClick={handleClose}>Schließen</button>
      </div>
    </div>
  ) : (<></>);
}

export default Popup