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
  const [room, setRoom] = React.useState<string>(current.room)
  const [selectedClass, setSelectedClass] = React.useState<string>(current.device_class)

  function handleStationChange(event : React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value
    if (value === "default") {
        setRoom("default")
    }
    setStation(value)        
}

  function handleSubmit(event : FormEvent) {
    event.preventDefault()
    setTrigger(false)
  }

  return (trigger) ? (
    <div className="popup">
      <div className="popup-body">
        <h1>Filteroptionen</h1>
        <form className="filter-form" onSubmit={handleSubmit}>
          <h2>Station</h2>
          <select className="station-select" onChange={handleStationChange} value={station}>
            <option value="default">- kein Filter -</option>
            {getStations(data)}
          </select>
          <h2>Raum</h2>
          {station !== "default" ?
            <select className="room-select" onChange={(event : React.ChangeEvent<HTMLSelectElement>) => {setRoom(event.target.value)}}
            value={room}>
              <option value="default">- kein Filter -</option>
              {getRooms(data, station)}
            </select> :
            <p className="room-reminder">
              Für die Auswahl eines Raumes muss zuerst die übergeordnete Station ausgewählt werden.
            </p> 
          }
          <h2>Geräteklasse</h2>
          <select className="device-class-select" value={selectedClass}
          onChange={(event : React.ChangeEvent<HTMLSelectElement>) => {setSelectedClass(event.target.value)}}>
            <option value="default">- kein Filter -</option>
            {populateSelect(data)}
          </select>
        </form>
        <button className="popup-reset-btn" onClick={() => 
          {submitFunction({"station" : "default", "room" : "default", "device_class" : "default"})}}>
          Zurücksetzen
        </button>
        <button className="popup-submit-btn" onClick={() => {submitFunction({
            "station" : station,
            "room" : room,
            "device_class" : selectedClass
          })}}>Übernehmen</button>
        <button className="popup-close-btn" onClick={() => {setTrigger(false)}}>Schließen</button>
      </div>
    </div>
  ) : (<></>);
}

export default Popup