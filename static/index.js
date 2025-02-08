import Router from "./customElements/Router.js";
import Route from "./customElements/Route.js";

export const additionalComponents = {};



//      ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//      ┃                       MAIN METHOD                        ┃
//      ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

const main = () => {

    defineAnchorBehaviour(document);

    // load in the additional components
    const additionalComponentsDiv = document.querySelector('div#additional-components');
    additionalComponentsDiv.childNodes.forEach(component => {
        if (component.nodeType !== 1) return;
        additionalComponents[component.id] = component;
    });
    additionalComponentsDiv.remove();

    // finally, load whatever page we are on
    Router.instance.loadPage();
};


//      ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//      ┃              SPA LINKS DO NOT CAUSE RELOAD               ┃
//      ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

export const defineAnchorBehaviour = (doc) => {
    // Stop a[spa] tags from reloading the page
    doc.querySelectorAll("a[spa]").forEach(aTag => {
        aTag.onclick = e => {
            e.preventDefault();
            history.pushState({}, "", aTag.href);
        };
    });
}

// Override history.pushState, so that the router can listen for it
const originalPushState = history.pushState;
history.pushState = (...args) => {
    originalPushState.apply(history, args);
    window.dispatchEvent(new Event('pushstate'));
};
window.onpopstate = () => {
    window.dispatchEvent(new Event('pushstate'));
};


//      ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//      ┃                     THE HASH ROUTER                      ┃
//      ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// The hash router is a custom element.
// This app expects there to be a single hash router defined within the body
// of the document. Without a hash router, the main contents of the page
// will fail to load.
// The constructor of the hash router defines the load behaviour of pages.
window.customElements.define("spa-route", Route);
window.customElements.define("spa-router", Router);

window.addEventListener("DOMContentLoaded", main);