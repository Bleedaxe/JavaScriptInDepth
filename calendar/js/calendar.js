let calendar = function (DOMlibrary, containerQuery) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    //Initial CSS
    (function (){
        let css = `table {
            width: 99.4%;
            position: relative;
            left: 0.3%;
            border: 1px solid black;
            border-collapse: collapse;
        }
        td {
            border: 1px solid gray;
            width: 14.2%;
            height: 30px;
            padding: 0;
            background-color: white;
            transition: background-color .7s;
            text-align: center;
            color: black;
        }
        .current:hover {
            background-color: black;
            color: red;
        }
        .headers {
            border: none;
            color: red;
            font-weight: bold;
            border-bottom: 1px solid black;
        }
        .current {
            background-color: white;
        }
        .today{
            background-color: red;
        }
        .previous, .next {
            background-color: #f2f2f2;
        }
        #datepicker {
            width: 350px;
            border: 1px solid black;
            border-collapse: collapse;
            background-color: black;
        }`;

        let style = DOMlibrary.createElement('style');

        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            DOMlibrary.changeText(style, css);
        }

        let head = DOMlibrary.get('head');
        DOMlibrary.appendElement(head, style);
    })();

    const dataHandler = (function (){
        const yearDataset = 'year';
        const monthDataset = 'month';
        const dayDataset = 'day';

        const getDate = function (date){
            const year = +DOMlibrary.getData(date, yearDataset);
            const month = +DOMlibrary.getData(date, monthDataset);
            const day = +DOMlibrary.getData(date, dayDataset);

            return {
                year,
                month,
                day
            };
        }

        const addDataset = function (year, month, day, dayIndex) {
            DOMlibrary.addData(day, yearDataset, year);
            DOMlibrary.addData(day, monthDataset, month);
            DOMlibrary.addData(day, dayDataset, dayIndex);
        }

        return {
            getDate,
            addDataset
        }
    })();

    const eventOrganizer = (function () {
        let dayEvents = [];
        const create = function (year, month, day, name, value) {
            const event = {
                year,
                month,
                day,
                name,
                value
            };
    
            dayEvents.push(event);
        }
    
        const get = function (year, month, day) {
            const toEventObject = function (dayEvent) {
                return {
                    name: dayEvent.name,
                    value: dayEvent.value
                };
            }
    
            return dayEvents
                .filter(de => de.year === year && de.month === month && de.day === day)
                .map(toEventObject);
        }
        
        const showEventWindow = function () {
            const eventWindowId = 'events';
            const that = this;
            const eventContainer = DOMlibrary.createElement('div');
            DOMlibrary.changeElementId(eventContainer, eventWindowId);
            const showCreateNewEventInput = function (year, month, day) {
                const createLabel = function () {
                    const label = DOMlibrary.createElement('h4');
                    DOMlibrary.changeText(label, 'Create new event');
                    DOMlibrary.appendElement(eventContainer, label);
                }
                const createInput = function () {
                    const appendInputElement = function (name){
                        const wrapper = DOMlibrary.createElement('div');
                        const label = DOMlibrary.createElement('label');
                        DOMlibrary.changeText(label, name);
                        DOMlibrary.setAttributeToElement(label, 'for', name);

                        const input = DOMlibrary.createElement('input');
                        DOMlibrary.changeElementId(input, name);
                        DOMlibrary
                            .appendElement(wrapper, label)
                            .appendElement(wrapper, input)
                            .appendElement(eventContainer, wrapper);
                        return input;
                    }

                    const name = 'Name';
                    const value = 'Value';
                    const nameInput = appendInputElement(name);
                    const valueInput = appendInputElement(value);
                    
                    const appendSubmitBtn = function () {
                        const onClick = function () {
                            const nameText = nameInput.value;
                            const valueText = valueInput.value;
                            if (nameText === '' || valueText === '') {
                                return;
                            }
                            create(year, month, day, nameText, valueText);
                            DOMlibrary.getById(name).value = '';
                            DOMlibrary.getById(value).value = '';
                            showEventWindow.apply(that);
                        }
                        const btn = DOMlibrary.createElement('button');
                        DOMlibrary.changeText(btn, 'Create');
                        DOMlibrary
                            .addEventListener(btn, 'click', onClick)
                            .appendElement(eventContainer, btn);

                    }

                    appendSubmitBtn();
                }
                createLabel();
                createInput();
            }
            const showCreatedEvents = function (events) {
                const createLabel = function () {
                    const label = DOMlibrary.createElement('h3');
                    DOMlibrary.changeText(label, 'Events');
                    DOMlibrary.appendElement(eventContainer, label);
                }
                const createList = function () {
                    const toListItem = function (event) {
                        const li = DOMlibrary.createElement('li');
                        const text = `${event.name}: ${event.value}`;
                        DOMlibrary.changeText(li, text);
                        return li;
                    }

                    if(events.length === 0) {
                        const label = DOMlibrary.createElement('p');
                        DOMlibrary.changeText(label, 'No events found for this day.');
                        DOMlibrary.appendElement(eventContainer, label);
                        return;
                    }
                    const ul = DOMlibrary.createElement('ul');
                    events
                        .map(toListItem)
                        .forEach(li => DOMlibrary.appendElement(ul, li));
                    DOMlibrary.appendElement(eventContainer, ul);
                }

                createLabel();
                createList();                       

            }
            const deleteOldEvents = function (container) {
                Array
                    .from(DOMlibrary.getChild(container))
                    .filter(c => c.id === eventWindowId)
                    .forEach(DOMlibrary.removeElement);
            }
            const removeOldClicks = function (td) {
                const table = DOMlibrary
                    .getParent(DOMlibrary.getParent(td));
                if (table.tagName.toLowerCase() !== 'table'){
                    return;
                }
                Array.from(DOMlibrary.getChild(table))
                    .forEach(tr => Array.from(DOMlibrary.getChild(tr))
                        .forEach(td => DOMlibrary.removeStyle(td)));
            }

            const date = dataHandler.getDate(this);
            const events = get(date.year, date.month, date.day);

            showCreateNewEventInput(date.year, date.month, date.day);
            showCreatedEvents(events);

            const container = DOMlibrary.get(containerQuery);
            deleteOldEvents(container);
            removeOldClicks(this);            
            DOMlibrary
                .addStyle(this, { "background-color": "yellow" })
                .appendElement(container, eventContainer);
        };

        return {
            showEventWindow,
        };
    })();  

    const createTable = function () {
        let table = DOMlibrary.createElement("table");        
        return table;
    }

    const addHeaders = function (table, headers) {
        const toTd = function (text) {
            const td = DOMlibrary.createElement('td');
            DOMlibrary.changeText(td, text);
            return td;
        }
        const foreachDay = function (tr, day) {
            DOMlibrary.addClass(day, 'headers');
            DOMlibrary.appendElement(tr, day);
        }

        const tr = DOMlibrary.createElement("tr");
        headers
            .map(toTd)
            .forEach(d => foreachDay(tr, d));
            
        DOMlibrary.appendElement(table, tr);
    }

    const fillTable = function (table, year, month, week, dayClickEvent, pickedDate) {
        const createDay = function (index) {
            let day = DOMlibrary.createElement("td");
            DOMlibrary.changeText(day, index);
            DOMlibrary.addClass(day, 'day');
            return day;
        }
        const lastDayOfMonth = function (year, month) {
            let date = new Date(year, +month + 1, 0);
            return date.getDate();
        }; 

        let counter = 0;
        let rows = [];
        let row = (function () {
            let row = DOMlibrary.createElement("tr");
            //DOMlibrary.appendElement(table, row);
            return row;
        })();
        rows.push(row);

        const appendDayToRow = function (day) {
            const createNewRow = function () {
                counter = 0;
                row = DOMlibrary.createElement("tr");
                rows.push(row);
                //DOMlibrary.appendElement(table, row);
            };
            if (counter === 7) {
                createNewRow();
            }            
            DOMlibrary.appendElement(row, day);
            counter++;
        }
        const appenPreviousMonthDays =  function () {
            const previousMonthLastDay = (function () {
                let previousMonth = month - 1;
                if (previousMonth < 0){
                    previousMonth = 11;
                }
                return lastDayOfMonth(year, previousMonth);
            })();
            const firstDayInMonthIndex = new Date(year, month, 1).getDay();

            for (let previousMonthDayCounter = previousMonthLastDay - firstDayInMonthIndex + 2; previousMonthDayCounter <= previousMonthLastDay; previousMonthDayCounter++) {
                const day = createDay(previousMonthDayCounter);
                DOMlibrary.addClass(day, 'previous');
                appendDayToRow(day);
            }
        }
        const appendCurrentMonthDays = function () {            
            const lastDayOfCurrentMonth = lastDayOfMonth(year, month);

            for (let dayCounter = 1; dayCounter <= lastDayOfCurrentMonth; dayCounter++) {
                const day = createDay(dayCounter);
                DOMlibrary.addClass(day, 'current');
                if (dayCounter === pickedDate.getDate() && month == pickedDate.getMonth() && pickedDate.getFullYear() === year){
                    DOMlibrary.addClass(day, 'today');
                }
                DOMlibrary.addEventListener(day, 'click', dayClickEvent);
                dataHandler.addDataset(year, month, day, dayCounter);
                appendDayToRow(day);
            }
        }
        const appenNextMonthDays = function () {
            let dayCounter = 1;
            while (counter !== 7){
                const day = createDay(dayCounter)
                DOMlibrary.addClass(day, 'next');
                appendDayToRow(day);
                dayCounter++
            }
        }

        appenPreviousMonthDays();
        appendCurrentMonthDays();        
        appenNextMonthDays();
        if (week === null) {
            rows.forEach(r => DOMlibrary.appendElement(table, r));
            return;
        }
        week = week > rows.length ? rows.length : week;
        DOMlibrary.appendElement(table, rows[week - 1]);
    }

    const deleteChildElements = function (container) {
        Array.from(DOMlibrary.getChild(container))
            .forEach(DOMlibrary.removeElement);
    };

    const appendCaption = function (table, year, monthIndex, week) {
        const toOption = function (text, current, value) {
            let element = DOMlibrary.createElement('option');
            DOMlibrary.changeText(element, text);
            DOMlibrary.setAttributeToElement(element, 'value', value);
            if (text === current) {
                DOMlibrary.setAttributeToElement(element, 'selected', '');
            }
            return element;
        }
        const appendMonth = function (caption, monthIndex) {
            const changeMonth = function (event) {
                let month = +event.target.value;
                showCalendar(year, month, week);
            }


            const select = DOMlibrary.createElement('select');
            DOMlibrary.addEventListener(select, 'change', changeMonth);
            const currentMonth =  months[monthIndex];
            let monthCounter = 0;
            months
                .map(m => toOption(m, currentMonth, monthCounter++))
                .forEach(m => DOMlibrary.appendElement(select, m));
            DOMlibrary.appendElement(caption, select);

        }
        const appendYear = function (caption, year){
            const changeYear = function (event) {
                let year = +event.target.value;
                showCalendar(year, monthIndex, week);
            }
            const currentYear = new Date().getFullYear();
            const years = [currentYear - 1, currentYear, currentYear + 1];

            const select = DOMlibrary.createElement('select');
            DOMlibrary.addEventListener(select, 'change', changeYear);
            years
                .map(y => toOption(y, year, y))
                .forEach(y => DOMlibrary.appendElement(select, y));
            DOMlibrary.appendElement(caption, select);
        }
        const appendChangeView = function (caption, week) {
            const viewTypes = ['Month', 'Week'];
            const changeView = function (event) {
                let viewType = event.target.value;
                const week = viewType === viewTypes[1] ? 1 : null;
                showCalendar(year, monthIndex, week);
            }

            const current = week === null ? viewTypes[0] : viewTypes[1];

            const select = DOMlibrary.createElement('select');
            DOMlibrary.addEventListener(select, 'change', changeView);
            viewTypes
                .map(vt => toOption(vt, current, vt))
                .forEach(vt => DOMlibrary.appendElement(select, vt));
            DOMlibrary.appendElement(caption, select);
        }
        const appendWeekButtons = function (caption, week) {
            const nextWeek = function () {
                showCalendar(year, monthIndex, ++week);
            }
            const previousWeek = function () {
                if (week > 1) {
                    week--;
                }
                showCalendar(year, monthIndex, week);
            }
            const previous = DOMlibrary.createElement('button');
            DOMlibrary.changeText(previous, 'Previous');
            const next = DOMlibrary.createElement('button');
            DOMlibrary.changeText(next, 'Next');
            DOMlibrary
                .addEventListener(previous, 'click', previousWeek)
                .appendElement(caption, previous)
                .addEventListener(next, 'click', nextWeek)
                .appendElement(caption, next);
            
        }
        const caption = DOMlibrary.createElement('caption');
        appendMonth(caption, monthIndex);
        appendYear(caption, year);
        appendChangeView(caption, week);
        if(week !== null){
            appendWeekButtons(caption, week);
        }
        DOMlibrary.appendElement(table, caption);
    }

    const createDatepickerElement = function (table, id) {
        const datepicker = DOMlibrary.createElement('div');
        DOMlibrary
            .changeElementId(datepicker, id)
            .appendElement(datepicker, table);
        return datepicker;
    }

    const appendDatepickerCaption = function (table, monthIndex, monthEvents) {
        const caption = DOMlibrary.createElement('caption');
        const addButtonToCaption = function (text, float, event) {
            const btn = DOMlibrary.createElement('button');
            DOMlibrary
                .changeText(btn, text);
            DOMlibrary
                .addStyle(btn, { float })
                .addEventListener(btn, 'click', event)
                .appendElement(caption, btn);
        }
        addButtonToCaption('Next', 'right', monthEvents.showNextMonth);
        addButtonToCaption('Previous', 'left', monthEvents.showPreviousMonth);
        const month = DOMlibrary.createElement('p');
        DOMlibrary
            .changeText(month, months[monthIndex]);
        DOMlibrary
            .addStyle(month, {
                float: 'clear',
                color: 'white',
                margin: 0,
                padding: 0
            })
            .appendElement(caption, month);
        DOMlibrary.appendElement(table, caption);
    }

    const changeMonths = function (year, month, datepickerId, dateString) {
        const initial = function () {
            DOMlibrary.get(containerQuery).focus();
            DOMlibrary
            .removeElement(DOMlibrary
                .getById(datepickerId));
        }
        const showNextMonth = function () {
            if (month === 11) return;
            initial();
            month++;
            appendDatepicker(year, month, dateString, datepickerId);
        }
        const showPreviousMonth = function () {
            if(month === 0) return;
            initial();
            month--;
            appendDatepicker(year, month, dateString, datepickerId);
        }
        return {
            showNextMonth,
            showPreviousMonth
        }
    };
    
    function appendDatepicker (year, month, dateString, datepickerId) {
        const pickDate = function () {
            const date = dataHandler.getDate(this);
            const container = DOMlibrary.get(containerQuery);
            DOMlibrary
                .setAttributeToElement(container, 'value', `${date.day}/${date.month + 1}/${date.year}`)
        }
        const getDateFromString = function (date) {
            const tokens = date.split('/');
            const day = +tokens[0];
            const month = +tokens[1] - 1;
            const year = +tokens[2];
    
            return new Date(year, month, day);
        }

        const headers = ["Mo", "Tu", 'We', 'Th', 'Fr', 'Sa', 'Su'];

        const table = createTable(headers);
        addHeaders(table, headers);
        appendDatepickerCaption(table, month, changeMonths(year, month, datepickerId, dateString));

        const pickedDate = getDateFromString(dateString);
        fillTable(table, year, month, null, pickDate, pickedDate);
        
        datepicker = createDatepickerElement(table, datepickerId);
        DOMlibrary.appendElement(document.body, datepicker);
    }

    const createDatepicker = function (year, month, container) {
        const datepickerId = 'datepicker';

        const inputEvents = (function () {
            const onFocus = function () {
                const value = this.value;
                appendDatepicker(year, month, value, datepickerId);
            }    
            const onFocusOut = function (e) {
                const deleteContainer = function () {
                    const datepicker = DOMlibrary.getById(datepickerId);
                    DOMlibrary.removeElement(datepicker);
                }
                let timeout = 200;                
                const target = e.relatedTarget;
                if(target !== null && target.tagName.toLowerCase() === 'button'){
                    deleteContainer();
                    target.click();
                    return;
                }

                setTimeout(deleteContainer, timeout);         
            }
            const preventTyping = function (e) {
                e.preventDefault();
            }

            return {
                onFocus,
                onFocusOut,
                preventTyping,
            };
        })();        
        
        DOMlibrary
            .setAttributeToElement(container, 'placeholder', 'Pick date...')
            .addEventListener(container, 'keydown', inputEvents.preventTyping)
            .addEventListener(container, 'focus', inputEvents.onFocus)
            .addEventListener(container, 'focusout', inputEvents.onFocusOut);
    }

    const createCalendar = function (year, month, week, container) {
        const headers = ["Monday", "Tuesday", 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const table = createTable(headers);
        const currentDate = new Date();

        appendCaption(table, year, month, week);
        addHeaders(table, headers);
        fillTable(table, year, month, week, eventOrganizer.showEventWindow, currentDate);
        deleteChildElements(container);
        DOMlibrary.appendElement(container, table);
        return table;
    }

    const showCalendar = function (year, month, week) {
        const container = DOMlibrary.get(containerQuery);
        if(container.tagName.toLowerCase() === 'input') {
            createDatepicker(year, month, container);
            return;
        }
        
        createCalendar(year, month, week, container);        
    }

    //Initial
    ;(function () {
        let currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();
        
        showCalendar(year, month, null);
    })();
};