import type { Denovo } from "https://deno.land/x/denovo_core@v0.0.4/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

type Config = z.infer<typeof Config>;
const Config = z.object({});

function isConfig(x: unknown): x is Config {
  return Config.safeParse(x).success;
}

let config: Config = {};

export function main(denovo: Denovo): Promise<void> {
  if (isConfig(denovo.config)) {
    config = denovo.config;
  }
  denovo.dispatcher = {};
  return Promise.resolve();
}
