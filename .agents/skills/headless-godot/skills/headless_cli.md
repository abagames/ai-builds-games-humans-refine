# Headless CLI

Recommended CLI shape (aligned with official docs):
```bash
mkdir -p logs && godot --headless --path <PROJECT_DIR> --script <SCRIPT_PATH> -- <ARGS...> 2>&1 | tee logs/run.log
```

Conventions:
- Write scripts assuming **relative paths resolve from `project.godot` (= the project root)**
- If `--headless` is unavailable, use `--display-driver headless --audio-driver Dummy` instead
- Scripts run via `--script` must always `quit(0|1)` (never hang)
- In sandbox/CI environments where `user://`, `~/.local`, or `~/.cache` may be unavailable, set `XDG_DATA_HOME` / `XDG_CONFIG_HOME` / `XDG_CACHE_HOME` under `<PROJECT_DIR>`

XDG-safe wrapper (recommended in sandbox/CI):
```bash
mkdir -p <PROJECT_DIR>/.tmp-godot-data <PROJECT_DIR>/.tmp-godot-config <PROJECT_DIR>/.tmp-godot-cache logs
XDG_DATA_HOME=<PROJECT_DIR>/.tmp-godot-data \
XDG_CONFIG_HOME=<PROJECT_DIR>/.tmp-godot-config \
XDG_CACHE_HOME=<PROJECT_DIR>/.tmp-godot-cache \
godot --headless --path <PROJECT_DIR> --script <SCRIPT_PATH> -- <ARGS...> 2>&1 | tee logs/run.log
```

Known script warnings:
- `Failed to open 'user://logs/...'` followed by a crash is an environment failure; re-run with the XDG-safe wrapper before debugging project code
- `RID/Object leak` warnings can appear after `--script` scene generation/saving even when execution succeeds
- If exit code is `0` and expected outputs were generated, treat this as a known warning (not an immediate failure)
- If exit code is non-zero, or expected test output is missing, treat as failure regardless of warning type
- Prefer reducing leaks by explicitly freeing temporary nodes/resources and keeping script lifetime short before `quit(0|1)`

Minimal sanity checks:
```bash
godot --version
mkdir -p logs && godot --headless --path <PROJECT_DIR> --version 2>&1 | tee logs/version.log
```
