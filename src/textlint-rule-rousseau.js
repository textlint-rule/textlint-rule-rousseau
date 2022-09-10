// LICENSE : MIT
"use strict";
import { RuleHelper, IgnoreNodeManager } from "textlint-rule-helper";
import { StringSource } from "textlint-util-to-string";
import rousseau from "@textlint-rule/rousseau";
import map from "unist-util-map";

const defaultOptions = {
    // "suggestion", "warning", "error"
    showLevels: ["suggestion", "warning", "error"],
    // ignore check type of https://github.com/GitbookIO/rousseau#checks
    ignoreTypes: [],
    // ignore textlint's node type
    ignoreInlineNodeTypes: ["Code"]
};

const mapNode = function (ast, mapFn) {
    return (function preorder(node, index, parent) {
        const newNode = Object.assign({}, mapFn(node, index, parent));
        if (node.children) {
            newNode.children = node.children.map(function (child, index) {
                return preorder(child, index, node);
            });
        }
        return newNode;
    }(ast, null, null));
};

module.exports = function textlintRousseau(context, options = defaultOptions) {
    const helper = new RuleHelper(context);
    const ignoreNodeManager = new IgnoreNodeManager();
    const { Syntax, RuleError, report, getSource } = context;
    const showLevels = options.showLevels || defaultOptions.showLevels;
    const ignoreTypes = options.ignoreTypes || defaultOptions.ignoreTypes;
    const ignoreInlineNodeTypes = options.ignoreInlineNodeTypes || [Syntax.Code];
    const isShowType = (type) => {
        return ignoreTypes.indexOf(type) === -1;
    };
    const isShowLevel = (level) => {
        return showLevels.indexOf(level) !== -1;
    };
    /*
     {
         // Type of check that output this suggestion
         type: "so",

         // Level of importance
         // "suggestion", "warning", "error"
         level: "warning",

         // Index in the text
         index: 10,

         // Size of the section in the text
         offset: 2,

         // Message to describe the suggestion
         message: "omit 'So' from the beginning of sentences",

         // Replacements suggestion
         replacements: [
             {
                value: ""
             }
         ]
     }
     */
    const createSuggest = (replacements) => {
        if (replacements.length === 0) {
            return "";
        }
        return "\nSuggestions:\n"
            + replacements.map(({ value }) => {
                return "=> " + value;
            }).join("\n");
    };
    const reportError = (node, source, result) => {
        const level = result.level;
        const type = result.type;
        // if not contains showing options, ignore this result
        if (!isShowLevel(level)) {
            return;
        }
        if (!isShowType(type)) {
            return;
        }
        const index = source.originalIndexFromIndex(result.index);
        // if already ignored, should not report
        if (ignoreNodeManager.isIgnoredIndex(index)) {
            return;
        }
        const suggestions = createSuggest(result.replacements);
        const ruleError = new RuleError(`${level}(${type}) ${result.message}${suggestions}`, {
            index
        });
        report(node, ruleError);
    };
    return {
        [Syntax.Paragraph](node) {
            // ignore if wrapped node types
            if (helper.isChildNode(node, [Syntax.Link, Syntax.Image, Syntax.BlockQuote, Syntax.Emphasis])) {
                return;
            }
            // ignore if contain child node types
            ignoreNodeManager.ignoreChildrenByTypes(node, ignoreInlineNodeTypes);
            // check
            // replace code with dummy code
            // if you want to filter(remove) code, use https://github.com/eush77/unist-util-filter
            const filteredNode = map(node, (node) => {
                if (node.type === Syntax.Code) {
                    // only change `value` to dummy
                    return Object.assign({}, node, {
                        value: new Array(node.value.length + 1).join("x")
                    });
                }
                return node;
            });
            if (!filteredNode) {
                return;
            }
            const source = new StringSource(filteredNode);
            const text = source.toString();
            const reportSourceError = (results) => {
                reportError(node, source, results);
            };
            rousseau(text, function (err, results) {
                if (err) {
                    throw err;
                }
                results.forEach(reportSourceError);
            });
        }
    }
};
