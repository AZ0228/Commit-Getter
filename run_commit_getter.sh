#!/bin/bash

#load environment variables from the .env file
if [ -f .env ]; then
    source .env
else
    echo ".env file not found."
    exit 1
fi

#check if the 'repos' environment variable is set
if [ -z "$REPOS" ]; then
    echo "The 'REPOS' environment variable is not set."
    exit 1
fi

#check if the 'BRANCHES' environment variable is set
if [ -z "$BRANCHES" ]; then
    echo "The 'BRANCHES' environment variable is not set."
    exit 1
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "The 'GITHUB_TOKEN' environment variable is not set."
    exit 1
fi

if [ -z "$GITHUB_USERNAME" ]; then
    echo "The 'GITHUB_USER' environment variable is not set."
    exit 1
fi

if [ -z "$PYTHON_EXECUTABLE" ]; then
    echo "The 'PYTHON_EXECUTABLE' environment variable is not set."
    exit 1
fi


#split the 'repos' variable by '+' and iterate over each repo
IFS='+' read -ra REPO_ARRAY <<< "$REPOS"
IFS='+' read -ra BRANCH_ARRAY <<< "$BRANCHES"

#check if the counts of repos and branches match
if [ ${#REPO_ARRAY[@]} -ne ${#BRANCH_ARRAY[@]} ]; then
    echo "The number of repositories and branches do not match."
    exit 1
fi

for i in "${!REPO_ARRAY[@]}"; do
    repo=${REPO_ARRAY[i]}
    branch=${BRANCH_ARRAY[i]}
    echo "Running commit-getter for repository: $repo with branch: $branch"
    $PYTHON_EXECUTABLE commit-getter.py "$repo" "$branch"
done
