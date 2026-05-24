<#
.SYNOPSIS
    Install the lessons-learned skills into ~/.codex/skills/.

.DESCRIPTION
    Codex CLI loads skills from $CODEX_HOME/skills/<skill-name>/ (default
    ~/.codex/skills/). This script symlinks (or copies) one directory per
    skill from this plugin into that location.

    Idempotent — re-runs replace existing symlinks/dirs without erroring.
    Uses symlinks by default so edits in the cloned repo land in Codex
    immediately; falls back to recursive copies if symlinks fail (common
    on Windows without Developer Mode / admin rights).

.PARAMETER Copy
    Always copy, never symlink. Useful on Windows without symlink rights.

.PARAMETER Uninstall
    Remove the six skill dirs from ~/.codex/skills/.

.EXAMPLE
    .\install.ps1
    Install symlinks (or fall back to copies).

.EXAMPLE
    .\install.ps1 -Copy
    Always copy.

.EXAMPLE
    .\install.ps1 -Uninstall
    Remove installed skills.
#>

[CmdletBinding()]
param(
    [switch]$Copy,
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillsSrc = Join-Path $scriptDir 'skills'

$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$skillsDst = Join-Path $codexHome 'skills'

# Skills installed by this plugin. Names must match the `name:` field in
# each SKILL.md frontmatter and the on-disk directory name.
$skills = @(
    'consulting-lessons',
    'recording-lesson',
    'lesson-init',
    'lesson-search',
    'lesson-add',
    'lesson-lint'
)

# Sanity check: every skill must have a SKILL.md. References (templates,
# snippets) are populated by scripts/sync-core.mjs — bail with a clear
# message if they're missing for the skills that need them.
foreach ($name in $skills) {
    $skillMd = Join-Path $skillsSrc "$name\SKILL.md"
    if (-not (Test-Path -LiteralPath $skillMd -PathType Leaf)) {
        Write-Error "missing $skillMd"
    }
}
foreach ($needsRefs in @('lesson-init', 'lesson-add', 'recording-lesson')) {
    $refsDir = Join-Path $skillsSrc "$needsRefs\references"
    if (-not (Test-Path -LiteralPath $refsDir -PathType Container)) {
        Write-Error "missing $refsDir`nrun 'node scripts/sync-core.mjs' from the repo root first."
    }
}

function Remove-IfPresent {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        # Test-Path returns false for broken symlinks; check via Get-Item too.
        try {
            $item = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
            Remove-Item -LiteralPath $Path -Force -Recurse -Confirm:$false
            return
        }
        catch { return }
    }
    $item = Get-Item -LiteralPath $Path -Force
    # Treat symlink directories specially so we don't recurse into the target.
    if ($item.LinkType) {
        # Removing a symlink to a dir requires -Recurse on PowerShell, but the
        # underlying junction/symlink target is not touched.
        Remove-Item -LiteralPath $Path -Force -Recurse -Confirm:$false
    } elseif ($item.PSIsContainer) {
        Remove-Item -LiteralPath $Path -Force -Recurse -Confirm:$false
    } else {
        Remove-Item -LiteralPath $Path -Force -Confirm:$false
    }
}

if ($Uninstall) {
    foreach ($name in $skills) {
        $target = Join-Path $skillsDst $name
        if (Test-Path -LiteralPath $target) {
            Remove-IfPresent $target
            Write-Host "removed $target"
        }
    }
    return
}

if (-not (Test-Path -LiteralPath $skillsDst)) {
    New-Item -ItemType Directory -Path $skillsDst -Force | Out-Null
}

foreach ($name in $skills) {
    $src    = Join-Path $skillsSrc $name
    $target = Join-Path $skillsDst $name

    Remove-IfPresent $target

    $linked = $false
    if (-not $Copy) {
        try {
            New-Item -ItemType SymbolicLink -Path $target -Target $src -ErrorAction Stop | Out-Null
            Write-Host "linked  $target -> $src"
            $linked = $true
        }
        catch {
            Write-Warning "symlink failed for $target (likely no admin/Developer Mode); falling back to copy."
        }
    }

    if (-not $linked) {
        Copy-Item -LiteralPath $src -Destination $target -Recurse -Force
        Write-Host "copied  $target"
    }
}

Write-Host ""
Write-Host "Installed $($skills.Count) skills into $skillsDst."
Write-Host "Restart Codex (close any open sessions) to pick up the new skills."
Write-Host "Invoke explicitly with `$consulting-lessons, `$recording-lesson,"
Write-Host "`$lesson-init, `$lesson-search, `$lesson-add, `$lesson-lint - or let"
Write-Host "Codex auto-fire them based on the task description."
