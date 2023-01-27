import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { get } from 'http';

export interface Dependency {
  name: string;
  type: NodeDependencyType;
}

export const dependencies: Dependency[] = [
  {
    name: 'concurrently',
    type: NodeDependencyType.Dev,
  },
  {
    name: '@remix-run/dev',
    type: NodeDependencyType.Dev,
  },
  {
    name: '@remix-run/eslint-config',
    type: NodeDependencyType.Dev,
  },
  {
    name: "@nestjs/serve-static",
    type: NodeDependencyType.Default,
  },
  {
    name: "@remix-run/express",
    type: NodeDependencyType.Default,
  },
  {
    name: "@remix-run/node",
    type: NodeDependencyType.Default,
  },
  {
    name: "@remix-run/react",
    type: NodeDependencyType.Default,
  },
  {
    name: "@remix-run/serve",
    type: NodeDependencyType.Default,
  },
  {
    name: "react",
    type: NodeDependencyType.Default,
  },
  {
    name: "react-dom",
    type: NodeDependencyType.Default,
  }
];

export interface NodePackage {
  name: string;
  version: string;
}

export function getLatestDependencyVersion(
  packageName: string,
): Promise<NodePackage> {
  const DEFAULT_VERSION = 'latest';

  return new Promise((resolve) => {
    return get(`http://registry.npmjs.org/${packageName}`, (res) => {
      let rawData = '';
      res.on('data', (chunk) => (rawData += chunk));
      res.on('end', () => {
        try {
          const response = JSON.parse(rawData);
          const version = (response && response['dist-tags']) || {};
          resolve(buildPackage(packageName, version.latest));
        } catch (e) {
          resolve(buildPackage(packageName));
        }
      });
    }).on('error', () => resolve(buildPackage(packageName)));
  });

  function buildPackage(
    name: string,
    version: string = DEFAULT_VERSION,
  ): NodePackage {
    return { name, version };
  }
}