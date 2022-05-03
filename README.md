# textlint-rule-rousseau [![Actions Status: test](https://github.com/textlint-rule/textlint-rule-rousseau/workflows/test/badge.svg)](https://github.com/textlint-rule/textlint-rule-rousseau/actions?query=workflow%3A"test")

A [textlint](https://github.com/textlint/textlint "textlint") rule check english sentence using [rousseau](https://github.com/GitbookIO/rousseau "rousseau").

## What does checked?

See [Checks](https://github.com/GitbookIO/rousseau#checks "Checks") of rousseau.

### Example

> So the cat was stolen.

Lint results:

```
$ textlint --rule textlint-rule-rousseau README.md

textlint-rule-rousseau: omit 'So' from the beginning of sentences
/Users/textlint-rule/.ghq/github.com/textlint-rule/textlint-rule-rousseau/README.md:11:1
        v
    10.
    11. So the cat was stolen.
    12.
        ^

textlint-rule-rousseau: "was stolen" may be passive voice
Suggestions:
=> stole
/Users/textlint-rule/.ghq/github.com/textlint-rule/textlint-rule-rousseau/README.md:11:12
                   v
    10.
    11. So the cat was stolen.
    12.
                   ^
```


## Installation

    npm install textlint-rule-rousseau

## Usage

Via `.textlintrc`(Recommended)


```json
{
    "rules": {
        "rousseau": {
            "showLevels": ["suggestion", "warning", "error"]
        }
    }
}
```

Via CLI

```
textlint --rule rousseau README.md
```

## Options

### showLevels

Level of importance

- "suggestion",
- "warning"
- "error"

```json
{
    "rules": {
        "rousseau": {
            "showLevels": ["suggestion", "warning", "error"]
        }
    }
}
```

### ignoreTypes

See https://github.com/GitbookIO/rousseau#checks

```json
{
    "rules": {
        "rousseau": {
            "ignoreTypes": ["sentence:uppercase"]
        }
    }
}
```

## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT