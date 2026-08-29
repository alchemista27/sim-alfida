#!/bin/bash
set -e

echo "1. Root Setup"
cat << 'INNER_EOF' > pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
INNER_EOF

cat << 'INNER_EOF' > turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {},
    "test": {},
    "typecheck": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
INNER_EOF

echo "2. Database Package"
mkdir -p packages/database/src
mv prisma packages/database/
cat << 'INNER_EOF' > packages/database/package.json
{
  "name": "@sim/database",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@prisma/client": "^6.2.1"
  },
  "devDependencies": {
    "prisma": "^6.2.1",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
}
INNER_EOF

cat << 'INNER_EOF' > packages/database/src/index.ts
export * from "./generated/client";
INNER_EOF

sed -i 's|output.*=.*"../../src/generated/client"|output = "../src/generated/client"|' packages/database/prisma/schema.prisma

echo "3. Shared Package"
mkdir -p packages/shared/src
mv src/lib/validators packages/shared/src/
mv src/types packages/shared/src/

cat << 'INNER_EOF' > packages/shared/package.json
{
  "name": "@sim/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
INNER_EOF

cat << 'INNER_EOF' > packages/shared/src/index.ts
export * from "./validators/auth";
export * from "./validators/unit";
export * from "./validators/ppdb";
export * from "./validators/academic";
export * from "./validators/activity-report";
export * from "./validators/attendance";
export * from "./validators/bpi";
export * from "./validators/department";
export * from "./validators/extracurricular";
export * from "./validators/journal";
export * from "./validators/leave-request";
export * from "./validators/lhbs";
export * from "./validators/murobbi";
export * from "./validators/mutabaah";
export * from "./validators/schedule";
export * from "./validators/spp";
export * from "./validators/staff-attendance";
export * from "./validators/work-program";
export * from "./types";
INNER_EOF

echo "4. Next.js Web App"
mkdir -p apps/web
mv src public tests next.config.ts tailwind.config.ts postcss.config.mjs next-env.d.ts vitest.config.ts apps/web/ || true
mv .eslintrc.json apps/web/ || true
mv tsconfig.json apps/web/ || true

cp package.json apps/web/package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('apps/web/package.json'));
pkg.name = '@sim/web';
pkg.dependencies['@sim/database'] = 'workspace:*';
pkg.dependencies['@sim/shared'] = 'workspace:*';
delete pkg.scripts['db:push'];
delete pkg.scripts['db:seed'];
delete pkg.scripts['db:studio'];
delete pkg.scripts['db:start'];
delete pkg.scripts['db:stop'];
delete pkg.prisma;
fs.writeFileSync('apps/web/package.json', JSON.stringify(pkg, null, 2));
"

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json'));
pkg.name = 'sim-alfida-monorepo';
pkg.dependencies = {};
pkg.devDependencies = {
  'turbo': 'latest',
  'typescript': '^5.7.3'
};
pkg.scripts = {
  'dev': 'turbo dev',
  'build': 'turbo build',
  'lint': 'turbo lint',
  'test': 'turbo test',
  'typecheck': 'turbo typecheck',
  'db:push': 'pnpm --filter @sim/database prisma db push',
  'db:seed': 'pnpm --filter @sim/database tsx prisma/seed.ts',
  'db:studio': 'pnpm --filter @sim/database prisma studio',
  'db:start': '/usr/lib/postgresql/18/bin/pg_ctl -D .pgdata -l .pgdata/pg.log -o \"-p 5433 -k .pgdata\" start',
  'db:stop': '/usr/lib/postgresql/18/bin/pg_ctl -D .pgdata stop'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

find apps/web/src -type f -name "*.ts" -o -name "*.tsx" -exec sed -i 's|@/generated/client|@sim/database|g' {} +
find apps/web/src -type f -name "*.ts" -o -name "*.tsx" -exec sed -i 's|@/types|@sim/shared|g' {} +
find apps/web/src -type f -name "*.ts" -o -name "*.tsx" -exec sed -i 's|@/lib/validators|@sim/shared|g' {} +

sed -i 's/const nextConfig: NextConfig = {/const nextConfig: NextConfig = {\n  transpilePackages: ["@sim\/shared", "@sim\/database"],/' apps/web/next.config.ts

echo "5. NestJS API App"
mkdir -p apps/api/src
cat << 'INNER_EOF' > apps/api/package.json
{
  "name": "@sim/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "start": "nest start",
    "dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1",
    "@sim/database": "workspace:*",
    "@sim/shared": "workspace:*"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/supertest": "^6.0.0",
    "jest": "^29.5.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  }
}
INNER_EOF

cat << 'INNER_EOF' > apps/api/tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
INNER_EOF

cat << 'INNER_EOF' > apps/api/nest-cli.json
{
  "$schema": "https://json.schema.org/draft-04/schema#",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
INNER_EOF

cat << 'INNER_EOF' > apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3001);
  console.log(\`Application is running on: \${await app.getUrl()}\`);
}
bootstrap();
INNER_EOF

cat << 'INNER_EOF' > apps/api/src/app.module.ts
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
INNER_EOF

echo "Done running script"
