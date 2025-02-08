import Route from "./Route.js";

class Router extends Route {

    // singleton class
    static instance = undefined;

    constructor() {
        super();

        // set a static instance attribute and remove hash-router from the page
        if (Router.instance !== undefined) {
            throw new Error("Cannot have multiple routers.");
        }
        Router.instance = this;
        this.remove();

        this.defaultDocumentTitle = document.title;

        document.addEventListener("DOMContentLoaded", () => { this.#onDOMLoaded(); });
    }

    #onDOMLoaded() {
        const components = document.querySelector('div#components');

        // load the 404 page
        this.page404 = components.querySelector('#page404');
        this.page404.remove();

        // remove the components from the page
        components.remove();

        // get the main tag - where the content is rendered
        this.documentMain = document.querySelector('main');
    
        // on location change
        window.addEventListener('pushstate', () => {
            this.loadPage();
        })

        // this.loadPage(); // commenting this out, as i think index.js should be responsible for calling this
    }

    loadPage() {
        const route = super.getRouteByPath(window.location.pathname);
        let page = route?.element;

        // set the title to default (in case it had previously been changed)
        document.title = this.defaultDocumentTitle;

        // if the route is not found
        if (!route) {
            page = this.page404;
        }

        // execute the onLoad method - if there is one
        if (route?.onLoad) {
            if (route.onLoad(route.element) === 404) {
                // the onLoad method indicated that a resource that we tried to retrieve does not exist.
                page = this.page404;
            }
        }

        // remove all children from the main section of the page
        while (this.documentMain.hasChildNodes()) {
            this.documentMain.firstChild.remove();
        }

        // display the page
        if (page) {
            this.documentMain.appendChild(page);
        }

        // ensure page is scrolled to top
        document.querySelector('div#below-header').scrollTo(0, 0);
    }
}

export default Router;