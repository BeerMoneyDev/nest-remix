export interface NpmScript {
  name: string;
  command: string;
}

export const npmScripts: NpmScript[] = [
  { name: "start:prod", command: "node dist/main" },
  { name: "build", command: "concurrently \"npm run build:nest\" \"npm run build:remix\" -n \"NEST,REMIX\"" },
  { name: "build:nest", command:  "rimraf dist; tsup" },
  { name: "build:remix", command: "rimraf build; remix build" },
  { name: "start:dev", command: "concurrently \"npm run start:dev:nest\" \"npm run start:dev:remix\" -n \"NEST,REMIX\"" },
  { name: "start:dev:nest", command: "rimraf dist; tsup --watch" },
  { name: "start:dev:remix", command: "rimraf build; remix watch" },
];