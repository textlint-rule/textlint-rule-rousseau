// LICENSE : MIT
"use strict";
import {RuleHelper} from "textlint-rule-helper"
import StringSource from "textlint-util-to-string";
import rousseau from "rousseau";
const defaultOptions = {
    // "suggestion", "warning", "error"
    showLevels: ["suggestion", "warning", "error"],
    ignoreTypes: [],
    fakeInlineCode: true
};
export default function textlintRousseau(context, options) {
    const helper = new RuleHelper(context);
    const {Syntax, RuleError, report, getSource} = context;
    const showLevels = options.showLevels || defaultOptions.showLevels;
    const ignoreTypes = options.ignoreTypes || defaultOptions.ignoreTypes;
    const fakeInlineCode = options.fakeInlineCode || defaultOptions.fakeInlineCode;
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
        const ruleError = new RuleError(`[${result.level}] ${result.message}${suggestions}`, {
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
            // fake `code`
            if (fakeInlineCode) {
                node.children = node.children.map(childNode => {
                    if (childNode.type === Syntax.Code) {
                        return {
                            type: Syntax.Str,
                            value: "code",
                            raw: "code",
                            loc: childNode.loc,
                            range: childNode.range
                        }
                    }
                    return childNode;
                });
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