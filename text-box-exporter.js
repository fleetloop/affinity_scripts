/**
 * name: Text Box Exporter
 * description: Designed for making Picture Book dummies/mockups: Roundtrip editing between the Affinty Layout persona and your favourite text editor. Exports all the text boxes in reading order, left-to-right, top-to-bottom, to an alert prompt for easy cut/paste into your text editor.
 * version: 1.0.0
 * author: Craig Macnaughton
 */

// --- Your code starts here ---
function exportLayers() {
    // ...
}



'use strict';

const dom = require('affinity:dom');
const storyApi = require('affinity:story');

const DocumentApi = dom.DocumentApi;
const DocumentNodeApi = dom.DocumentNodeApi;
const NodeApi = dom.NodeApi;

const FrameTextNodeApi = dom.FrameTextNodeApi;
const ArtTextNodeApi = dom.ArtTextNodeApi;

const StoryInterfaceApi = dom.StoryInterfaceApi;
const TextFrameInterfaceApi = dom.TextFrameInterfaceApi;
const SpreadNodeApi = dom.SpreadNodeApi;


function main() {

    try {

        const doc =
            DocumentApi.getCurrent();

        const root =
            DocumentApi.getRootNode(doc);

        const pageCount =
            DocumentNodeApi.getPageCount(root);

        const items = [];

        let nodesVisited = 0;


        function extractText(node) {

            try {

                const storyInterface =
                    StoryInterfaceApi.fromNode(node);

                const story =
                    StoryInterfaceApi.getStory(
                        storyInterface
                    );

                const length =
                    storyApi.StoryApi.getLength(
                        story
                    );

                if (length <= 0) {
                    return "";
                }

                return storyApi.StoryApi.getText(
                    story,
                    0,
                    length,
                    "plainText"
                );

            } catch (e) {

                return "";
            }
        }


        function getPageAndPosition(node) {

            try {

                const box =
                    NodeApi.getSpreadBaseBox(
                        node,
                        false
                    );

                const textFrame =
                    TextFrameInterfaceApi.fromNode(
                        node
                    );

                const spread =
                    TextFrameInterfaceApi.getSpreadNode(
                        textFrame
                    );

                const pageIndex =
                    SpreadNodeApi.getPageIndexOfBox(
                        spread,
                        box,
                        false
                    );

                return {
                    page: pageIndex,
                    x: box.x,
                    y: box.y
                };

            } catch (e) {

                return null;
            }
        }


        function walk(node) {

            if (!node) return;

            nodesVisited++;


            let isTextObject = false;


            // Frame Text
            try {

                if (
                    FrameTextNodeApi.fromNode(node)
                ) {
                    isTextObject = true;
                }

            } catch (e) {
                // Not Frame Text.
            }


            // Art Text
            if (!isTextObject) {

                try {

                    if (
                        ArtTextNodeApi.fromNode(node)
                    ) {
                        isTextObject = true;
                    }

                } catch (e) {
                    // Not Art Text.
                }
            }


            if (isTextObject) {

                const position =
                    getPageAndPosition(node);

                if (position) {

                    const text =
                        extractText(node);

                    if (
                        text &&
                        text.trim().length > 0
                    ) {

                        items.push({
                            page: position.page,
                            x: position.x,
                            y: position.y,
                            text: text
                        });
                    }
                }
            }


            // Walk children
            try {

                let child =
                    NodeApi.getFirstChild(node);

                while (child) {

                    walk(child);

                    child =
                        NodeApi.getNextSibling(child);
                }

            } catch (e) {
                // No children.
            }
        }


        walk(root);


        // Reading order:
        // 1. Page
        // 2. Top to bottom
        // 3. Left to right

        items.sort(function(a, b) {

            if (a.page !== b.page) {
                return a.page - b.page;
            }

            if (a.y !== b.y) {
                return a.y - b.y;
            }

            return a.x - b.x;
        });


        // Build manuscript

        let manuscript = "";

        for (let i = 0; i < items.length; i++) {

            if (i > 0) {
                manuscript += "\n\n";
            }

            manuscript +=
                items[i].text.trim();
        }


        const header =
            "MANUSCRIPT EXPORT\n\n" +
            "Text objects: " +
            items.length +
            "\n" +
            "Pages: " +
            pageCount +
            "\n\n";

        const footer =
            "\n\n" +
            "Press Cmd+A, then Cmd+C to copy the complete manuscript.";


        prompt(
            header +
            manuscript +
            footer,
            manuscript
        );


    } catch (e) {

        alert(
            "EXPORT ERROR:\n\n" +
            String(e) +
            "\n\nStack:\n" +
            (e.stack || "none")
        );
    }
}


main();
