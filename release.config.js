module.exports = {
  branches: ["master"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "convetionalcommits",
        releaseRules: [{ type: "*", release: "patch" }],
      },
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git",
  ],
};