<h1 align="center">nest-remix</h1>
<br />
<div align="center">
  <strong>An interop layer between NestJS and Remix</strong>
</div>
<br />
<div align="center">
<a href="https://www.npmjs.com/package/nest-remix"><img src="https://img.shields.io/npm/v/nest-remix.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nest-remix"><img src="https://img.shields.io/npm/l/nest-remix.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nest-remix"><img src="https://img.shields.io/npm/dm/nest-remix.svg" alt="NPM Downloads" /></a>
</div>

# Features

- Serving of a Remix build through a custom NestJS server implementation.
- Support of using NestJS @Injectable() services as Remix `action` and `loader` functions via `wireBackend`

# How To Use

## Install

#### Using NestJS Schematics

This will:

- Install `nest-remix` and its NestJS, Remix, and React dependencies.
- (Optionally) Update the tsconfig.json with a known working configuration to support NestJS and Remix.
- (Optionally) Update app.module to use @RemixModule()
- (Optionally) Add the required NPM scripts

```bash
nest add nest-remix
```

#### Manually

Details coming soon.

## Basic Usage

#### Setup and Configuration

To add the interop layer, update your root module to use `@RemixModule` instead of `@Module` and pass in the build configuration for Remix. For instance:

```ts
// before
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { Module } from '@nestjs/common';

@RemixModule({
  publicDir: path.join(process.cwd(), 'public'),
  browserBuildDir: path.join(process.cwd(), 'build/'),
  controllers: [AppController],
  providers: [HelloWorldBackend, AppService],
  exports: [AppService],
})
export class AppModule {}

// after
import * as path from 'path';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { RemixModule } from 'nest-remix';

@RemixModule({
  publicDir: path.join(process.cwd(), 'public'),
  browserBuildDir: path.join(process.cwd(), 'build/'),
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
```

#### Adding Remix routes

Add all your Remix routes to `src/routes` as you would in a typical Remix application.

#### Using NestJS services as `action` and `loader` functions

The `wireLoader` and `wireAction` functions connect to the RemixModule-decorated module to get providers. By supplying these functions with the type to be used as the backend, nest-remix will route the request appropriately given the `@Loader()` and `@Action()` decorators. Services can be injected into the backend class as expected given their module hierarchy.

It is required to create a new file as the NestJS decorators will attempt to execute as client-side code otherwise, breaking your build. As such, you will need two files for a route now (sorry!) - `{your-route}.tsx` and `{your-route}.server.ts` (you can name it whatever you want, but this is the recommended naming convention).

**Note: backends must be provided/exported to be accessible by the RemixModule-decorated module.**

```tsx
// src/routes/hello-world.tsx
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { wireAction, wireLoader } from 'nest-remix/core.server';
import { HelloWorldBackend } from './hello-world.server';

export const loader: LoaderFunction = (args) =>
  wireLoader(HelloWorldBackend, args);

export const action: ActionFunction = (args) =>
  wireAction(HelloWorldBackend, args);

export default function HelloWorld() {
  const { message } = useLoaderData<HelloWorldBackend['getMessage']>();
  const actionData = useActionData<
    HelloWorldBackend['setMessage'] | HelloWorldBackend['setMessageFallback']
  >();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Remix</h1>
      <div style={{ marginTop: 20 }}>{actionData?.newMessage || message}</div>
      <fieldset style={{ marginTop: 20 }}>
        <legend>Update the message</legend>
        <Form method="post">
          <input type="text" name="message" defaultValue={''} />
          <button>Post update</button>
        </Form>
        <Form method="put">
          <input type="text" name="message" defaultValue={''} />
          <button>Put update</button>
        </Form>
      </fieldset>
    </div>
  );
}
```

```ts
// src/routes/hello-world.server.ts
import { Body, Injectable, ParseIntPipe, Query } from '@nestjs/common';
import { LoaderArgs } from '@remix-run/node';
import { Action, Loader, RemixArgs } from 'nest-remix';
import { AppService } from './app.service.ts';

@Injectable()
export class HelloWorldBackend {
  constructor(private readonly appService: AppService);

  @Loader()
  getMessage(
    @Query('defaultMessage') defaultMessage: string,
    @Query('counter', ParseIntPipe) _counter: number,
    @RemixArgs() _remixArgs: LoaderArgs
  ) {
    return { message: defaultMessage || this.appService.getDefaultMessage() };
  }

  @Action()
  async setMessageFallback(@Body() body: { message: string }) {
    return { newMessage: body.message + ' [POST, DELETE]' };
  }

  @Action.Put()
  async setMessage(@Body() body: { message: string }) {
    return { newMessage: body.message + ' [PUT]' };
  }
}
```

##### `action` Routing

The `@Action()` decorator will capture all requests to the wired `action` function. Additional routing is possible by using `@Action.Post()`, `@Action.Put()`, and `@Action.Delete()`. It will always fall back to `@Action()` if an HTTP verb is not supplied.

##### Accessing the Remix args

`nest-remix` provides a custom decorator, `@RemixArgs()`. This provides the `LoaderArgs` or `ActionArgs` depending on the type of function.

##### NestJS pipes in `@Action()` and `@Loader()` functions

Pipes should work as expected. They are applied to the NestJS request object, NOT the Remix request. But, the Remix request object is accessible via `@RemixArgs()`.

## How it works

`@RemixModule` appends a custom controller (`RemixController`) which handles the `@All('*')` route at the root. This controller is at the end of the pipeline, so NestJS will attempt to server the request before it falls back to Remix. During this process, we use the NestJS module ref to provide injectable services for Remix backends.

## Important notes

### Use `nest-remix/core.server` in your route files

As described in the remix.run "gotcha's" page, it is important to use `.server`-suffixed files from your routes to avoid server-side rendering attempts on your client-side code. A fortunate side-effect of `nest-remix` is that this pattern allows you to funnel all server-side code through `nest-remix/core.server` and `{your-route}.server.ts`, inherently protecting you.

# Stay In Touch

- Author - [Kerry Ritter](https://twitter.com/kerryritter) and BeerMoneyDev

## License

nest-remix is MIT licensed.
