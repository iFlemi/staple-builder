import { getFileContentsInDirectory } from "@/functions/loadFromFile"
import { fileDataToCardList } from "@/functions/cardNameListParser"
import { pipe } from "weland"
import { Result } from "@/utils/Result"

const directories = ["../utils/card-lists/static"]

export const loadAllCards = async (directories: string[]) => {
  const fileData = (
    await Promise.all(directories.map(getFileContentsInDirectory))
  ).flat()

  const cards = pipe(
    fileData.map(fileDataToCardList),
    Result.sequence,
    Result.map((r) => r.flat()),
  )
}
