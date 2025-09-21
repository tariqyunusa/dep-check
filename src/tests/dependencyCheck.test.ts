import { describe, it, expect } from "vitest";
import { join } from "path";
import { parseNpm } from "../src/utils/Parsers/npm";
import { findUsedDependencies, analyzeDependencies } from "../src/utils/dependencyCheck";

const EXAMPLES_DIR = join(__dirname, "../examples");

describe("Dependency Checker", () => {
  it("detects all used dependencies in example-npm", () => {
    const project = join(EXAMPLES_DIR, "example-npm");

    const installed = parseNpm(project);
    const used = findUsedDependencies(project);
    const { unused, missing } = analyzeDependencies(installed, used);

    expect(used).toContain("express");
    expect(used).toContain("lodash");
    expect(unused).toHaveLength(0);
    expect(missing).toHaveLength(0);
  });

  it("detects unused dependencies in example-unused", () => {
    const project = join(EXAMPLES_DIR, "example-unused");

    const installed = parseNpm(project);
    const used = findUsedDependencies(project);
    const { unused, missing } = analyzeDependencies(installed, used);

    expect(used).toContain("lodash");
    expect(unused).toContain("axios");
    expect(missing).toHaveLength(0);
  });
});
