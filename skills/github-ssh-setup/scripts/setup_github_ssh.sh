#!/usr/bin/env bash

set -euo pipefail

program_name=${0##*/}
apply_changes=false
copy_public_key=false
add_to_agent=true
empty_passphrase=false
email=""
host_name="github.com"
host_alias="github.com"
ssh_dir="${HOME}/.ssh"
key_file=""

usage() {
  cat <<EOF
Usage:
  ${program_name} --email EMAIL [options]

Safely prepare an SSH key and config entry for GitHub. The default mode is a
read-only preview; pass --apply to make changes.

Options:
  --email EMAIL            Comment for a newly generated key. If omitted, use
                           git config --global user.email when available.
  --host-name HOST         SSH server name (default: github.com).
  --host-alias ALIAS       Name used in SSH config (default: github.com).
  --ssh-dir DIRECTORY      SSH directory (default: \$HOME/.ssh).
  --key-file PATH          Private key path (default:
                           SSH_DIR/id_ed25519_github).
  --apply                  Create/update local files.
  --copy-public-key        Copy the public key after setup when a supported
                           clipboard command is available.
  --no-agent               Do not add the key to ssh-agent.
  --empty-passphrase       Generate a new key without a passphrase. Use only
                           when explicitly requested.
  -h, --help               Show this help.
EOF
}

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

warn() {
  printf 'warning: %s\n' "$*" >&2
}

info() {
  printf '%s\n' "$*"
}

require_value() {
  local option=$1
  local value=${2-}
  [[ -n "$value" ]] || die "${option} requires a value"
}

while (($# > 0)); do
  case "$1" in
    --email)
      require_value "$1" "${2-}"
      email=$2
      shift 2
      ;;
    --host-name)
      require_value "$1" "${2-}"
      host_name=$2
      shift 2
      ;;
    --host-alias)
      require_value "$1" "${2-}"
      host_alias=$2
      shift 2
      ;;
    --ssh-dir)
      require_value "$1" "${2-}"
      ssh_dir=$2
      shift 2
      ;;
    --key-file)
      require_value "$1" "${2-}"
      key_file=$2
      shift 2
      ;;
    --apply)
      apply_changes=true
      shift
      ;;
    --copy-public-key)
      copy_public_key=true
      shift
      ;;
    --no-agent)
      add_to_agent=false
      shift
      ;;
    --empty-passphrase)
      empty_passphrase=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "unknown option: $1"
      ;;
  esac
done

for command_name in ssh ssh-keygen; do
  command -v "$command_name" >/dev/null 2>&1 ||
    die "required command not found: ${command_name}"
done

if [[ -z "$email" ]]; then
  email=$(git config --global --get user.email 2>/dev/null || true)
fi
[[ -n "$email" ]] ||
  die "provide --email or set git config --global user.email"

[[ "$email" != *$'\n'* && "$email" != *$'\r'* ]] ||
  die "email must be a single line"
[[ "$host_name" =~ ^[A-Za-z0-9._-]+$ ]] ||
  die "host name contains unsupported characters"
[[ "$host_alias" =~ ^[A-Za-z0-9._-]+$ ]] ||
  die "host alias contains unsupported characters"
