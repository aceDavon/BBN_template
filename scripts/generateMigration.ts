import fs from "fs"
import path from "path"

const generateMigration = (modelName: string): void => {
  if (!modelName) {
    console.error(
      "Model name is required. Usage: yarn generate-migration <modelName>"
    )
    process.exit(1)
  }

  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "")
  const fileName = `${timestamp}_create_${modelName.toLowerCase()}.ts`

  const migrationTemplate = `
import db from 'src/database/db';
import { PoolClient } from 'pg';

export const up = async (client: PoolClient): Promise<void> => {
  await client.query(\`
    CREATE TABLE ${modelName.toLowerCase()} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )\`
  );
};

export const down = async (): Promise<void> => {
  await db.query(\`
    DROP TABLE IF EXISTS ${modelName.toLowerCase()};
  \`);
};
`

  const migrationsDir = path.resolve(__dirname, "../src/migrations")
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir)
  }

  const filePath = path.join(migrationsDir, fileName)

  fs.writeFileSync(filePath, migrationTemplate, "utf8")
  console.log(`Migration file created: ${filePath}`)
}

const [, , modelName] = process.argv
generateMigration(modelName)
