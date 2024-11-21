module.exports = {
  branches: ["develop", { name: "hotfix/*" }, { name: "release/*" }],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [{ type: "*", release: "patch" }],
      },
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git",
    "@semantic-release/npm",
  ],
};
