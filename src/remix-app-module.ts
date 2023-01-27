import type { ModuleMetadata } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { buildRemixConfigProvider, getLoaderProviders, RemixConfig } from './core.server';
import { RemixController } from './remix.controller';

export const RemixModule = (metadata: ModuleMetadata & RemixConfig) => {
  if (!metadata.imports) {
    metadata.imports = [];
  }

  metadata.imports.push(
    ServeStaticModule.forRoot({
      rootPath: metadata.publicDir,
      serveRoot: '/',
      serveStaticOptions: {
        setHeaders(res, pathname) {
          const relativePath = pathname.replace(metadata.publicDir, '');
          res.setHeader(
            'Cache-Control',
            relativePath.startsWith(metadata.browserBuildDir)
              ? 'public, max-age=31536000, immutable' // Remix fingerprints its assets so we can cache forever
              : 'public, max-age=3600', // You may want to be more aggressive with this caching
          );
        },
      },
    }),
  );

  if (!metadata.controllers) {
    metadata.controllers = [];
  }
  metadata.controllers.push(RemixController);

  const loaders = getLoaderProviders();

  if (!metadata.exports) {
    metadata.exports = [];
  }
  metadata.exports.push(...loaders);

  if (!metadata.providers) {
    metadata.providers = [];
  }
  metadata.providers.push(buildRemixConfigProvider(metadata), ...loaders);

  return Module({
    imports: metadata.imports,
    controllers: metadata.controllers,
    providers: metadata.providers,
    exports: metadata.exports,
  });
};
