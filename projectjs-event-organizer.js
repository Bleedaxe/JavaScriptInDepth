let eventsOrganizer = (function (){
    const invalidId = "Invalid id.";

    let isCreatingEnabled = true;
    
    let events = [];
    let clients = [];

    let getEventIndex = function (id){
        return events.map(e => e.id).indexOf(id);
    }

    let createEvent = (function (){
        let idCounter = 1;

        return function (name, flag = true, entryFee = 0, saveDate = false) {
            if(!isCreatingEnabled){
                return "Can't create event right now :(";
            }

            if (name === undefined){
                throw Error(invalidName);
            }

            entryFee = +entryFee;
            entryFee = entryFee < 0 ? 0 : entryFee;
            name = (entryFee > 0 ? "$": "!") + name;

            let isArchived = false;
            let income = 0;

            let ratings = [];

            let event = {
                id: idCounter++,
                name,
                flag: !!flag,
                clients: [],
                entryFee,
                toString: function(){
                    return `${this.id} -> ${this.name}: ${this.flag ? '0' : '18'}+; Rating: ${ratings.length === 0 ? "Unknown" : this.getRating()}`;
                },
                isArchived: function () {
                    return isArchived;
                },
                archive: function () {
                    if (isArchived === true){
                        return 'Event is already archived.';
                    }

                    isArchived = true;
                    this.name = '~' + this.name;
                    return 'Event is archived successfully.';
                },           
                getIncome: function () {
                    if (!isArchived) {
                        return 'Events is not archived.';
                    }

                    return income;
                },
                addIncome: function () {
                    income += entryFee;
                },
                getRating: function () {
                    return Math.floor(ratings
                        .map(r => r.rate * 0.6)
                        .reduce((prev, curr) => {
                            return prev + curr;
                        }, 0));
                },
                addRating: function (clientId, rate) {
                    if (ratings.map(r => r.clientId).indexOf(clientId) !== -1) {
                        return 'Event is already rated by this cluent';
                    }

                    ratings.push({
                        clientId,
                        rate
                    });
                }
            };

            if(saveDate){
                event.creationDate = new Date();
            }

            events.push(event);
            return event;
        };
    })();

    let getEventById = function (id) {
        let index = getEventIndex(id);
        if(index === -1){
            throw Error(invalidId);
        }

        return events[index];
    };

    let getEvents = function (areArchived) {
        if (areArchived === undefined) {
            return events.map(e => e.toString())
                .join('\n');
        }        

        areArchived = !!areArchived;

        return events
            .filter(e => e.isArchived() === areArchived)
            .map(e => e.toString())
            .join('\n');
    }

    let deleteEvent = function (eventId) {
        let index = getEventIndex(eventId);
        
        if(index === -1) {
            throw Error(invalidId);
        }

        let event = events.splice(index, 1)[0];

        for (let client of getClients()) {
            let eventIdIndex = client.events.indexOf(eventId);
            if (eventIdIndex !== -1){
                client.events.splice(eventIdIndex, 1);
            }
        }

        return `Event: ${event.name} is deleted successfully.`
    };

    let updateEvent = function (id, name, flag = true, entryFee){
        if (name === undefined){
            return "Name is required.";
        }        
        let event = getEventById(id);

        if (entryFee === undefined){
            entryFee = event.entryFee;
        }
        
        entryFee = +entryFee;
        entryFee = entryFee < 0 ? 0 : entryFee;
        name = (entryFee > 0 ? "$": "!") + name;

        event.name = name;
        event.flag = !!flag;
        event.entryFee = entryFee;

        events[getEventIndex(id)] = event;

        return `Event: ${event.name} is updated successfully.`;
    };

    let createClient = (function () {
        let idCounter = 1;
        
        return function (firstAndLastName, age, isMale = true, wallet = 0) {
            if(!isCreatingEnabled){
                return "Can't create client right now :(";
            }

            if (!firstAndLastName || !age || typeof firstAndLastName !== "string" || typeof age !== "number"){
                throw Error("Invalid input.");
            }

            wallet = +wallet;
            wallet = wallet < 0 ? 0 : wallet;

            let client = {
                id: idCounter++,
                firstAndLastName,
                age,
                isMale: !!isMale,
                events: [],
                wallet,
                toString: function() {
                    return `Name: ${this.firstAndLastName}, Age: ${this.age}, Gender: ${this.isMale ? 'male' : 'female'}`;
                },
                isVIP: function () {
                    return this.events.length === 5;
                }
            };
            clients.push(client);
            return client;
        };
    })();
    
    let getClientIndex = function (id){
        return clients.map(c => c.id).indexOf(id);
    }

    let getClients = function (id = null) {
        if (id === null){
            return clients;
        }

        let clientIndex = getClientIndex(id);
        if(clientIndex === -1){
            throw Error('Client not found!');
        }

        return clients[clientIndex];
    }

    let addClientToEvent = function (eventId, clientId){
        let event = getEventById(eventId);
        let client = getClients(clientId);

        if (!event.flag && client.age < 18){
            return "Client can't enter event.";
        }

        if(!client.isVIP()){
            if (client.wallet < event.entryFee) {
                return 'Client does not have enough money in his wallet.';
            }        
            client.wallet -= event.entryFee;
            event.addIncome();
        }

        if(event.clients.indexOf(clientId) !== -1){
            return 'Client is already assigned for this event.';
        }

        event.clients.push(clientId);
        client.events.push(eventId);

        return event;
    };

    let getEventClients = function (eventId, isMale) {
        if(eventId === undefined){
            return "Event not found!";
        }
        
        let event = getEventById(eventId);

        if (isMale === undefined){
            return event.clients
                .map(cId => clients[getClientIndex(cId)]);
        }

        return event.clients
            .map(cId => clients[getClientIndex(cId)])
            .filter(c => c.isMale === !!isMale);
    };

    let removeClient = function (eventId, clientId) {
        let event = getEventById(eventId);
        let clientIdIndex = event.clients.indexOf(clientId);

        if (clientIdIndex === -1) {
            return 'Client not found.';
        }

        event.clients.splice(clientIdIndex, 1);
        return 'Client is removed successfully';
    };

    let enableCreating = function () {
        isCreatingEnabled = true;
        return "Creating is enabled."
    }

    let disableCreating = function() {
        isCreatingEnabled = false;
        return "Creating is disabled."
    }

    let getEventWithMostClients = function() {
        let maxClients = 0;
        for(let event of events){
            maxClients = maxClients < event.clients.length ? event.clients.length : maxClients;
        }
        let maxClientsArray = events.filter(e => e.clients.length === maxClients);
        if(maxClientsArray.length !== 1){
            return "Event with most clients does not exist.";
        }
        let eventId = maxClientsArray[0].id;
        return getEventById(eventId);
    };

    let getMinorEvents = function () {
        return events.filter(e => e.flag);
    }

    let getEventsGroupedByTheirFlag = function () {
        return events.map(e => `${e.flag ? '*' : '#'} ${e.toString()}`).join('\n');
    }

    let getFilteredEvents = function (filterInput) {
        if(typeof filterInput === "function"){
            return events.filter(filterInput);
        }

        if (typeof filterInput === "string"){
            return events.filter(e => e.name.toLowerCase().includes(filterInput.toLowerCase()));
        }

        if (typeof filterInput === "boolean"){
            return events.filter(e => e.flag === filterInput);
        }

        return events;
    };

    let archiveEvent = function (eventId) {
        let event = getEventById(eventId);
        if(event.isArchived()){
            return "Event is already archived.";
        }
        event.archive();
        return `Event: ${event.name} is archived.`;
    };

    let rateEvent = function (clientId, eventId, rating) {
        let client = getClients(clientId);
        let event = getEventById(eventId);

        if (typeof rating !== 'number') {
            return 'Rating is not a number.';
        }

        if (rating < 1 || rating > 10) {
            return 'Rating should be in range [1, 10]';
        }

        if (!event.isArchived()) {
            return 'Event is not archived'; 
        }

        if (event.clients.indexOf(clientId) === -1) {
            return 'Client is not assigned for this event.';
        }

        return event.addRating(clientId, rating);
    }

    let eventIncome = function (eventId) {
        let event = getEventById(eventId);
        return `Event: ${event.name} has income: ${event.getIncome()}`;
    }

    return {
        createEvent,
        getEventById,
        getEvents,
        deleteEvent,
        updateEvent,
        createClient,
        addClientToEvent,
        getClients,
        getEventClients,
        removeClient,
        enableCreating,
        disableCreating,
        getEventWithMostClients,
        getMinorEvents,
        getEventsGroupedByTheirFlag,
        getFilteredEvents,
        archiveEvent,
        rateEvent,
        eventIncome
    };
})();


