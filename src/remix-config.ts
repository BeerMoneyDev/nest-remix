import { Inject, ValueProvider } from '@nestjs/common';
import { Request } from 'express-serve-static-core';

const REMIX_CONFIG = 'REMIX_CONFIG';

export const InjectRemixConfig = () => Inject(REMIX_CONFIG);

export const buildRemixConfigProvider = (config: RemixConfig) => {
  // Need to copy the properties to make sure we don't include other metadata
  return {
    provide: REMIX_CONFIG,
    useValue: {
      publicDir: config.publicDir,
      browserBuildDir: config.browserBuildDir,
      isStaticAsset: config.isStaticAsset,
    } as RemixConfig,
  } as ValueProvider;
};

export type RemixConfig = {
  publicDir: string;
  browserBuildDir: string;
  isStaticAsset?: (request: Request) => boolean;
};
