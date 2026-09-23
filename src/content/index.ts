import { capstone } from "./modules/capstone";
import { ethics } from "./modules/ethics";
import { foundations } from "./modules/foundations";
import { realWorld } from "./modules/real-world";
import { tools } from "./modules/tools";
import type { Module } from "./types";

export const modules: Module[] = [foundations, tools, ethics, realWorld, capstone];

export function getModule(slug: string): Module | undefined {
  return modules.find((module) => module.slug === slug);
}
