#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function incrementVersion(version, type) {
  const parts = version.split('.').map(Number);

  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2]++;
      break;
  }

  return parts.join('.');
}

function updatePackageJson(newVersion) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const oldVersion = packageJson.version;
  packageJson.version = newVersion;

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

  log(`📦 Version actualizada: ${oldVersion} → ${newVersion}`, 'green');
}

function getLastVersionCommits(currentVersion) {
  try {
    const tagsOutput = execSync('git tag -l --sort=-version:refname', {
      encoding: 'utf8',
    });
    const tags = tagsOutput
      .trim()
      .split('\n')
      .filter((tag) => tag.match(/^v?\d+\.\d+\.\d+$/));

    if (tags.length === 0) {
      log('📝 No se encontraron versiones anteriores', 'yellow');
      return [];
    }

    const currentTag = `v${currentVersion}`;
    let previousTag = null;

    for (let i = 0; i < tags.length; i++) {
      if (tags[i] === currentTag && i + 1 < tags.length) {
        previousTag = tags[i + 1];
        break;
      }
    }

    if (!previousTag) {
      previousTag = tags[0];
    }

    log(`📋 Obteniendo commits desde ${previousTag}...`, 'cyan');

    const commitsOutput = execSync(
      `git log ${previousTag}..HEAD --oneline --no-merges`,
      { encoding: 'utf8' }
    );
    const commits = commitsOutput
      .trim()
      .split('\n')
      .filter((commit) => commit.length > 0);

    return commits;
  } catch (error) {
    log('⚠️  No se pudieron obtener los commits anteriores', 'yellow');
    return [];
  }
}

function createGitTag(version, message, currentVersion) {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });

    try {
      execSync('git diff-index --quiet HEAD --', { stdio: 'ignore' });
    } catch (error) {
      log(
        '⚠️  Hay cambios sin commitear. Commiteando automáticamente...',
        'yellow'
      );
      execSync('git add package.json');
      execSync(`git commit -m "chore: bump version to ${version}"`);
    }

    const previousCommits = getLastVersionCommits(currentVersion);

    let tagMessage = message || `Release version ${version}`;

    if (previousCommits.length > 0) {
      tagMessage += '\n\nChanges since last version:\n';
      tagMessage += previousCommits.map((commit) => `- ${commit}`).join('\n');

      log('\n📝 Commits incluidos en esta release:', 'cyan');
      previousCommits.forEach((commit) => {
        log(`  • ${commit}`, 'white');
      });
    }

    const tagCommand = `git tag -a v${version} -m "${tagMessage}"`;

    execSync(tagCommand);
    log(`🏷️  Tag creado: v${version}`, 'cyan');

    log('📤 Haciendo push del tag y commits...', 'yellow');

    try {
      execSync('git push origin main', { stdio: 'inherit' });
      log('✅ Push de main completado', 'green');

      execSync(`git push origin v${version}`, { stdio: 'inherit' });
      log(`✅ Push del tag v${version} completado`, 'green');
    } catch (pushError) {
      log('⚠️  Error haciendo push automático:', 'yellow');
      log(pushError.message, 'red');
      log('\nPuedes hacer push manualmente con:', 'yellow');
      log(`git push origin main`, 'cyan');
      log(`git push origin v${version}`, 'cyan');
    }
  } catch (error) {
    if (error.message.includes('not a git repository')) {
      log('❌ No estás en un repositorio Git', 'red');
    } else {
      log(`❌ Error creando el tag: ${error.message}`, 'red');
    }
    process.exit(1);
  }
}

function showHelp() {
  log('\n🚀 Script de Versionado y Tagging', 'bright');
  log('==================================\n', 'bright');

  log('Uso:', 'cyan');
  log('  npm run release [tipo] [mensaje]', 'white');
  log('  yarn release [tipo] [mensaje]\n', 'white');

  log('Tipos de versión:', 'cyan');
  log('  patch  - Incrementa x.x.X (por defecto)', 'white');
  log('  minor  - Incrementa x.X.0', 'white');
  log('  major  - Incrementa X.0.0\n', 'white');

  log('Ejemplos:', 'cyan');
  log('  npm run release', 'white');
  log('  npm run release minor', 'white');
  log('  npm run release major "Nueva funcionalidad importante"', 'white');
  log('  npm run release patch "Arreglo de bugs"\n', 'white');
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  let versionType = 'patch';
  let message = '';

  if (args.length > 0 && ['major', 'minor', 'patch'].includes(args[0])) {
    versionType = args[0];
    message = args.slice(1).join(' ');
  } else {
    message = args.join(' ');
  }

  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;

    log(`\n🔄 Versión actual: ${currentVersion}`, 'blue');

    const newVersion = incrementVersion(currentVersion, versionType);

    log(`🎯 Nueva versión: ${newVersion} (${versionType})`, 'magenta');

    if (message) {
      log(`💬 Mensaje: ${message}`, 'yellow');
    }

    log('\n⚙️  Procesando...', 'cyan');

    updatePackageJson(newVersion);

    createGitTag(newVersion, message, currentVersion);

    log(`\n🎉 Release ${newVersion} completado exitosamente!`, 'green');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
