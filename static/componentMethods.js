import {additionalComponents, defineAnchorBehaviour} from "./index.js";

/* ================================ CONSTANTS =============================== */
const BLOG_URI_REGEX = /^\/blogs\/(?<blog_name>.*)/;
const BLOG_LOCATIONS = "/static/pages/blogs/";
const PAGE_FILE_EXT = ".html";

/* -------------------------------------------------------------------------- */
/*                        ON COMPONENT CREATION METHODS                       */
/* -------------------------------------------------------------------------- */
/**
 * An object consisting of functions which share their names with the id
 * attributes of components in the web app. When a component is first created
 * by the hash router, it attempts to call its corresponding method from this
 * onCreates object.
 */
const onCreates = {

    home: (page) => {
    },
};

/* -------------------------------------------------------------------------- */
/*                          ON COMPONENT LOAD METHODS                         */
/* -------------------------------------------------------------------------- */
/**
 * An object consisting of functions which share their names with the id
 * attributes of components in the web app. Whenever a component is loaded
 * by the hash router, it attempts to call its corresponding method from this
 * onLoads object.
 */
const onLoads = {

    home: (page) => {
    },

    blog: async (page) => {
        const pageContent = page.querySelector('div.content');

        // clear page
        while (pageContent.hasChildNodes()) {
            pageContent.firstChild.remove();
        }

        // loading shite
        document.querySelector("main").append(additionalComponents.loader);

        const { blog_name: blogName } = BLOG_URI_REGEX.exec(decodeURIComponent(window.location.pathname)).groups;
        const ajaxPath = BLOG_LOCATIONS + blogName + PAGE_FILE_EXT;

        try {
            const res = await fetch(ajaxPath);
            if (res.status === 404) return 404;
            if (!res.ok) {
                throw new Error(`Ajax Error: ${ajaxPath} Status ${res.status} ${res.statusText}`);
            }
            const html = await res.text();

            // remove loader
            additionalComponents.loader.remove();

            // parse fetched document and add to dom
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            document.title = doc.title;
            doc.body.childNodes.forEach(element => {
                if (element.nodeType === 1) { // normal node
                    pageContent.append(element);
                }
                else if (element.nodeType === 3) { // text node
                    pageContent.append(document.createTextNode(element.textContent));
                }
            });

            defineAnchorBehaviour(doc);

        } catch (e) {
            console.error(e);
        }
    }
};

export {onCreates, onLoads};