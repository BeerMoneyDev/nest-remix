import { Body, Injectable, ParseIntPipe, Query } from '@nestjs/common';
import { LoaderArgs } from '@remix-run/node';
import { Action, Loader, RemixArgs } from 'nest-remix/core.server';

@Injectable()
export class HelloWorldBackend {
  @Loader()
  getMessage(
    @Query('defaultMessage') defaultMessage: string,
    @Query('counter', ParseIntPipe) _counter: number,
    @RemixArgs() _remixArgs: LoaderArgs,
  ) {
    return { message: defaultMessage };
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
