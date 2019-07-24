workflow "PR Validation" {
  on = "pull_request"
  resolves = ["Validate PR"]
}

action "Validate PR" {
  uses = "./validate-pr"
  secrets = ["GITHUB_TOKEN"]
}