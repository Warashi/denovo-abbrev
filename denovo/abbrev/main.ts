import { parse as parseToml } from "@std/toml";
import { join } from "@std/path";
import { exists } from "@std/fs";

import { asOptional } from "@core/unknownutil/as/optional";
import { ensure } from "@core/unknownutil/ensure";
import { isArrayOf } from "@core/unknownutil/is/array-of";
import { isObjectOf } from "@core/unknownutil/is/object-of";
import { isString } from "@core/unknownutil/is/string";
import { type PredicateType } from "@core/unknownutil/type";

import { type Entrypoint } from "@warashi/denovo-core";

const isSnippet = isObjectOf({
  name: asOptional(isString),
  keyword: isString,
  snippet: isString,
});

const isAbbrev = isObjectOf({
  snippets: asOptional(isArrayOf(isSnippet)),
});

const isConfig = isObjectOf({
  abbrev: asOptional(isAbbrev),
});

type Config = PredicateType<typeof isConfig>;

// Cached config
// undefined: not loaded yet
// null: no config file
// Config: loaded config
let config: Config | null | undefined = undefined;

export const main: Entrypoint = (denovo) => {
  denovo.dispatcher = {
    "expand": async (lbuffer, rbuffer) => {
      if (config === undefined) {
        await loadConfig();
      }
      if (config === null) {
        await denovo.call("eval", `zle self-insert; zle redisplay`);
        return;
      }
      const expanded = expand(
        ensure(config, isConfig),
        ensure(lbuffer, isString),
        ensure(rbuffer, isString),
      );
      if (expanded) {
        await denovo.call(
          "eval",
          `LBUFFER='${expanded}'; zle self-insert; zle redisplay`,
        );
        return;
      }
      await denovo.call("eval", `zle self-insert; zle redisplay`);
    },
    "expand-and-accept-line": async (lbuffer, rbuffer) => {
      if (config === undefined) {
        await loadConfig();
      }
      if (config === null) {
        await denovo.call("eval", `zle accept-line; zle redisplay`);
        return;
      }
      const expanded = expand(
        ensure(config, isConfig),
        ensure(lbuffer, isString),
        ensure(rbuffer, isString),
      );
      if (expanded) {
        await denovo.call(
          "eval",
          `LBUFFER='${expanded}'; zle accept-line; zle redisplay`,
        );
        return;
      }
      await denovo.call("eval", `zle accept-line; zle redisplay`);
    },
  };
  return Promise.resolve();
};

const loadConfig = async () => {
  const home = Deno.env.get("HOME");
  const configHome = Deno.env.get("XDG_CONFIG_HOME");
  if (home == null && configHome == null) {
    config = null;
    return;
  }
  const configPath = join(
    configHome ?? join(ensure(home, isString), ".config"),
    "denovo-abbrev",
    "config.toml",
  );
  if (!(await exists(configPath))) {
    config = null;
    return;
  }
  const parsed = parseToml(await Deno.readTextFile(configPath));
  config = ensure(parsed, isConfig);
};

const expand = (
  config: Config,
  lbuffer: string,
  rbuffer: string,
) => {
  if (config.abbrev?.snippets == null) {
    return undefined;
  }
  if (/(^$|^\s)/.test(lbuffer) || !/(^$|^\s)/.test(rbuffer)) {
    return undefined;
  }
  const tokens = lbuffer.split(/\s/);
  if (tokens.length !== 1) {
    return undefined;
  }
  const word = tokens[0];

  for (const { keyword, snippet } of config.abbrev?.snippets ?? []) {
    if (keyword !== word) {
      continue;
    }
    return snippet;
  }
  return undefined;
};
