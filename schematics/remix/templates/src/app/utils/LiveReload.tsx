export const LiveReload =
  process.env.NODE_ENV !== 'development'
    ? () => null
    : function LiveReload({
        port = Number(process.env.REMIX_DEV_SERVER_WS_PORT || 8002),
      }: {
        port?: number;
      }) {
        const setupLiveReload = ((port: number) => {
          const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
          const host = location.hostname;
          const socketPath = `${protocol}//${host}:${port}/socket`;

          const ws = new WebSocket(socketPath);
          ws.onmessage = (message) => {
            const event = JSON.parse(message.data);
            if (event.type === 'LOG') {
              console.log(event.message);
            }
            if (event.type === 'RELOAD') {
              console.log('💿 Reloading window ...');
              window.location.reload();
            }
          };
          ws.onerror = (error) => {
            console.log('Remix dev asset server web socket error:');
            console.error(error);
          };
        }).toString();

        return (
          <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: `(${setupLiveReload})(${JSON.stringify(port)})`,
            }}
          />
        );
      };