//Creating few events
console.log(eventsOrganizer.createEvent("event1"));
console.log(eventsOrganizer.createEvent("event2", false)); //Only for adults
console.log(eventsOrganizer.createEvent("event3", true, 10)); //Add with entry fee
console.log(eventsOrganizer.createEvent("event4"));
console.log(eventsOrganizer.createEvent("event5"));
console.log(eventsOrganizer.createEvent("event6", true, 100));


// Create few clients
console.log(eventsOrganizer.createClient("client1", 12, true, 50));
console.log(eventsOrganizer.createClient("client2", 18, false, 9));
console.log(eventsOrganizer.createClient("client3", 1, false, 50));
console.log(eventsOrganizer.createClient("client4", 25, true, 50));
console.log(eventsOrganizer.createClient("client5", 17, true, 50));

//Get all events
console.log(eventsOrganizer.getEvents());

//Delete event
console.log(eventsOrganizer.createEvent("eventForDeleting"));
console.log(eventsOrganizer.deleteEvent(7));

//Update event
console.log(eventsOrganizer.updateEvent(1, '__event__'));
console.log(eventsOrganizer.updateEvent(2)); //No name

console.log(eventsOrganizer.getEvents());

//Add clients to event
console.log(eventsOrganizer.addClientToEvent(1, 1));
console.log(eventsOrganizer.addClientToEvent(1, 1));
console.log(eventsOrganizer.addClientToEvent(1, 2));
console.log(eventsOrganizer.addClientToEvent(1, 3));
console.log(eventsOrganizer.addClientToEvent(2, 3)); // Client can't enter event

