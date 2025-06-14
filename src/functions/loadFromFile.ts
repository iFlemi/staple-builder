import * as fs from "node:fs/promises"
import { FileData } from "@/domain/FileData"

export const getFileContentsInDirectory = async (
  directory: string,
): Promise<FileData[]> => {
  const files = await fs.readdir(directory)
  const fileCategory = mapDirectoryToCategory(directory)
  return Promise.all(
    files.map(async (f) => ({
      fileName: f,
      fileCategory,
      fileContents: await fs.readFile(`${directory}/${f}`, "utf-8"),
    })),
  )
}

export const mapDirectoryToCategory = (directory: string) =>
  //cbf to handle this properly
  directory.includes("uncommon")
    ? "uncommon"
    : directory.includes("rare")
      ? "rare"
      : "package"
