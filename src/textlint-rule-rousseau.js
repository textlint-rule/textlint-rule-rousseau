// LICENSE : MIT
"use strict";
const {RuleHelper} = require("textlint-rule-helper");
const StringSource = require("textlint-util-to-string").default;
const rousseau = require("rousseau");
const filter = require('unist-util-filter');
const defaultOptions = {
    // "suggestion", "warning", "error"
    showLevels: ["suggestion", "warning", "error"],
    // ignore check type of https://github.com/GitbookIO/rousseau#checks
    ignoreTypes: [],
    // ignore textlint's node type
    ignoreInlineNodeTypes: undefined
};
export default function textlintRousseau(context, options = defaultOptions) {
    const helper = new RuleHelper(context);
    const {Syntax, RuleError, report, getSource} = context;
    const showLevels = options.showLevels || defaultOptions.showLevels;
    const ignoreTypes = options.ignoreTypes || defaultOptions.ignoreTypes;
    const ignoreInlineNodeTypes = options.ignoreInlineNodeTypes || [Syntax.Image, Syntax.Code, Syntax.Link];
    const isShowType = (type)=> {
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
            + replacements.map(({value}) => {
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
        const paddingPosition = source.originalPositionFromIndex(result.index);
        const suggestions = createSuggest(result.replacements);
        const ruleError = new RuleError(`${level}(${type}) ${result.message}${suggestions}`, {
            line: paddingPosition.line - 1,
            column: paddingPosition.column
        });
        report(node, ruleError);
    };

    return {
        [Syntax.Paragraph](node){
            if (helper.isChildNode(node, [Syntax.Link, Syntax.Image, Syntax.BlockQuote, Syntax.Emphasis])) {
                return;
            }
            const filteredNode = filter(node, (node) => {
                return ignoreInlineNodeTypes.indexOf(node.type) === -1;
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
}