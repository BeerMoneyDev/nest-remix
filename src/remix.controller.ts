import {
  All,
  Controller,
  Next,
  Req,
  Res,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { createRequestHandler } from '@remix-run/express';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { InjectRemixConfig } from './remix-config';
import type { RemixConfig } from './remix-config';
import type { GetLoadContextFunction } from '@remix-run/express';

@Controller({
  path: '/',
  version: VERSION_NEUTRAL,
})
export class RemixController {
  constructor(
    @InjectRemixConfig() private readonly remixConfig: RemixConfig,
    private moduleRef: ModuleRef,
  ) {}

  @All('*')
  handler(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    if (this.isStaticAsset(req)) {
      return next();
    }

    this.purgeRequireCacheInDev();

    const getLoadContext: GetLoadContextFunction = (req) => {
      return {
        moduleRef: this.moduleRef,
        req,
        res,
      };
    };

    return createRequestHandler({
      build: require(this.remixConfig.browserBuildDir),
      getLoadContext,
    })(req, res, next);
  }

  private purgeRequireCacheInDev() {
    if (process.env.NODE_ENV === 'production') return;

    for (const key in require.cache) {
      if (key.startsWith(this.remixConfig.browserBuildDir)) {
        delete require.cache[key];
      }
    }
  }

  private isStaticAsset(request: Request) {
    if (this.remixConfig.isStaticAsset) {
      return this.remixConfig.isStaticAsset(request);
    }

    return /^\/(build|assets)\//gi.test(request.url);
  }
}
