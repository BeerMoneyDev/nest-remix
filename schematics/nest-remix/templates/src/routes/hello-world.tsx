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
