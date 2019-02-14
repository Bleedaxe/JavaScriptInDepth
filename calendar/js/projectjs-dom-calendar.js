let DOMlibrary = (function () {
    //Make that to work with classes and tags
    let get = function (criteria) {
        let element = document.querySelector(criteria);
        return element;
    }

    let getById = function (elementId) {
        return document.getElementById(elementId);
    };

    let createElement = function (tagName) {
        let element = document.createElement(tagName);
        return element;
    };

    let appendElement = function (parent, child) {
        parent.appendChild(child);
        return this;
    };

    let removeElement = function (element) {
        element.parentNode.removeChild(element);
        return this;
    }

    let changeElementId = function (element, newId) {
        element.id = newId;
        return this;
    }

    let addClass = function (element, newClass) {
        element.classList.add(newClass);
        return this;
    }

    let removeAllClasses = function (element) {
        element.className = '';
        return this;
    }

    let addData = function (element, propertyName, propertyValue) {
        element.setAttribute(`data-${propertyName}`, propertyValue);
        return this;
    }

    const getData = function (element, name) {
        return element.dataset[name];
    }

    let changeName = function (element, name) {
        element.setAttribute("name", name);
        return this;
    }

    let setAttributeToElement = function (element, name, value) {
        element.setAttribute(name, value);
        return this;
    }

    let changeText = function (element, newTextContent) {
        let textNode = document.createTextNode(newTextContent);
        element.appendChild(textNode);

        return newTextContent;
    }

    let changeInnerHtml = function (element, newHtml) {
        element.innerHTML = newHtml;
        return newHtml;
    }

    let removeStyle = function (element) {
        element.setAttribute("style", "");
        return this;
    }

    let addStyle = function (element, newStyle) {
        let style = element.getAttribute("style") || "";

        if(newStyle === null) {
            return this;
        }

        if (typeof newStyle === "object") {
            let keys = Object.keys(newStyle).map(k => `${k}: ${newStyle[k]};`);
            style = (style === "" ? "" : style + " ") + keys.join(" ");
        }

        if (typeof newStyle === "string") {
            style += " " + newStyle;
        }
        
        element.setAttribute("style", style);
        return this;
    }

    let getParent = function (element) {
        return element.parentNode;
    }

    let getNextSiblin = function (element) {
        return element.nextSibling;
    }

    let getPreviousSibling = function (element) {
        return element.previousSibling;
    }

    let getChild = function (element) {
        return element.childNodes;
    }

    let addEventListener = function (element, eventListener, callback){
        element.addEventListener(eventListener, callback);
        return this;
    }

    let manipulator = {
        get,
        getById,
        createElement,
        appendElement,
        removeElement,
        changeElementId,
        addClass,
        removeAllClasses, 
        addData,
        getData,
        changeName,
        changeText,
        changeInnerHtml,
        removeStyle,
        addStyle,
        setAttributeToElement,
        addEventListener,
        getParent,
        getNextSiblin,
        getPreviousSibling,
        getChild
    };

    return manipulator;
})();