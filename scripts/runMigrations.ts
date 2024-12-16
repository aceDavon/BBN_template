import fs from "fs"
import path from "path"

const runMigrations = async (direction: "up" | "down") => {
  const migrationsDir = path.resolve(__dirname, "../src/migrations")
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".ts"))

  for (const file of migrationFiles) {
    const { up, down } = await import(path.join(migrationsDir, file))
    if (direction === "up") {
      console.log(`Running migration: ${file}`)
      await up()
    } else if (direction === "down") {
      console.log(`Reverting migration: ${file}`)
      await down()
    }
  }

  console.log(
    `Migrations ${direction === "up" ? "applied" : "reverted"} successfully.`
  )
}

const [, , direction] = process.argv
if (direction !== "up" && direction !== "down") {
  console.error('Invalid direction. Use "up" or "down".')
  process.exit(1)
}

runMigrations(direction).catch((err) => {
  console.error("Migration error:", err)
  process.exit(1)
})
