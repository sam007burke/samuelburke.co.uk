import { additionalComponents } from "./index.js";

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

    blog: (page) => {
        console.log("loading blog page")
        const pageContent = page.querySelector('div.content');

        // clear page
        while (pageContent.hasChildNodes()) {
            pageContent.firstChild.remove();
        }

        // loading shite
        page.append(additionalComponents.loader);

        const { blog_name: blogName } = BLOG_URI_REGEX.exec(decodeURIComponent(window.location.pathname)).groups;
        const ajaxPath = BLOG_LOCATIONS + blogName + PAGE_FILE_EXT;
        fetch(ajaxPath)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Ajax Error: ${ajaxPath} Status ${res.status} ${res.statusText}`);
                }
                return res.text();
            }).then(html => {

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

                // Stop a[spa] tags from reloading the page
                doc.querySelectorAll("a[spa]").forEach(aTag => {
                    aTag.onclick = e => {
                        e.preventDefault();
                        console.log("navigating to spa page: " + aTag.href)
                        history.pushState({}, "", aTag.href);
                    };
                });
                console.log("loaded blog " + document.title)
            }).catch(error => {
                console.error(error);
            });
    }
};

export {onCreates, onLoads};