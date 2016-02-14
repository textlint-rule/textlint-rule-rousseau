// LICENSE : MIT
"use strict";
import {RuleHelper} from "textlint-rule-helper"
import StringSource from "textlint-util-to-string";
import rousseau from "rousseau";
const defaultOptions = {
    showLevels: ["error", "warnings", "suggestion"]
};
export default function textlintRousseau(context, options) {
    const helper = new RuleHelper(context);
    const {Syntax, RuleError, report, getSource} = context;
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
        var paddingPosition = source.originalPositionFromIndex(result.index);
        const suggestions = createSuggest(result.replacements);
        const ruleError = new RuleError(result.message + suggestions, {
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
            const source = new StringSource(node);
            const text = source.toString();
            const reportSourceError = reportError.bind(null, node, source);
            rousseau(text, function (err, results) {
                if (err) {
                    throw err;
                }
                results.forEach(reportSourceError);
            });
        }
    }
}