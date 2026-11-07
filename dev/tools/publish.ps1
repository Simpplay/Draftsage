<#
.SYNOPSIS
  Publica una nueva versión de Draftsage de principio a fin: empaqueta y firma, commit, etiqueta y push.

.DESCRIPTION
  Pasos (se detiene en el primero que falle y no deja nada a medias):
    1. Comprueba el entorno: git, node y npm; rama main; árbol limpio; sin cambios pendientes de bajar de origin; la etiqueta no existe.
    2. Instala esbuild si falta (npm ci en dev/).
    3. Calcula la versión siguiente (o usa -Version) y ejecuta dev/tools/release.mjs: pruebas, empaquetado, firma y autoverificación.
    4. Te enseña los cambios y pide confirmación.
    5. git add -A, git commit "release vX.Y.Z" y etiqueta anotada vX.Y.Z.
    6. Comprueba el zip con dev/tools/package.mjs (etiqueta, firma, hash, sin claves). Si falla, deshace commit y etiqueta.
    7. git push --atomic origin main vX.Y.Z  -> GitHub Actions crea el Release con el .zip.

  La clave privada de firma NO se pide ni se imprime: release.mjs la lee de -Key, de la variable DRAFTSAGE_SIGNING_KEY
  o de ~\.draftsage\signing-key.pem. Si no tienes clave aún: node dev/tools/keygen.mjs (ver docs/RELEASING.md).

.PARAMETER Version
  Versión exacta (x.y.z). Si no se indica, se sube según -Bump.
.PARAMETER Bump
  patch (por defecto), minor o major.
.PARAMETER Key
  Ruta de la clave privada .pem (si no es la de por defecto).
.PARAMETER RequireTests
  Bloquea el release si alguna prueba falla (por defecto solo avisa: hay fallos conocidos en docs/HANDOFF.md).
.PARAMETER NoPush
  Hace todo menos el push: deja commit y etiqueta en local para que los revises (el comando de push se imprime al final).
.PARAMETER Yes
  No pide confirmación.

.EXAMPLE
  .\dev\tools\publish.ps1                      # siguiente versión patch (1.0.0 -> 1.0.1)
  .\dev\tools\publish.ps1 -Bump minor          # 1.0.1 -> 1.1.0
  .\dev\tools\publish.ps1 -Version 2.0.0 -NoPush
#>
[CmdletBinding()]
param(
  [string]$Version,
  [ValidateSet('patch', 'minor', 'major')][string]$Bump = 'patch',
  [string]$Key,
  [switch]$RequireTests,
  [switch]$NoPush,
  [switch]$Yes
)

# 'Continue' a propósito: en Windows PowerShell 5.1 el texto que git escribe por stderr (fetch, push) se convertiría en error con 'Stop'.
# Los programas externos se controlan con $LASTEXITCODE; los cmdlets llevan -ErrorAction Stop.
$ErrorActionPreference = 'Continue'

$Root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..') -ErrorAction Stop).Path
Set-Location -LiteralPath $Root

function Step([string]$m) { Write-Host ''; Write-Host "== $m" -ForegroundColor Cyan }
function Info([string]$m) { Write-Host "   $m" }
function Fail([string]$m) { Write-Host "X $m" -ForegroundColor Red; exit 1 }
# Ejecuta un programa externo mostrando su salida; aborta si devuelve error.
function Run([string]$exe, [string[]]$arguments) {
  & $exe @arguments
  if ($LASTEXITCODE -ne 0) { Fail ("Falló: $exe " + ($arguments -join ' ')) }
}
# Ejecuta un programa externo y devuelve su salida como texto; aborta si devuelve error.
function Capture([string]$exe, [string[]]$arguments) {
  $out = & $exe @arguments 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) { Fail ("Falló: $exe " + ($arguments -join ' ') + "`n" + $out) }
  return $out.Trim()
}
function Confirm-Yes([string]$question) {
  if ($Yes) { return $true }
  $a = Read-Host "$question (s/N)"
  return ($a -match '^(s|si|sí|y|yes)$')
}

# ---------- 1. Entorno ----------
Step 'Comprobando el entorno'
foreach ($tool in 'git', 'node', 'npm') {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { Fail "No encuentro '$tool' en el PATH." }
}
if (-not (Test-Path -LiteralPath (Join-Path $Root '.git'))) { Fail "$Root no es un repositorio git." }

$branch = Capture 'git' @('rev-parse', '--abbrev-ref', 'HEAD')
if ($branch -ne 'main') { Fail "Estás en la rama '$branch'. Los releases salen de 'main'." }

$dirty = Capture 'git' @('status', '--porcelain')
if ($dirty) { Fail ("Hay cambios sin commitear. Haz commit (o guárdalos) antes de publicar:`n$dirty") }

$origin = Capture 'git' @('remote', 'get-url', 'origin')
Info "origin: $origin"
Run 'git' @('fetch', 'origin', '--tags', '--quiet')
& git rev-parse --verify --quiet 'origin/main' *> $null
if ($LASTEXITCODE -eq 0) {
  $behind = [int](Capture 'git' @('rev-list', '--count', 'HEAD..origin/main'))
  if ($behind -gt 0) { Fail "origin/main tiene $behind commit(s) que no tienes. Haz 'git pull --rebase' primero." }
}

# ---------- Versión ----------
$versionFile = Join-Path $Root 'src\shared\version.js'
$m = [regex]::Match((Get-Content -LiteralPath $versionFile -Raw -ErrorAction Stop), "VERSION = '(\d+)\.(\d+)\.(\d+)'")
if (-not $m.Success) { Fail "No pude leer la versión de $versionFile." }
$cur = @([int]$m.Groups[1].Value, [int]$m.Groups[2].Value, [int]$m.Groups[3].Value)
$curText = $cur -join '.'

