# Quick start

denovo-abbrev is plugin of [denovo.zsh][denovo.zsh]. you need to install
[Deno][deno] and [denovo.zsh][denovo.zsh].

[denovo.zsh]: https://github.com/Warashi/denovo.zsh/
[deno]: https://deno.land/

# Features

- `denovo-abbrev-expand`: expand abbreviations
- `denovo-abbrev-expand-and-accept-line`: expand abbreviations and accept line

# Bindings example

```zsh
bindkey ' '  denovo-abbrev-expand
bindkey '^m' denovo-abbrev-expand-and-accept-line
```

# Options

You can set options in config file: `$XDG_CONFIG_HOME/denovo-abbrev/config.toml` or
`$HOME/.config/denovo-abbrev/config.toml`. For example:

```toml
[abbrev]
[[abbrev.snippets]]
name = "git"
keyword = "g"
snippet = "git"

[[abbrev.snippets]]
name = "ls -l"
keyword = "ll"
snippet = "ls -l"

[[abbrev.snippets]]
name = "ls -al"
keyword = "la"
snippet = "ls -al"
```

# License

The code follows MIT license written in [LICENSE][./LICENSE]. Contributors need
to agree that any modifications sent in this repository follow the license.
