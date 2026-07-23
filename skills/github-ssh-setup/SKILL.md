---
name: github-ssh-setup
description: Safely configure, repair, rotate, and verify SSH authentication for GitHub on a new or existing computer. Use when setting up GitHub SSH access, fixing Permission denied (publickey), adding a machine-specific key, configuring ssh-agent or macOS Keychain, handling multiple GitHub accounts with host aliases, uploading a public key with GitHub CLI, or testing Git-over-SSH connectivity.
---

# GitHub SSH Setup

Configure GitHub SSH access without exposing private keys or overwriting working
configuration. Prefer a distinct key for each computer instead of copying a
private key between machines.

## Safety rules

- Never print, copy, upload, or directly display the contents of a private key.
  Use `ssh-keygen` only for derivation and fingerprint metadata.
- Treat only files ending in `.pub` as uploadable public keys.
- Preserve existing keys and SSH configuration. Stop on an unmanaged exact
  `Host` conflict instead of guessing which identity should win.
- Keep passphrases out of command arguments, logs, environment variables, and
  repository files. Let `ssh-keygen` prompt interactively.
- Confirm the active GitHub account before uploading a public key.
- Do not change Git remotes unless the user asks.

## Workflow

### 1. Inspect before changing anything

Determine the operating system and inspect only safe metadata:

```bash
uname -s
command -v ssh ssh-keygen ssh-add git gh
git config --global --get user.email || true
find "${HOME}/.ssh" -maxdepth 1 -type f -name '*.pub' -print 2>/dev/null
ssh-add -l 2>/dev/null || true
gh auth status 2>/dev/null || true
```

List private-key filenames only when needed; never read their contents. If the
user already has a candidate identity, inspect its public-key fingerprint with
`ssh-keygen -lf <key>.pub`.

### 2. Choose the identity

Use the email associated with the intended GitHub account as a key comment. If
it is unavailable or multiple accounts are possible, ask which account to use.

Default to:

- Host: `github.com`
- Host alias: `github.com`
- Key: `~/.ssh/id_ed25519_github`

Reuse an existing key only when the user identifies it or its public-key
fingerprint is already registered to the intended account. For separate
personal and work accounts, use distinct keys and aliases such as
`github-personal` and `github-work`.

For rotation, choose a new filename, add and test the new public key first, and
remove the old GitHub key only when the user explicitly asks after successful
verification.

### 3. Preview the local setup

Resolve `scripts/setup_github_ssh.sh` relative to this `SKILL.md`, regardless of
the user's current working directory. Run it without `--apply` first:

```bash
bash scripts/setup_github_ssh.sh --email "USER@EXAMPLE.COM"
```

For a separate account:

```bash
bash scripts/setup_github_ssh.sh \
  --email "USER@COMPANY.COM" \
  --host-alias github-work \
  --key-file "${HOME}/.ssh/id_ed25519_github_work"
```

Review the exact key path, SSH host block, and any conflict reported by the
preview.

### 4. Apply the local setup

When the preview is correct and the request authorizes configuration changes,
rerun with `--apply`:

```bash
bash scripts/setup_github_ssh.sh --email "USER@EXAMPLE.COM" --apply
```

Let the user enter a secure passphrase directly into `ssh-keygen`. The script:

- creates an Ed25519 key only when the selected private key does not exist;
- never overwrites an existing key;
- maintains one marked block at the top of `~/.ssh/config`;
- backs up an existing config before changing it;
- applies restrictive permissions;
- adds the key to the available SSH agent and macOS Keychain when supported.

Use `--empty-passphrase` only when the user explicitly requests an unencrypted
key and understands the tradeoff. Use `--no-agent` when agent integration is
unwanted or unavailable. Run `bash scripts/setup_github_ssh.sh --help` for all
options.

### 5. Add the public key to the intended GitHub account

First verify the authenticated account:

```bash
gh auth status --hostname github.com
gh api --hostname github.com user --jq .login
```

Require the API result to name the intended GitHub username. If it is correct,
upload only the `.pub` file with a descriptive, machine-specific title:

```bash
machine_name=$(hostname -s)
gh ssh-key add "${HOME}/.ssh/id_ed25519_github.pub" \
  --title "${machine_name} - authentication" \
  --type authentication
```

If `gh` is unavailable or authenticated to the wrong account, copy the public
key with the script's `--copy-public-key` option and use GitHub's SSH key
settings in the intended browser session. Never upload on behalf of an
ambiguous account.

### 6. Verify end to end

On the first connection, compare the displayed host fingerprint with GitHub's
current published SSH fingerprints before accepting it. Then run:

```bash
ssh -T git@github.com
```

For an alias, replace the host:

```bash
ssh -T git@github-work
```

GitHub's successful authentication message normally accompanies exit status
`1` because GitHub does not provide shell access. Judge success by the message,
confirm that it names the intended username, and do not treat status `1` alone
as failure.

When adding a second account, retest `ssh -T git@github.com` and confirm the
original account still works. When an authorized repository is known, verify
repository access without changing it:

```bash
git ls-remote git@github-work:OWNER/REPOSITORY.git
```

For multi-account aliases, repository SSH remotes must use the alias:

```text
git@github-work:OWNER/REPOSITORY.git
```

### 7. Report the result

Report:

- the selected host alias and public-key fingerprint;
- whether the key was created or reused;
- whether SSH config and agent setup succeeded;
- which GitHub username authenticated;
- any remaining manual step.

Do not include the private key or its contents in the report.

## Troubleshooting

- For `Permission denied (publickey)`, run
  `ssh -vT git@HOST_ALIAS` and report identity-selection lines without exposing
  key material.
- For the wrong GitHub account, inspect `ssh -G HOST_ALIAS` and verify
  `identityfile`, then check the public-key fingerprint against the intended
  account.
- For a passphrase prompt on every use, verify `ssh-add -l`; on macOS, re-add
  with `ssh-add --apple-use-keychain KEY_FILE`.
- For repositories still using HTTPS, explain the difference and change the
  remote only if requested.

## Bundled script

Use `scripts/setup_github_ssh.sh` for deterministic, idempotent local setup on
macOS and Linux with OpenSSH. On unsupported platforms, follow the same safety
rules and perform equivalent native steps instead of forcing the script.
