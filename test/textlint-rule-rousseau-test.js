// LICENSE : MIT
"use strict";
var TextLintTester = require("textlint-tester");
var tester = new TextLintTester();
// rule
import rule from "../src/textlint-rule-rousseau";
// ruleName, rule, { valid, invalid }
tester.run("rousseau", rule, {
    valid: [
        "This is pen.",
        {
            // no error
            text: "So the cat was stolen.",
            options: {
                showLevels: []
            }
        }
    ],
    invalid: [
        {
            text: "this is pen.",
            errors: [
                {
                    message: `[error] sentence should start with an uppercase letter
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
                    message: `[suggestion] omit 'So' from the beginning of sentences`
                },
                {
                    message: `[warning] "was stolen" may be passive voice\nSuggestions:\n=> stole`
                }
            ]
        }, {
            text: `There are a pen.
A number of pen.`,
            errors: [
                {
                    message: `[suggestion] "A number of" has a simpler alternative\nSuggestions:\n=> Many, some`,
                    line: 2,
                    column: 1
                }
            ]
        }
    ]
});