if ($Version) {
  if ($Version -notmatch '^(\d+)\.(\d+)\.(\d+)$') { Fail "Versión inválida '$Version' (formato x.y.z)." }
  $next = $Version
} else {
  switch ($Bump) {
    'major' { $next = '{0}.0.0' -f ($cur[0] + 1) }
    'minor' { $next = '{0}.{1}.0' -f $cur[0], ($cur[1] + 1) }
    default { $next = '{0}.{1}.{2}' -f $cur[0], $cur[1], ($cur[2] + 1) }
  }
}
$nextParts = $next.Split('.') | ForEach-Object { [int]$_ }
$isGreater = $false
for ($i = 0; $i -lt 3; $i++) {
  if ($nextParts[$i] -ne $cur[$i]) { $isGreater = ($nextParts[$i] -gt $cur[$i]); break }
}
if (-not $isGreater) { Fail "La versión $next debe ser mayor que la actual ($curText)." }

$tag = "v$next"
if (Capture 'git' @('tag', '--list', $tag)) {
  $where = Capture 'git' @('log', '-1', '--format=%h %s', "refs/tags/$tag")
  $onRemote = [bool](Capture 'git' @('ls-remote', '--tags', 'origin', "refs/tags/$tag"))
  if ($onRemote) {
    Fail "La etiqueta $tag ya existe en local Y en origin (apunta a: $where). Esa versión ya está publicada: usa otra con -Version o -Bump."
  }
  Fail ("La etiqueta $tag ya existe en local pero NO en origin (apunta a: $where). Seguramente es de un intento anterior que no se subió.`n" +
        "   - Para descartarla y repetir:       git tag -d $tag      (si dejó un commit 'release $tag' sin subir, revísalo con git log antes de repetir)`n" +
        "   - Si ese release está bien y solo falta subirlo:   git push --atomic origin main $tag")
}
if (Capture 'git' @('ls-remote', '--tags', 'origin', "refs/tags/$tag")) { Fail "La etiqueta $tag ya existe en origin." }
Info "versión actual $curText  ->  nueva $next  (etiqueta $tag)"

# ---------- 2. Dependencias de desarrollo ----------
if (-not (Test-Path -LiteralPath (Join-Path $Root 'dev\node_modules\esbuild'))) {
  Step 'Instalando esbuild (npm ci en dev/)'
  Push-Location -LiteralPath (Join-Path $Root 'dev')
  try { Run 'npm' @('ci', '--no-audit', '--no-fund') } finally { Pop-Location }
}

# ---------- 3. Empaquetar y firmar ----------
Step "Empaquetando y firmando $next (dev/tools/release.mjs)"
$releaseArgs = @('dev/tools/release.mjs', $next)
if ($Key) { $releaseArgs += @('--key', $Key) }
if ($RequireTests) { $releaseArgs += '--require-tests' }
& node @releaseArgs
if ($LASTEXITCODE -ne 0) {
  # release.mjs restaura version.js si falla; por si acaso, dejamos el árbol como estaba (estaba limpio al empezar).
  & git checkout -- . 2>$null
  & git clean -fdq -- dist 2>$null
  Fail 'release.mjs falló. No se ha cambiado nada.'
}

# ---------- 4. Revisión ----------
Step 'Cambios del release'
Run 'git' @('status', '--short')
Run 'git' @('diff', '--stat')
if (-not (Confirm-Yes "¿Hacer commit, etiqueta $tag y push?")) {
  & git checkout -- . 2>$null
  & git clean -fdq -- dist 2>$null
  Fail 'Cancelado. He deshecho los cambios del release.'
}

# ---------- 5. Commit y etiqueta ----------
Step 'Commit y etiqueta'
Run 'git' @('add', '-A')
Run 'git' @('commit', '-m', "release $tag")
Run 'git' @('tag', '-a', $tag, '-m', "Draftsage $tag")

# ---------- 6. Comprobar el zip (lo mismo que hará GitHub Actions) ----------
Step 'Comprobando el .zip de distribución'
$pkgDir = Join-Path ([System.IO.Path]::GetTempPath()) "draftsage-pkg-$next"
& node 'dev/tools/package.mjs' '--tag' $tag '--out' $pkgDir
if ($LASTEXITCODE -ne 0) {
  & git tag -d $tag | Out-Null
  & git reset --soft 'HEAD~1' | Out-Null
  Fail 'package.mjs rechazó el release. He deshecho el commit y la etiqueta (los cambios siguen preparados en el índice).'
}
Info "zip de prueba en: $pkgDir"

# ---------- 7. Push ----------
if ($NoPush) {
  Step 'Hecho en local (-NoPush)'
  Info "Revisa y, cuando quieras:  git push --atomic origin main $tag"
  exit 0
}
Step "Subiendo main y $tag"
Run 'git' @('push', '--atomic', 'origin', 'main', $tag)

$repo = ''
if ($origin -match 'github\.com[:/](.+?)(\.git)?$') { $repo = $Matches[1] }
Write-Host ''
Write-Host "OK  Draftsage $tag publicado." -ForegroundColor Green
if ($repo) {
  Info "Actions (crea el Release con el .zip): https://github.com/$repo/actions"
  Info "Release:                               https://github.com/$repo/releases/tag/$tag"
  Info "Para que jsDelivr sirva ya la última:  https://purge.jsdelivr.net/gh/$repo/dist/manifest.json"
}
Info "En el cliente, tras reiniciar:  draftsage.build()  ->  version $next, source 'remote'"
