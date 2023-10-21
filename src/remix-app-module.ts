import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import {
  buildRemixConfigProvider,
  getLoaderProviders,
  RemixConfig,
} from './core.server';
import { RemixController } from './remix.controller';

import type { DynamicModule } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Module({
  controllers: [RemixController],
})
export class RemixModule {
  constructor(private moduleRef: ModuleRef) {}

  public static forRoot(metadata: RemixConfig): DynamicModule {
    return {
      module: RemixModule,
      imports: [
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
      ],
      providers: [buildRemixConfigProvider(metadata), ...getLoaderProviders()],
    };
  }
}
