workflow "PR Validation" {
  on = "pull_request"
  resolves = ["Validate PR"]
}

action "Validate PR" {
  uses = "./validate-pr"
  secrets = ["GITHUB_TOKEN"]
}

workflow "Notify Slack" {
  on = "issue_comment"
  resolves = ["Notify PR"]
}

action "Notify PR" {
  uses = "./notify-pr"
  secrets = ["GITHUB_TOKEN", "SLACK_TOKEN"]
}
