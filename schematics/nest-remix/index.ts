import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  SchematicsException,
  url,
  apply,
  mergeWith,
  Source,
  forEach,
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
} from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependency,
} from '@schematics/angular/utility/dependencies';
import { dependencies, Dependency, getLatestDependencyVersion } from './dependencies';
import { npmScripts } from './npm-scripts';
import { Schema } from './schema';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function nestRemixAdd(_options: Schema): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    _context.addTask(new NodePackageInstallTask());

    return chain([
      addDependencies(dependencies),
      addNpmScripts(_options),
      copyFiles(_options),
      updateAppModule(_options),
      updateGitIgnore(),
    ]);
  };
}

function addDependencies(dependencies: Dependency[]): Rule {
  return (tree, context) => {
    return Promise.allSettled(
      dependencies.map((dependency) =>
        getLatestDependencyVersion(dependency.name).then(
          ({ name, version }) => {
            context.logger.info(`✅️ Added ${name}@${version}`);
            const nodeDependency: NodeDependency = {
              name,
              version,
              type: dependency.type,
            };
            addPackageJsonDependency(tree, nodeDependency);
          },
        ).catch(() => {
          context.logger.info(`✅️ Added ${dependency.name}@latest`);
          const nodeDependency: NodeDependency = {
            name: dependency.name,
            version: 'latest',
            type: dependency.type,
          };
          addPackageJsonDependency(tree, nodeDependency);
        }),
      ),
    ).then(() => tree) as ReturnType<Rule>;
  };
}

function addNpmScripts(options: Schema): Rule {
  return (tree: Tree, context) => {
    if (options.overwriteNpmScripts === false) {
      return tree
    }

    const pkgPath = 'package.json';
    const buffer = tree.read(pkgPath);

    if (buffer === null) {
      throw new SchematicsException(`Could not find ${pkgPath}.`);
    }

    const pkg = JSON.parse(buffer.toString());

    context.logger.info(`✅️ Added build and start scripts`);

    npmScripts.map(
      (npmScript) => (pkg.scripts[npmScript.name] = npmScript.command),
    );

    tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
    return tree;
  };
}


function copyFiles(options: Schema): Rule {
  return applyWithOverwrite(url('./templates'), options.overwriteTsconfig === false ? ['tsconfig.json', 'tsconfig.nest.json'] : [])
}

function applyWithOverwrite(source: Source, skipFiles: string[]): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const rule = mergeWith(
      apply(source, [
        forEach((fileEntry) => {
          if (skipFiles.some(s => fileEntry.path.includes(s))) {
            return null;
          }
          if (!tree.exists(fileEntry.path)) {
            return fileEntry;
          }
          tree.overwrite(fileEntry.path, fileEntry.content);
          return null;
        }),

      ]),
    );

    return rule(tree, _context);
  };
}

function updateAppModule(options: Schema) {
  return replaceFileContents('src/app.module.ts', (fileContents: string) => {
    if (options.overwriteAppModule === false) {
      return fileContents;
    }
    const remixModuleTs = `@RemixModule({
  publicDir: path.join(process.cwd(), 'public'),
  browserBuildDir: path.join(process.cwd(), 'build/'),`;

    let newContent = `import * as path from 'path';
import { RemixModule } from 'nest-remix';
import { HelloWorldBackend } from './routes/hello-world.server';
` + fileContents.toString().replace(`@Module({`, remixModuleTs)

    if (newContent.includes(`providers: [`)) {
      newContent = newContent.replace(`providers: [`, `providers: [HelloWorldBackend, `);
    } else {
      newContent = newContent.replace(remixModuleTs, `${remixModuleTs}
providers: [HelloWorldBackend],`)
    }

    return newContent;
  })
}

function updateGitIgnore() {
  return replaceFileContents('.gitignore', (fileContents: string) => {
    return `${fileContents}

/build
/public/build
*.tsbuildinfo
.cache`;
  })
}

function replaceFileContents(fileName: string, applyChanges: (fileContents: string) => string) {
  return (tree: Tree, context) => {
    const buffer = tree.read(fileName);

    if (buffer === null) {
      throw new SchematicsException(`Could not find ${fileName}.`);
    }

    const newContents = applyChanges(buffer.toString());

    context.logger.info(`✅️ Updated app.module.ts`);

    tree.overwrite(fileName, newContents);
    return tree;
  };
}