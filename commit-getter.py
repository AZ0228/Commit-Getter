import requests
import os
import sys
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

#load environment variables from .env file
load_dotenv()

#fetch environment variables
username = os.getenv('GITHUB_USERNAME')
token = os.getenv('GITHUB_TOKEN')
threshold = int(os.getenv('SIGNIFICANT_THRESHOLD', 10))  #default to 10 if not set
#calculate the default start date as 7 days ago in y-m-d format
default_start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
start_date = os.getenv('START_DATE', default_start_date)
default_end_date = datetime.now().strftime('%Y-%m-%d')  #default to today if not set
end_date = os.getenv('END_DATE', default_end_date)

#fetch repository name from command line args
if len(sys.argv) < 3:
    print("Usage: python script.py <repository_name>")
    sys.exit(1)
repo = sys.argv[1]
branch = sys.argv[2]

#set up the headers with your authentication token
headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json'
}

# Function to fetch commits with pagination
def fetch_commits(url):
    commits = []
    while url:
        response = requests.get(url, headers=headers)
        page_commits = response.json()
        if not page_commits or isinstance(page_commits, dict):  # handle error or empty response
            break
        commits.extend(page_commits)
        if 'next' in response.links:
            url = response.links['next']['url']
        else:
            break
    return commits

#URL to fetch commits from
url = f'https://api.github.com/repos/{repo}/commits?sha={branch}&since={start_date}T00:00:00Z&until={end_date}T23:59:59Z&author={username}'
print(url)

all_commits = fetch_commits(url)

#filter and process commits
significant_commits = []
for commit in all_commits:
    commit_url = commit['url']
    commit_details = requests.get(commit_url, headers=headers).json()
    stats = commit_details.get('stats', {})
    if stats.get('total', 0) >= threshold:
        significant_commits.append({
            'sha': commit['sha'],
            'date': commit['commit']['author']['date'],
            'message': commit['commit']['message'],
            'total_changes': stats['total']

        })


valid = 0
invalid = 0

#append valid URLs to files
filepath = 'urls.json'
if not os.path.exists(filepath):
    with open(filepath, 'w') as file:
        json.dump([], file)


with open('urls.txt', 'a') as file, open('urls.json', 'r+') as json_file:
    try:
        existing_data = json.load(json_file)  #load existing data
    except json.JSONDecodeError:
        existing_data = []  #handle empty or invalid file

    json_data = []
    for commit in significant_commits:
        url = f'https://github.com/{repo}/commit/{commit["sha"]}'
        response = requests.get(url)

        if response.status_code == 200:
            json_data.append(commit)
            file.write(url + '\n')
            valid += 1
        else:
            if(response.status_code == 406):
                print(f'Possible Invalid URL flagged: {url} - Status Code: {response.status_code}')
                json_data.append(commit)
                file.write(url + '\n')
                valid += 1
            else:
                print(f'Invalid URL: {url} - Status Code: {response.status_code}')
                invalid += 1


    #combine old and new data
    combined_data = existing_data + json_data

    #rewind file to start and truncate to overwrite with updated data
    json_file.seek(0)
    json_file.truncate()
    json.dump(combined_data, json_file, indent=4)  # Write JSON data as an array

print(f'Total significant commits: {len(json_data)}')
print(f'Valid URLs: {valid}')
print(f'Invalid URLs: {invalid}')
# for commit in json_data:
#     print(f'https://github.com/{username}/{repo}/commit/{commit["sha"]}')
