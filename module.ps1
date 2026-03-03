# =========================
# Prompt du nom du module
# =========================
chcp 65001 | Out-Null

$moduleName = Read-Host "Nom du module à créer"

if ([string]::IsNullOrWhiteSpace($moduleName)) {
  Write-Error "Nom de module invalide."
  exit 1
}

$moduleName = $moduleName.Trim()
$folderName = $moduleName.ToLower()

# =========================
# Chemins
# =========================

$projectRoot = Get-Location
$modulesRoot = Join-Path $projectRoot "module"
$modulePath  = Join-Path $modulesRoot $folderName

$controllerFile = "$folderName.controller.js"
$modelFile      = "$folderName.model.js"
$routeFile      = "$folderName.route.js"

# =========================
# Utils
# =========================

function To-PascalCase([string]$s) {
  $s = [string]$s
  $s = $s.Trim()

  if ([string]::IsNullOrWhiteSpace($s)) { return "" }

  # Remplace _ et - par des espaces
  $s = $s -replace '[_\-]', ' '

  # Découpe en mots
  $words = @($s -split '\s+' | Where-Object { $_ -ne '' })

  # Si un seul mot (ex: "conversation" ou "userProfile")
  if ($words.Count -eq 1) {
    $w = [string]$words[0]
    if ($w.Length -le 1) { return $w.ToUpper() }
    return ($w.Substring(0,1).ToUpper() + $w.Substring(1))
  }

  # Plusieurs mots -> concat PascalCase
  $result = ""
  foreach ($word in $words) {
    $w = [string]$word
    if ($w.Length -eq 0) { continue }
    if ($w.Length -eq 1) { $result += $w.ToUpper(); continue }
    $result += ($w.Substring(0,1).ToUpper() + $w.Substring(1).ToLower())
  }

  return [string]$result
}

$pascalName = To-PascalCase $moduleName
$tableName  = $folderName

# =========================
# Checks
# =========================

if (-not (Test-Path $modulesRoot)) {
  Write-Error "Le dossier 'module' n'existe pas à la racine du projet."
  exit 1
}

if (Test-Path $modulePath) {
  Write-Error "Le module '$folderName' existe déjà."
  exit 1
}

# =========================
# Création
# =========================

New-Item -ItemType Directory -Path $modulePath | Out-Null

$controllerTemplate = @"
const ${pascalName} = require('./$modelFile');

exports.get = async () => {
    //TO DO
}
"@

$modelTemplate = @"
const { DataTypes } = require('sequelize');
const { bdd } = require('./../../helper/connexion.js');

const ${pascalName} = bdd.define('$pascalName', {

},{
    tableName: "$tableName"
});

module.exports = ${pascalName};
"@

$routeTemplate = @"
const express = require("express");
const router = express.Router();
const ${folderName}Controller = require('./$controllerFile');

module.exports = router;
"@

Set-Content (Join-Path $modulePath $controllerFile) $controllerTemplate -Encoding UTF8
Set-Content (Join-Path $modulePath $modelFile)      $modelTemplate      -Encoding UTF8
Set-Content (Join-Path $modulePath $routeFile)      $routeTemplate      -Encoding UTF8

Write-Host "✅ Module '$folderName' créé avec succès."
