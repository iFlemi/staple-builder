import * as fs from "node:fs/promises"
import { FileData } from "@/domain/FileData"

export const getFileContentsInDirectory = async (
  directory: string,
): Promise<FileData[]> => {
  const files = await fs.readdir(directory)
  return Promise.all(
    files.map(async (f) => ({
      fileName: f,
      fileContents: await fs.readFile(`${directory}/${f}`, "utf-8"),
    })),
  )
}
