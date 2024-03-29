import json
import random
from datetime import datetime, timedelta

station_pool = ["G", "ICU", "AMB", "RAD"]
room_pool = ["OR", "PR"]
rnumber_pool = ["1", "2", "3"]

# function for generating a medical device dummy
def create_dummy_device():
    dummy = {
        "uuid": str,
        "isActive": bool,
        "isUsable": bool,
        "classes": str,
        "errors": [{
            "id": int,
            "priority": str,
            "kind": str,
            "date": str,
        }],
        "location": str,
        "staff": str,
        "depot": str,
        "ensemble": [str],
        "runtimeCurrent": int,
        "runtimeMaintenance": int,
        "runtimeTotal": int
    }

    bool_pool = [True, False]
    classes = ["Beatmungsgerät", "Dialysemaschine", "Röntgengerät", "Blutdruckmessgerät"]

    names = ["Sylvia Sommer", "Magdalene Schwenke", "Isabell Fertig", "Gregor Scherer", "Uwe Eberhardt",
             "Aaron Braband", "Lambert Becker", "Dietmar Brahms", "Melanie Fürst", "Maximilian Kempf"
             ]

    uuid = uuid_gen()
    dummy.update({"uuid": uuid})
    if random.randint(0, 9) > 4:
        active = True
    else:
        active = False
    dummy.update({"isActive": active})
    if active:
        dummy.update({"isUsable": True})
    else:
        if random.randint(0, 9) > 2:
            usable = False
        else :
            usable = True
        dummy.update({"isUsable": usable})
    dummy.update({"classes": random.choice(classes)})
    rooms = room_gen()
    dummy.update({"location": rooms[0]})
    dummy.update({"staff": random.choice(names)})
    dummy.update({"depot": rooms[1]})
    dummy.update({"ensemble": []})
    total = runtime_gen()
    maintain = total / random.randint(2, 6)
    dummy.update({"runtimeCurrent": round(maintain / random.randint(2, 6))})
    dummy.update({"runtimeMaintenance": round(maintain)})
    dummy.update({"runtimeTotal": total})

    return dummy


# generates a room-key and a depot-key on the same station
def room_gen():
    station = random.choice(station_pool)

    room = "".join(station + "-" + random.choice(room_pool) + "-" + str(random.randint(1, 2)))
    depot = "".join(station + "-DEP-" + str(random.randint(1, 2)))
    return [room, depot]


# generates an error with a date between start and end timestamps
def error_gen(start, end):
    kinds = ["physical", "technical"]

    error = {
        "id": int,
        "priority": str,
        "kind": str,
        "date": str,
    }

    identifier = {"id": random.randint(1, 9999)}
    percent = random.randint(0, 9)
    if percent < 2:
        prio = "high"
    elif 2 <= percent < 5:
        prio = "medium"
    else:
        prio = "low"
    priority = {"priority": prio}
    kind = {"kind": kinds[random.randint(0, 1)]}
    date = {"date": str(datetime_gen(start, end))}

    error.update(identifier)
    error.update(priority)
    error.update(kind)
    error.update(date)

    return error


# generates a time value between 3 hours and 14 days in seconds
def runtime_gen():
    return random.randint(60 * 60 * 3, 60 * 60 * 24 * 14)


# generates an array containing between 1 and 2 error objects
def error_array_gen(start, end):
    key = random.randint(1, 2)
    ret = []
    for x in range(key):
        ret.append(error_gen(start, end))
    return ret


# generates a random datetime timestamp between start and end, precision is seconds
def datetime_gen(start, end):
    delta = end - start

    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return start + timedelta(seconds=random_second)


# generates a uuid-like string
def uuid_gen():
    store = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]

    sect_1 = "".join(random.choice(store) for x in range(8))
    sect_2 = "".join(random.choice(store) for x in range(4))
    sect_3 = "".join(random.choice(store) for x in range(4))
    sect_4 = "".join(random.choice(store) for x in range(4))
    sect_5 = "".join(random.choice(store) for x in range(12))

    return "".join(sect_1 + "-" + sect_2 + "-" + sect_3 + "-" + sect_4 + "-" + sect_5)


# generate 400 dummy objects
# assign errors depending on "isUsable"-value
# error timestamps are spread over 2 weeks, hopefully with higher counts around weekends
dummySet = []
for i in range(400):
    temp = create_dummy_device()
    if temp.get("isUsable"):
        errors = {"errors": []}
    else:
        if i < 61:
            s = datetime(2022, 3, 7, 0, 0, 0, 0, None)
            e = datetime(2022, 3, 10, 23, 59, 59, 999999, None)
        elif i < 221:
            s = datetime(2022, 3, 11, 0, 0, 0, 0, None)
            e = datetime(2022, 3, 13, 23, 59, 59, 999999, None)
        elif i < 241:
            s = datetime(2022, 3, 14, 0, 0, 0, 0, None)
            e = datetime(2022, 3, 16, 23, 59, 59, 999999, None)
        else:
            s = datetime(2022, 3, 17, 0, 0, 0, 0, None)
            e = datetime(2022, 3, 21, 23, 59, 59, 999999, None)
        errors = {"errors": error_array_gen(s, e)}
    temp.update(errors)
    # add additional id 0 error to every device to prevent grpc from reading empty array as undefined
    # this needs to be filtered in data processing later
    app = temp.get("errors")
    null_error = {
        "id": 0,
        "priority": "none",
        "kind": "none",
        "date": "none"
    }
    app.append(null_error)
    temp.update({"errors": app})
    dummySet.append(temp)

# get count of devices per room
roomStore = {}
for station1 in station_pool:
    for room1 in room_pool:
        for nr in rnumber_pool:
            roomStore.update({"".join(station1 + "-" + room1 + "-" + nr): []})

for item in dummySet:
    prevVal = roomStore.get(item.get("location"))
    prevVal.append(item)
    roomStore.update({item.get("location"): prevVal})

# sort roomStore in descending order of device count
sorted_store = sorted(roomStore.items(), key=lambda kv: len(kv[1]))
sorted_store.reverse()

# generate sdc-ensemble for the 4 rooms with the most devices
# each ensemble contains around 1/4th of the rooms devices
# each device will be given an array with the uuid's of it's ensemble-members
ens_list = []

for i in range(5):
    ensemble = []
    target_array = sorted_store[i][1]
    stop = round(len(target_array) / 4)
    for j in range(stop):
        ensemble.append(target_array[j])
    ens_list.append(ensemble)

for i in range(len(ens_list)):
    currentEns = ens_list[i]
    for j in range(len(currentEns)):
        currentId = currentEns[j].get("uuid")
        for item in dummySet:
            if item.get("uuid") == currentId:
                final = []
                for participant in currentEns:
                    ident = participant.get("uuid")
                    if ident != currentId:
                        final.append(ident)
                        ens = {"ensemble": final}
                        item.update(ens)

# append each items own uuid to its ensemble array to prevent protobuf from misreading [] as undefined. This needs to
# be filtered out when processing the data for visualization but enables possible ensembles between only 2 devices
for item in dummySet:
    item_id = item.get("uuid")
    item_ens = item.get("ensemble")
    item_ens.append(item_id)
    item.update({"ensemble": item_ens})
# print dummySet as pretty-json to file
output = json.dumps(dummySet, indent=4)

deviceDummyFile = open("deviceDummyV2.1.json", "w")
deviceDummyFile.write(output)
deviceDummyFile.close()

