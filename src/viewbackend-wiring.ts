import {
  assignMetadata,
  ClassProvider,
  Logger,
  ParamData,
  Paramtype,
  PipeTransform,
  RouteParamMetadata,
  Type,
} from '@nestjs/common';
import { PipesConsumer } from '@nestjs/core/pipes';
import type { ModuleRef } from '@nestjs/core';
import { ContextUtils } from '@nestjs/core/helpers/context-utils';
import type { ActionArgs, DataFunctionArgs, LoaderArgs } from '@remix-run/node';
import { Request, Response } from 'express';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';
import { isConstructor } from './utils';

const getViewBackendTypeName = (backendFn: any) =>
  Reflect.getMetadata('__viewBackendTypeName__', backendFn);
const setViewBackendTypeName = (backendFn: any, type: Type) =>
  Reflect.defineMetadata('__viewBackendTypeName__', type.name, backendFn);

const getViewBackendMethod = (backendFn: any) =>
  Reflect.getMetadata('__viewBackendMethodName__', backendFn);
const setViewBackendMethod = (backendFn: any, methodName: string) =>
  Reflect.defineMetadata('__viewBackendMethodName__', methodName, backendFn);

const getReqAndRes = (args: LoaderArgs | ActionArgs) => {
  const res = args.context.res as Response;
  const req = args.context.req as Request;

  return { res, req };
};

const viewBackendMap = new Map<
  string,
  { type: Type; loaderMethods?: string[]; actionMethods?: string[] }
>();

export const getLoaderProviders = () =>
  Array.from(viewBackendMap.entries()).map(([typeName, config]) => {
    return {
      provide: `VIEWBACKEND_${typeName}`,
      useClass: config.type,
    } as ClassProvider;
  });

export const Loader = () => {
  return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
    const type = target.constructor;
    if (!viewBackendMap.has(type.name)) {
      viewBackendMap.set(type.name, {
        type: type,
      });
    }

    setViewBackendTypeName(target[propertyKey], type);

    viewBackendMap.set(type.name, {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...viewBackendMap.get(type.name)!,
      loaderMethods: [...(viewBackendMap.get(type.name)?.loaderMethods || []), propertyKey],
    });
  };
};

const createActionFn = (method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'ALL') => {
  return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
    const type = target.constructor;
    if (!viewBackendMap.has(type.name)) {
      viewBackendMap.set(type.name, {
        type: type,
      });
    }

    setViewBackendTypeName(target[propertyKey], type);
    setViewBackendMethod(target[propertyKey], method);

    viewBackendMap.set(type.name, {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...viewBackendMap.get(type.name)!,
      actionMethods: [...(viewBackendMap.get(type.name)?.actionMethods || []), propertyKey],
    });
  };
};

export function Action() {
  return createActionFn('ALL');
}
Action.Post = () => createActionFn('POST');
Action.Put = () => createActionFn('PUT');
Action.Patch = () => createActionFn('PATCH');
Action.Delete = () => createActionFn('DELETE');

export type ExpressLoaderArgs = LoaderArgs & { req: Request; res: Response };
export type ExpressActionArgs = ActionArgs & { req: Request; res: Response };

function createRouteParamDecorator(paramtype: RouteParamtypes) {
  return (data?: ParamData): ParameterDecorator =>
    (target, key, index) => {
      const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};
      Reflect.defineMetadata(
        ROUTE_ARGS_METADATA,
        assignMetadata<RouteParamtypes, Record<number, RouteParamMetadata>>(
          args,
          paramtype,
          index,
          data,
        ),
        target.constructor,
        key,
      );
    };
}

const REMIX_ARGS_METADATA_KEY = 99999 as any;
export const RemixArgs = createRouteParamDecorator(REMIX_ARGS_METADATA_KEY);

