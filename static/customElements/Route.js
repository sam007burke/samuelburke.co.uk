import { onCreates, onLoads } from "../componentMethods.js";
import {defineAnchorBehaviour} from "../index.js";

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
 */
class Route extends HTMLElement {

    constructor() {
        super();
        this.subRoutes = {};

        // add sub-routes by looking at child nodes
        for (const child of this.childNodes) {
            if (child.nodeName !== 'SPA-ROUTE') {
                continue;
            }
            if (!child.attributes.path) {
                throw new Error("Route must define path.");
            }

            this.addRoute(child);
        }

        // get the element associated with this route
        // (i.e. the one to be rendered) then remove it from the document
        this.element = this.attributes.element ? document.querySelector(`div#components > div#${this.attributes.element.nodeValue}`) : undefined
        this.element?.remove();

        // set onLoad method if it exists
        // this.onLoad is called whenever this page is rendered
        this.onLoad = onLoads[this.attributes.element?.nodeValue];
        
        // execute the onCreate method if exists
        // this.onCreate is called only when the route is created
        this.onCreate = onCreates[this.attributes.element?.nodeValue];
        if (this.onCreate) {
            this.onCreate(this.element);
        }

        if (this.element) {
            defineAnchorBehaviour(this.element);
        }
    }

    addRoute(route) {
        const path = route.attributes.path.nodeValue.split('/');

        // remove empty strings at front
        while (path.length > 0 && path[0] == "" || path[0] == "#") {
            path.splice(0, 1);
        }

        // recursive base case 1 - empty path forwards all requests to next route
        if (path.length === 0) {

            // exceptional case - empty path already defined
            if (this.subRoutes[''] !== undefined) {
                throw new Error("Path already defined.");
            }

            this.subRoutes[''] = route;
            return;
        }

        // exceptional case - path already defined
        if (this.subRoutes[path[0]] !== undefined) {
            throw new Error("Path already defined.");
        }

        // recursive base case 2 - route is set as a sub-route of this route
        if (path.length === 1) {
            this.subRoutes[path[0]] = route;
            return;
        }

        // if the next part of the path is not yet in our existing subroutes,
        // then create a new one.
        this.subRoutes[path[0]] = this.subRoutes[path[0]] || new Route();

        // recursively call the addRoute method on the next route along in
        // the path.
        this.subRoutes[path[0]].addRoute(path.slice(1).join('/'), route);
    }

    getRouteByPath(path) {
        if (typeof path === "string") {
            path = path.split('/');
        }

        // remove empty strings at front
        while (path.length > 0 && path[0] == "" || path[0] == "#") {
            path.splice(0, 1);
        }
        
        // recursive base case - if at end of path return this route
        if (path.length === 0) {
            return this;
        }

        // return either:
        return this.subRoutes[path[0]]?.getRouteByPath(path.slice(1)) // the recursive result of the next subroute,
            || this.subRoutes['*']?.getRouteByPath(path.slice(1)) // the recursive result of the wildcard subroute,
            || this.subRoutes['']?.getRouteByPath(path) // or the recursive result of the empty subroute
    }
}

export default Route;