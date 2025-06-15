import { describe, it } from "vitest"
import { getFileContentsInDirectory } from "@/functions/loadFromFile"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { assertThat, match, ofType, PrettyPrinter } from "mismatched"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe("loadFromFile local tests", () => {
  it("loads from card list file", async () => {
    const testPath = path.join(__dirname, "../../public/card-lists/static")
    const results = await getFileContentsInDirectory(testPath)
    assertThat(results.length).is(29)
    assertThat(results.map((f) => f.fileName)).is(
      match.array.every(match.ofType.string()),
    )
  })
})
