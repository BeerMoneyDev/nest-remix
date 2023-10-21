import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { get } from 'http';

export interface Dependency {
  name: string;
  type: NodeDependencyType;
  satisfies?: string;
}

export const dependencies: Dependency[] = [
  {
    name: 'concurrently',
    type: NodeDependencyType.Dev,
  },
  {
    name: '@remix-run/dev',
    type: NodeDependencyType.Dev,
    satisfies: "^1.19.3",
  },
  {
    name: '@remix-run/eslint-config',
    type: NodeDependencyType.Dev,
  },
  {
    name: '@types/react',
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
    satisfies:  "^1.19.3",
  },
  {
    name: "react",
    type: NodeDependencyType.Default,
  },
  {
    name: "react-dom",
    type: NodeDependencyType.Default,
  },
  {
    name: "@types/react-dom",
    type: NodeDependencyType.Dev,
  },
  {
    name: "tsup",
    type: NodeDependencyType.Default,
  },
  {
    name: "@swc/core",
    type: NodeDependencyType.Dev,
  },
  {
    name: "@swc/cli",
    type: NodeDependencyType.Dev,
  }
];

export interface NodePackage {
  name: string;
  version: string;
  satisfies?: string;
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