//Get clients assigned for event
console.log(eventsOrganizer.getEventClients());
console.log(eventsOrganizer.getEventClients(1));
console.log(eventsOrganizer.getEventClients(4));
console.log(eventsOrganizer.getEventClients(1, true)); //Show only men

//Remove client from event
console.log(eventsOrganizer.removeClient(1, 1));
console.log(eventsOrganizer.getEventClients(1));

//Disable creating
console.log(eventsOrganizer.disableCreating());
console.log(eventsOrganizer.createClient('asd', 12));
console.log(eventsOrganizer.createEvent("asd"));

//Enable creating
console.log(eventsOrganizer.enableCreating());

//Create event with current date
console.log(eventsOrganizer.createEvent('event with date', true, 0, true));
console.log(eventsOrganizer.getEventById(6));

//Get event with most clients
console.log(eventsOrganizer.getEventWithMostClients());

//Make 2 events with equal clients
console.log(eventsOrganizer.addClientToEvent(2, 4));
console.log(eventsOrganizer.addClientToEvent(2, 2));
console.log(eventsOrganizer.getEventWithMostClients());

//Events for minors
console.log(eventsOrganizer.getMinorEvents());

//Grouped events
console.log(eventsOrganizer.getEventsGroupedByTheirFlag());

//Filter by name
console.log(eventsOrganizer.getFilteredEvents("_"));

//Filter by flag
console.log(eventsOrganizer.getFilteredEvents(true));

//Filter by function
console.log(eventsOrganizer.getFilteredEvents((e) => e.name.includes('_')));

//Try add client without enough money
console.log(eventsOrganizer.addClientToEvent(3, 2));


console.log(eventsOrganizer.addClientToEvent(3, 1));
console.log(eventsOrganizer.addClientToEvent(3, 3));
console.log(eventsOrganizer.addClientToEvent(3, 4));
console.log(eventsOrganizer.addClientToEvent(3, 5));

//Archive event
console.log(eventsOrganizer.archiveEvent(3));
console.log(eventsOrganizer.archiveEvent(3)); //Try to archive same event

//Get income of archived event
console.log(eventsOrganizer.eventIncome(3));

//Try get income of unarchived event
console.log(eventsOrganizer.eventIncome(1));

console.log(eventsOrganizer.getEvents());

//Get archived events
console.log(eventsOrganizer.getEvents(true));

//Get unarchived events
console.log(eventsOrganizer.getEvents(false));

//Create VIP client
console.log(eventsOrganizer.createClient("VIP Client", 19, true, 10));
console.log(eventsOrganizer.addClientToEvent(1, 6));
console.log(eventsOrganizer.addClientToEvent(2, 6));
console.log(eventsOrganizer.addClientToEvent(3, 6));
console.log(eventsOrganizer.addClientToEvent(4, 6));
console.log(eventsOrganizer.addClientToEvent(5, 6)); //VIP Client after this
console.log(eventsOrganizer.addClientToEvent(6, 6)); //Not VIP any more...