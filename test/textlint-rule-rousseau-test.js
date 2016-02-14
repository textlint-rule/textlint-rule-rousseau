// LICENSE : MIT
"use strict";
var TextLintTester = require("textlint-tester");
var tester = new TextLintTester();
// rule
import rule from "../src/textlint-rule-rousseau";
// ruleName, rule, { valid, invalid }
tester.run("rousseau", rule, {
    valid: [
        "This is pen."
    ],
    invalid: [
        {
            text: "this is pen.",
            errors: [
                {
                    message: `sentence should start with an uppercase letter
Suggestions:
=> This`,
                    line: 1,
                    column: 1
                }
            ]
        }, {
            text: "So the cat was stolen.",
            errors: [
                {
                    message: `omit 'So' from the beginning of sentences`
                },
                {
                    message: `"was stolen" may be passive voice\nSuggestions:\n=> stole`
                }
            ]
        }, {
            text: `There are a pen.
A number of pen.`,
            errors: [
                {
                    message: `"A number of" has a simpler alternative\nSuggestions:\n=> Many, some`,
                    line: 2,
                    column: 1
                }
            ]
        }
    ]
});