import type { Denovo } from "https://deno.land/x/denovo_core@v0.0.4/mod.ts";
import { assertString } from "https://deno.land/x/unknownutil@v2.1.1/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

type Config = z.infer<typeof Config>;
type Snippet = z.infer<typeof Snippet>;
const Snippet = z.object({
  name: z.string().optional(),
  keyword: z.string(),
  snippet: z.string(),
});
const Config = z.object({
  snippets: Snippet.array().optional(),
});

function isConfig(x: unknown): x is Config {
  return Config.safeParse(x).success;
}

let config: Config = {};

export function main(denovo: Denovo): Promise<void> {
  if (isConfig(denovo.config)) {
    config = denovo.config;
  }
  denovo.dispatcher = {
    async expand(lbuffer, rbuffer): Promise<void> {
      lbuffer = lbuffer ?? "";
      rbuffer = rbuffer ?? "";
      assertString(lbuffer);
      assertString(rbuffer);
      const succeeded = await expand(denovo, lbuffer, rbuffer);
      if (!succeeded) {
        denovo.eval("zle self-insert; zle redisplay");
      }
    },
    async "expand-and-accept-line"(lbuffer, rbuffer): Promise<void> {
      lbuffer = lbuffer ?? "";
      rbuffer = rbuffer ?? "";
      assertString(lbuffer);
      assertString(rbuffer);
      await expand(denovo, lbuffer, rbuffer);
      denovo.eval("zle accept-line; zle redisplay");
    },
  };
  return Promise.resolve();
}

function selfinsert(denovo: Denovo): Promise<string> {
  return denovo.eval("zle self-insert; zle redisplay");
}

async function expand(
  denovo: Denovo,
  lbuffer: string,
  rbuffer: string,
): Promise<boolean> {
  if (config.snippets == null) {
    return false;
  }
  if (/(^$|^\s)/.test(lbuffer) || !/(^$|^\s)/.test(rbuffer)) {
    return false;
  }
  const tokens = lbuffer.split(/\s/);
  if (tokens.length !== 1) {
    return false;
  }
  const word = tokens[0];

  for (const { keyword, snippet } of config.snippets) {
    if (keyword !== word) {
      continue;
    }
    await denovo.eval(`LBUFFER="${snippet} "; zle redisplay`);
    return true;
  }
  return false;
}
