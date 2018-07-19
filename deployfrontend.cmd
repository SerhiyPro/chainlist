robocopy src docs /e
robocopy build\contracts docs
git add .
git commit -m "Adding frontend files to Github pages"
git push
