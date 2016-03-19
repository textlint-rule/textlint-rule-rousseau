// LICENSE : MIT
"use strict";
const {RuleHelper} = require("textlint-rule-helper");
const StringSource = require("textlint-util-to-string").default;
const rousseau = require("rousseau");
const filter = require('unist-util-filter');
const defaultOptions = {
    // "suggestion", "warning", "error"
    showLevels: ["suggestion", "warning", "error"],
    ignoreTypes: []
};
export default function textlintRousseau(context, options = defaultOptions) {
    const helper = new RuleHelper(context);
    const {Syntax, RuleError, report, getSource} = context;
    const showLevels = options.showLevels || defaultOptions.showLevels;
    const ignoreTypes = options.ignoreTypes || defaultOptions.ignoreTypes;
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
                return node.type !== Syntax.Code && node.type !== Syntax.Link;
            });
            if (!filteredNode) {
                return;
            }
            const source = new StringSource(filteredNode);
            const text = source.toString();
            const reportSourceError = (ruleError) => {
                report(node, ruleError);
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