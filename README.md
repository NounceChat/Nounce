# ProxiChat
Geolocation Based Chat App with React Typescript and Firebase

## Cloning branch
```shell
git clone https://github.com/GDG-Davao-2022-Project/ProxiChat.git
```

## Before making changes in dev-branch
```shell
git checkout dev-branch # go to dev-branch
git pull origin master # merges main branch with current branch
git push # push changes to the cloud 
```

## Make changes

## After making changes in dev-branch
### Commit and push changes to dev-branch with a commit message either in the vscode git GUI or with the commands...
```shell
git add .
git commit -m "your commit message"
git push
```
### Then...
```shell
git pull origin master  # merges main branch with current branch
git push  # push changes to the cloud 
git checkout master   # change branch to main
git pull  # get recent changes 
git merge dev-branch  # merge changes from dev-branch
git push # push changes to the cloud 
git checkout dev-branch # return to dev-branch
```

### Run
- Go to file directory
```shell
docker compose up
```