async function parseArgumentsAndPipe(
  viewbackInstance: any,
  functionName: string,
  moduleRef: ModuleRef,
  req: Request,
  args: DataFunctionArgs,
) {
  const metadata =
    new ContextUtils().reflectCallbackMetadata(
      viewbackInstance,
      functionName,
      ROUTE_ARGS_METADATA,
    ) || {};

  const pipesConsumer = new PipesConsumer();

  const functionParams: any[] = [];

  await Promise.allSettled(
    Object.entries(metadata).map(async ([key, xconfig]) => {
      const paramType = parseInt(key.split(':').shift()!) as any as RouteParamtypes;
      const config = xconfig as Config;

      const pipes = config.pipes.map((p) => moduleRef.get(p) as PipeTransform);
      const argMetadata = { metatype: null as any, type: 'custom' as Paramtype, data: config.data };

      try {
        if (paramType === RouteParamtypes.QUERY) {
          argMetadata.type = 'query';
          functionParams[config.index] = await pipesConsumer.apply(
            req.query[config.data],
            argMetadata,
            pipes,
          );
        } else if (paramType === RouteParamtypes.PARAM) {
          argMetadata.type = 'param';
          functionParams[config.index] = await pipesConsumer.apply(
            req.params[config.data],
            argMetadata,
            pipes,
          );
        } else if (paramType === RouteParamtypes.BODY) {
          argMetadata.type = 'body';
          if (config.data?.length) {
            functionParams[config.index] = await pipesConsumer.apply(
              req.body[config.data],
              argMetadata,
              pipes,
            );
          } else {
            functionParams[config.index] = await pipesConsumer.apply(req.body, argMetadata, pipes);
          }
        } else if (paramType === (REMIX_ARGS_METADATA_KEY as any)) {
          functionParams[config.index] = args;
        }
      } catch {
        functionParams[config.index] = undefined;
      }
    }),
  );

  return functionParams;
}

async function wireBackendFn<ViewBackendFn extends (...args: any) => any>(
  actionOrLoader: 'action' | 'loader',
  viewBackendFn: ViewBackendFn,
  args: LoaderArgs | ActionArgs,
): Promise<ReturnType<ViewBackendFn>> {
  const moduleRef = args.context.moduleRef as ModuleRef;
  const viewbackendConfig = viewBackendMap.get(getViewBackendTypeName(viewBackendFn));

  const { req } = getReqAndRes(args);

  const viewbackInstance = moduleRef.get(`VIEWBACKEND_${getViewBackendTypeName(viewBackendFn)}`);

  const functionName = viewBackendFn.name;

  if (actionOrLoader === 'loader') {
    if (!viewbackendConfig?.loaderMethods?.includes(functionName as any)) {
      throw new Error(`Couldn't find a loader with name ${functionName as any}`);
    }
  } else {
    if (!viewbackendConfig?.actionMethods?.includes(functionName as any)) {
      throw new Error(`Couldn't find an action with name ${functionName as any}`);
    }
  }

  const functionParams = await parseArgumentsAndPipe(
    viewbackInstance,
    functionName,
    moduleRef,
    req,
    args,
  );

  return viewbackInstance[functionName](...functionParams);
}
type Config = { index: number; data: any; pipes: Type[] };

export function wireLoader<LoaderFnT extends (...args: any) => any>(
  backendFnOrType: LoaderFnT | Type,
  loaderArgs: LoaderArgs,
): Promise<ReturnType<LoaderFnT>> {
  const type = backendFnOrType as any as Type;
  const backendFn = backendFnOrType as any as LoaderFnT;
  if (isConstructor(type)) {
    const loaderMethodNames = viewBackendMap.get(type.name)?.loaderMethods;
    if (!loaderMethodNames?.[0]?.length) {
      throw new Error(`Could not find an @Loader wiring for the provided type ${type.name}.`);
    }
    return wireLoader(type.prototype[loaderMethodNames[0]], loaderArgs);
  }

  return wireBackendFn('loader', backendFn, loaderArgs);
}

export function wireAction<ActionFnT extends (...args: any) => any>(
  backendFnOrType: ActionFnT | ActionFnT[] | Type,
  actionArgs: ActionArgs,
): Promise<ReturnType<ActionFnT>> {
  if (Array.isArray(backendFnOrType)) {
    const { req } = getReqAndRes(actionArgs);
    const routedActionFn =
      backendFnOrType.find((a) => getViewBackendMethod(a) === req.method) ||
      backendFnOrType.find((a) => getViewBackendMethod(a) === 'ALL');

    if (!routedActionFn) {
      throw new Error('Could not find an @Action wiring for the provided functions.');
    }

    return wireAction(routedActionFn, actionArgs);
  }

  const type = backendFnOrType as any as Type;
  const backendFn = backendFnOrType as any as ActionFnT;
  if (isConstructor(type)) {
    const actionMethodsNames = viewBackendMap.get(type.name)?.actionMethods;
    if (!actionMethodsNames?.[0]?.length) {
      throw new Error(`Could not find an @Loader wiring for the provided type ${type.name}.`);
    }
    const actionFns = actionMethodsNames.map((a) => type.prototype[a]) as ActionFnT[];
    return wireAction(actionFns, actionArgs);
  }

  return wireBackendFn('action', backendFn, actionArgs);
}
