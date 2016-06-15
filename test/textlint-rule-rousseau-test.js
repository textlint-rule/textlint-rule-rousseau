// LICENSE : MIT
"use strict";
var TextLintTester = require("textlint-tester");
var tester = new TextLintTester();
// rule
import rule from "../src/textlint-rule-rousseau";
// ruleName, rule, { valid, invalid }
tester.run("rousseau", rule, {
    valid: [
        // Code
        "This is `var cat = 'is stolen'`.",// => This is code.
        "This is pen.",
        "This is *pen*.",
        "This is **pen**.",
        "This is __pen__.",
        "`this` is pen.",
        {
            text: "this is pen.",
            options: {
                ignoreTypes: ["sentence:uppercase"]
            }
        },
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
                    message: `error(sentence:uppercase) sentence should start with an uppercase letter
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
                    message: `suggestion(so) omit 'So' from the beginning of sentences`
                },
                {
                    message: `warning(passive) "was stolen" may be passive voice\nSuggestions:\n=> stole`
                }
            ]
        }, {
            text: `There are a pen.
A number of pen.`,
            errors: [
                {
                    message: `suggestion(simplicity) "A number of" has a simpler alternative\nSuggestions:\n=> Many, some`,
                    line: 2,
                    column: 1
                }
            ]
        }, {
            text: `There are a pen.
A number of pen.`,
            errors: [
                {
                    message: `suggestion(simplicity) "A number of" has a simpler alternative\nSuggestions:\n=> Many, some`,
                    line: 2,
                    column: 1
                }
            ]
        },
        {
            text: "this is `pen`.`this is pen code`",
            errors: [
                {
                    message: `error(sentence:uppercase) sentence should start with an uppercase letter
Suggestions:
=> This`,
                    line: 1,
                    column: 1
                }
            ]
        },
    ]
});