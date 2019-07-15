workflow "PR Validation" {
  on = "pull_request"
  resolves = ["Validate PR"]
}

action "Validate PR" {
  uses = "./validate-pr"
  secrets = ["GITHUB_TOKEN"]
}

workflow "Check Suite" {
  on = "check_suite"
  resolves = ["Process check suite"]
}

action "Process check suite" {
  uses = "./process-check-suite"
  secrets = ["SLACK_TOKEN"]
}