[[ "$ssh_dir" = /* ]] || die "SSH directory must be an absolute path"
[[ "$ssh_dir" != *$'\n'* && "$ssh_dir" != *'"'* ]] ||
  die "SSH directory contains unsupported characters"

if [[ -z "$key_file" ]]; then
  key_file="${ssh_dir}/id_ed25519_github"
fi
[[ "$key_file" = /* ]] || die "key file must be an absolute path"
[[ "$key_file" != *.pub ]] || die "--key-file must name the private key"
[[ "$key_file" != *$'\n'* && "$key_file" != *'"'* ]] ||
  die "key file contains unsupported characters"

config_file="${ssh_dir}/config"
public_key="${key_file}.pub"
marker_start="# >>> github-ssh-setup: ${host_alias} >>>"
marker_end="# <<< github-ssh-setup: ${host_alias} <<<"

has_unmanaged_exact_host() {
  local file=$1
  awk \
    -v alias="$host_alias" \
    -v start="$marker_start" \
    -v end="$marker_end" '
      $0 == start { managed = 1; next }
      $0 == end { managed = 0; next }
      managed { next }
      tolower($1) == "host" {
        for (i = 2; i <= NF; i++) {
          if (tolower($i) == tolower(alias)) {
            found = 1
          }
        }
      }
      END { exit(found ? 0 : 1) }
    ' "$file"
}

has_invalid_managed_markers() {
  local file=$1
  awk \
    -v start="$marker_start" \
    -v end="$marker_end" '
      $0 == start {
        starts++
        if (managed) {
          invalid = 1
        }
        managed = 1
        next
      }
      $0 == end {
        ends++
        if (!managed) {
          invalid = 1
        }
        managed = 0
        next
      }
      END {
        if (invalid || managed || starts != ends || starts > 1 || ends > 1) {
          exit 0
        }
        exit 1
      }
    ' "$file"
}

write_managed_block() {
  printf '%s\n' "$marker_start"
  printf 'Host %s\n' "$host_alias"
  printf '  HostName %s\n' "$host_name"
  printf '  User git\n'
  printf '  AddKeysToAgent yes\n'
  if [[ "$(uname -s)" == "Darwin" ]]; then
    printf '  IgnoreUnknown UseKeychain\n'
    printf '  UseKeychain yes\n'
  fi
  printf '  IdentityFile "%s"\n' "$key_file"
  printf '  IdentitiesOnly yes\n'
  printf '%s\n' "$marker_end"
}

info "Mode: $([[ "$apply_changes" == true ]] && printf 'apply' || printf 'preview')"
info "Host: ${host_alias} -> ${host_name}"
info "Private key: ${key_file}"
info "Public key: ${public_key}"
info "SSH config: ${config_file}"

if [[ -e "$public_key" && ! -e "$key_file" ]]; then
  die "public key exists without its private key: ${public_key}"
fi

if [[ -f "$config_file" ]]; then
  if has_invalid_managed_markers "$config_file"; then
    die "invalid or duplicate managed markers in ${config_file}; review them manually"
  fi
  if has_unmanaged_exact_host "$config_file"; then
    die "unmanaged 'Host ${host_alias}' entry already exists in ${config_file}; review it manually"
  fi
fi

if [[ "$apply_changes" != true ]]; then
  if [[ -e "$key_file" ]]; then
    info "Plan: reuse the existing private key without reading or replacing it."
  else
    info "Plan: generate a new Ed25519 key. ssh-keygen will prompt for a passphrase."
  fi
  if [[ -e "$key_file" && ! -e "$public_key" ]]; then
    info "Plan: derive the missing public key from the existing private key."
  fi
  info "Plan: create or update the marked SSH config block; back up an existing config if changed."
  if [[ "$add_to_agent" == true ]]; then
    info "Plan: add the key to the available SSH agent."
  fi
  if [[ "$copy_public_key" == true ]]; then
    info "Plan: copy the public key with an available clipboard command."
  fi
  info "No changes made. Re-run with --apply when this plan is correct."
  exit 0
fi

mkdir -p "$ssh_dir"
chmod 700 "$ssh_dir"

created_key=false
if [[ ! -e "$key_file" ]]; then
  info "Generating a new Ed25519 key at ${key_file}."
  if [[ "$empty_passphrase" == true ]]; then
    ssh-keygen -t ed25519 -C "$email" -f "$key_file" -N ""
  else
    info "Enter a secure passphrase when prompted."
    ssh-keygen -t ed25519 -C "$email" -f "$key_file"
  fi
  created_key=true
else
  info "Reusing existing key; no private key was overwritten."
fi

chmod 600 "$key_file"

if [[ ! -e "$public_key" ]]; then
  info "Deriving the missing public key."
  ssh-keygen -y -f "$key_file" >"$public_key"
elif [[ "$created_key" != true ]]; then
  info "Checking that the existing public key matches its private key."
  derived_public_material=$(
    ssh-keygen -y -f "$key_file" |
      awk 'NF >= 2 { print $1 " " $2; exit }'
  )
  stored_public_material=$(awk 'NF >= 2 { print $1 " " $2; exit }' "$public_key")
  [[ -n "$stored_public_material" ]] ||
    die "public key is invalid: ${public_key}"
  [[ "$derived_public_material" == "$stored_public_material" ]] ||
    die "public key does not match its private key: ${public_key}"
fi

chmod 644 "$public_key"

temporary_files=()
cleanup() {
  local temporary_file
  for temporary_file in "${temporary_files[@]}"; do
    [[ ! -e "$temporary_file" ]] || rm -f -- "$temporary_file"
  done
}
trap cleanup EXIT

cleaned_config=$(mktemp "${TMPDIR:-/tmp}/github-ssh-config-cleaned.XXXXXX")
new_config=$(mktemp "${TMPDIR:-/tmp}/github-ssh-config-new.XXXXXX")
temporary_files+=("$cleaned_config" "$new_config")

if [[ -f "$config_file" ]]; then
  awk \
    -v start="$marker_start" \
    -v end="$marker_end" '
      $0 == start { managed = 1; next }
      $0 == end { managed = 0; next }
      !managed { print }
    ' "$config_file" >"$cleaned_config"
else
  : >"$cleaned_config"
fi

{
  write_managed_block
  if [[ -s "$cleaned_config" ]]; then
    printf '\n'
    cat "$cleaned_config"
  fi
} >"$new_config"

if ! ssh -G -T -F "$new_config" "$host_alias" >/dev/null; then
  die "generated SSH config failed OpenSSH validation"
fi

if [[ -f "$config_file" ]] && cmp -s "$new_config" "$config_file"; then
  info "SSH config is already up to date."
else
  if [[ -f "$config_file" ]]; then
    timestamp=$(date '+%Y%m%d%H%M%S')
    backup_file="${config_file}.backup.${timestamp}"
    if [[ -e "$backup_file" ]]; then
      backup_file="${backup_file}.$$"
    fi
    cp -p "$config_file" "$backup_file"
    info "Backed up the previous SSH config to ${backup_file}."
  fi
  mv "$new_config" "$config_file"
  chmod 600 "$config_file"
  info "Updated ${config_file}."
fi

if [[ "$add_to_agent" == true ]]; then
  if [[ -z "${SSH_AUTH_SOCK:-}" ]]; then
    warn "SSH_AUTH_SOCK is not set; start ssh-agent and add ${key_file} manually"
  elif [[ "$(uname -s)" == "Darwin" ]]; then
    if ssh-add --apple-use-keychain "$key_file"; then
      info "Added the key to ssh-agent and macOS Keychain."
    elif ssh-add "$key_file"; then
      warn "Added the key to ssh-agent, but Keychain integration was unavailable"
    else
      warn "could not add the key to ssh-agent"
    fi
  elif ssh-add "$key_file"; then
    info "Added the key to ssh-agent."
  else
    warn "could not add the key to ssh-agent"
  fi
fi

if [[ "$copy_public_key" == true ]]; then
  if command -v pbcopy >/dev/null 2>&1; then
    pbcopy <"$public_key"
    info "Copied the public key to the clipboard with pbcopy."
  elif command -v wl-copy >/dev/null 2>&1; then
    wl-copy <"$public_key"
    info "Copied the public key to the clipboard with wl-copy."
  elif command -v xclip >/dev/null 2>&1; then
    xclip -selection clipboard <"$public_key"
    info "Copied the public key to the clipboard with xclip."
  else
    warn "no supported clipboard command found; public key is ${public_key}"
  fi
fi

fingerprint=$(ssh-keygen -lf "$public_key")
info "Public key fingerprint: ${fingerprint}"
info "Local setup complete. Add only ${public_key} to the intended GitHub account, then test:"
info "  ssh -T git@${host_alias}"
