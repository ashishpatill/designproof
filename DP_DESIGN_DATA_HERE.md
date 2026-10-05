# dp-design-data

If your IDE shows the workspace as `/volumes/developer/workspace`, open:

**`/volumes/developer/workspace/dp-design-data`**

Same files also at:
- `developer-drop/dp-design-data/`
- `developer-drop/dp-design-data.tar.gz`

Pull latest branch if the folder looks empty:

```bash
git fetch origin cursor/design-training-data-plan-3774
git checkout cursor/design-training-data-plan-3774
ls dp-design-data/src
```

Push to your private repo:

```bash
cd /volumes/developer/workspace/dp-design-data
git init -b main
git remote add origin https://github.com/ashishpatill/tell-design-data.git
git add -A
git commit -m "feat: local Design Proof design training-data harness"
git push -u origin main
```
