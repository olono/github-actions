workflow "PR Validation" {
  on = "pull_request"
  resolves = ["Validate PR"]
}

action "Validate PR" {
  uses = "./validate-pr"
  secrets = ["GITHUB_TOKEN"]
}

workflow "Status change" {
  on = "status"
  resolves = ["Process status change"]
}

action "Process status change" {
  uses = "./process-status-change"
  secrets = ["SLACK_TOKEN"]
}