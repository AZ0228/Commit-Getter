# Commit-Getter
### general overview
Tired of manually grabbing links from github for commit summaries or status updates? Commit-Getter allows you to do so automatically, with control over the date, branch, and number of lines changed.  

Commit getter will also check for invalid links for you (a 404 response), so you can be sure that your links work. Make sure to read the full usage documentation before using.
  
note: sometimes github likes to throw a 406 response randomly, usually these links are still valid but commit-getter will flag them (while still adding them to the result) in the terminal output so you can check them yourself, if the links are invalid you'll have to remove them manually

### usage:  
  
make sure you have python and pip installed on your machine, and you are operating from a unix environment like wsl or zsh.  

install dependencies:
```
pip install -r requirements.txt
```
populate .env file, here's an example:
```ini
GITHUB_USERNAME="AZ0228"
GITHUB_TOKEN="github_pat_sdlfksflkjldfkgjlfk" # not a valid token, should be configured to only be able to see public repos
SIGNIFICANT_THRESHOLD="10"
START_DATE="2024-01-25"
END_DATE="2024-04-24"
REPOS="AZ0228/Study-Compass+AZ0228/Portfolio+hack-rpi/HackRPI-Mobile"
BRANCHES="main+main+Hacker-Queue-Development"
PYTHON_EXECUTABLE="python3"
```
run .sh file
```
./run_commit_getter.sh 
```
the output of the script will be stored in 2 different files, `urls.txt`, where the formatted links to all commits will be output (this is what you would copy and paste into your status update or commit summary), and `urls.json`, which will contain more detailed information about each commit such as the sha, exact date and time, commit message, as well as the total changes.
